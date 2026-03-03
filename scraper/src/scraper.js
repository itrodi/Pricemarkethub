import { fetchPage, checkRobotsTxt } from './fetcher.js';
import { parseProductPage, getNextPageUrl } from './parser.js';
import { loadProductMap, loadLocationMap, insertPricePoints, refreshViews } from './database.js';
import { matchProducts } from './matcher.js';
import { logger } from './logger.js';
import { SOURCES } from '../config/sources.js';

const MAX_PAGES = parseInt(process.env.MAX_PAGES_PER_CATEGORY || '5', 10);

/**
 * Run a scraper for a specific source.
 *
 * @param {string} sourceKey - Key from SOURCES config (jumia, konga, jiji)
 * @returns {object} Summary of results
 */
export async function runScraper(sourceKey) {
  const config = SOURCES[sourceKey];
  if (!config) {
    logger.error(`Unknown source: ${sourceKey}`);
    return { source: sourceKey, error: 'Unknown source', totalMatched: 0, totalUnmatched: 0 };
  }

  logger.info(`=== Starting scraper for ${config.name} ===`, {}, sourceKey);

  // Check robots.txt
  const allowed = await checkRobotsTxt(config.baseUrl, sourceKey);
  if (!allowed) {
    logger.error(`Scraping not allowed by robots.txt for ${config.name}`, {}, sourceKey);
    return { source: sourceKey, error: 'Blocked by robots.txt', totalMatched: 0, totalUnmatched: 0 };
  }

  // Load reference data
  const productMap = await loadProductMap();
  const locationMap = await loadLocationMap();

  // Determine location ID
  const locationName = config.location.toLowerCase();
  const location = locationMap.get(locationName) || locationMap.get('lagos');
  const locationId = location?.id;

  if (!locationId && productMap.size > 0) {
    logger.warn(`No location found for "${config.location}". Using dry-run mode.`, {}, sourceKey);
  }

  let totalMatched = 0;
  let totalUnmatched = 0;
  const allPricePoints = [];
  const allUnmatched = [];

  // Scrape each category
  for (const category of config.categories) {
    logger.info(`Scraping category: ${category.name}`, {}, sourceKey);

    for (const urlPath of category.urls) {
      let url = config.baseUrl + urlPath;
      let page = 0;

      while (url && page < MAX_PAGES) {
        page++;
        logger.info(`Page ${page}: ${url}`, {}, sourceKey);

        const html = await fetchPage(url, sourceKey);
        if (!html) {
          logger.warn(`Failed to fetch page ${page}, skipping.`, {}, sourceKey);
          break;
        }

        // Parse products from the page
        const scrapedProducts = parseProductPage(html, config, category.name);

        if (scrapedProducts.length === 0) {
          logger.info(`No products found on page ${page}, stopping pagination.`, {}, sourceKey);
          break;
        }

        // Match against database
        if (productMap.size > 0 && locationId) {
          const { matched, unmatched } = matchProducts(
            scrapedProducts,
            productMap,
            locationId,
            config.source,
            category.subcategory
          );
          allPricePoints.push(...matched);
          allUnmatched.push(...unmatched);
          totalMatched += matched.length;
          totalUnmatched += unmatched.length;
        } else {
          // Dry-run: just log what we found
          logger.info(`Dry-run: found ${scrapedProducts.length} products`, {
            sample: scrapedProducts.slice(0, 3).map(p => `${p.name}: ₦${p.price.toLocaleString()}`),
          }, sourceKey);
          totalUnmatched += scrapedProducts.length;
        }

        // Check for next page
        url = getNextPageUrl(html, config);
      }
    }
  }

  // Insert matched price points
  if (allPricePoints.length > 0) {
    const { success, errors } = await insertPricePoints(allPricePoints);
    logger.info(`Inserted ${success} price points (${errors} errors)`, {}, sourceKey);
  }

  logger.info(`=== ${config.name} scrape complete ===`, {
    totalMatched,
    totalUnmatched,
    pricePointsInserted: allPricePoints.length,
  }, sourceKey);

  // Log unmatched for review
  if (allUnmatched.length > 0) {
    logger.info('Top unmatched products for review:', {
      products: allUnmatched.slice(0, 20).map(u => `${u.name} (₦${u.price.toLocaleString()})`)
    }, sourceKey);
  }

  return {
    source: sourceKey,
    name: config.name,
    totalMatched,
    totalUnmatched,
    pricePointsInserted: allPricePoints.length,
  };
}

/**
 * Run all configured scrapers.
 */
export async function runAllScrapers() {
  logger.info('====================================');
  logger.info('Starting PriceWise scraper run');
  logger.info('====================================');

  const startTime = Date.now();
  const results = [];

  for (const sourceKey of Object.keys(SOURCES)) {
    try {
      const result = await runScraper(sourceKey);
      results.push(result);
    } catch (err) {
      logger.error(`Scraper ${sourceKey} failed with error: ${err.message}`, {}, sourceKey);
      results.push({ source: sourceKey, error: err.message, totalMatched: 0, totalUnmatched: 0 });
    }
  }

  // Refresh materialized views after all scrapers
  await refreshViews();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  logger.info('====================================');
  logger.info(`Scrape run complete in ${elapsed}s`);
  for (const r of results) {
    if (r.error) {
      logger.info(`  ${r.source}: ERROR - ${r.error}`);
    } else {
      logger.info(`  ${r.source}: ${r.totalMatched} matched, ${r.totalUnmatched} unmatched, ${r.pricePointsInserted || 0} inserted`);
    }
  }
  logger.info('====================================');

  return results;
}
