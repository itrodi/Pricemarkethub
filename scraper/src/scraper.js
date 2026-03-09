import { fetchPage, checkRobotsTxt } from './fetcher.js';
import { parseProductPage, buildNextPageUrl } from './parser.js';
import {
  loadCategoryMap,
  loadSubcategoryMap,
  loadLocationMap,
  findOrCreateProduct,
  resolveLocation,
  insertPricePoints,
  refreshViews,
} from './database.js';
import { logger } from './logger.js';
import { SOURCES } from '../config/sources.js';

const MAX_PAGES = parseInt(process.env.MAX_PAGES_PER_CATEGORY || '5', 10);

/**
 * Run a scraper for a specific source.
 * The flow:
 *   1. Scrape product listings from the source
 *   2. For each scraped product, find or create it in the products table
 *   3. Insert price points for each product
 *
 * @param {string} sourceKey - Key from SOURCES config (e.g., 'jiji')
 * @returns {object} Summary of results
 */
export async function runScraper(sourceKey) {
  const config = SOURCES[sourceKey];
  if (!config) {
    logger.error(`Unknown source: ${sourceKey}`);
    return { source: sourceKey, error: 'Unknown source', productsCreated: 0, pricePointsInserted: 0 };
  }

  logger.info(`=== Starting scraper for ${config.name} ===`, {}, sourceKey);

  // Check robots.txt
  const allowed = await checkRobotsTxt(config.baseUrl, sourceKey);
  if (!allowed) {
    logger.error(`Scraping not allowed by robots.txt for ${config.name}`, {}, sourceKey);
    return { source: sourceKey, error: 'Blocked by robots.txt', productsCreated: 0, pricePointsInserted: 0 };
  }

  // Load reference data
  const categoryMap = await loadCategoryMap();
  const subcategoryMap = await loadSubcategoryMap();
  const locationMap = await loadLocationMap();

  let totalProductsCreated = 0;
  let totalProductsSkipped = 0;
  let totalScraped = 0;
  const allPricePoints = [];

  // Scrape each category
  for (const category of config.categories) {
    logger.info(`Scraping category: ${category.name}`, {}, sourceKey);

    // Resolve category and subcategory IDs
    const cat = categoryMap.get(category.categorySlug);
    const subcat = subcategoryMap.get(category.subcategorySlug);

    if (!cat) {
      logger.error(`Category "${category.categorySlug}" not found in DB. Run seed.sql first.`, {}, sourceKey);
      continue;
    }

    const categoryId = cat.id;
    const subcategoryId = subcat?.id || null;

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

        // Parse products from the page, passing the full category for brand extraction
        const scrapedProducts = parseProductPage(html, config, category);
        totalScraped += scrapedProducts.length;

        if (scrapedProducts.length === 0) {
          logger.info(`No products found on page ${page}, stopping pagination.`, {}, sourceKey);
          break;
        }

        logger.info(`Found ${scrapedProducts.length} products on page ${page}`, {}, sourceKey);

        // Process each scraped product: find-or-create, then create price point
        for (const scraped of scrapedProducts) {
          const product = await findOrCreateProduct(scraped, categoryId, subcategoryId, config.source, subcat?.name || category.name);

          if (!product) {
            totalProductsSkipped++;
            continue;
          }

          totalProductsCreated++;

          // Resolve location from the scraped text (e.g., "Lagos, Ikeja")
          const locationId = resolveLocation(scraped.location, locationMap);

          if (locationId) {
            allPricePoints.push({
              product_id: product.id,
              location_id: locationId,
              price: scraped.price,
              currency: 'NGN',
              source: config.source,
              verified: false,
              location_text: scraped.location || null,
              recorded_at: new Date().toISOString(),
            });
          }
        }

        // URL-based pagination: build next page URL using ?page=N
        if (page < MAX_PAGES) {
          url = buildNextPageUrl(url, page);
        } else {
          url = null;
        }
      }
    }
  }

  // Insert all price points
  let pricePointsInserted = 0;
  if (allPricePoints.length > 0) {
    const { success, errors } = await insertPricePoints(allPricePoints);
    pricePointsInserted = success;
    logger.info(`Inserted ${success} price points (${errors} errors)`, {}, sourceKey);
  }

  logger.info(`=== ${config.name} scrape complete ===`, {
    totalScraped,
    productsProcessed: totalProductsCreated,
    productsSkipped: totalProductsSkipped,
    pricePointsInserted,
  }, sourceKey);

  return {
    source: sourceKey,
    name: config.name,
    totalScraped,
    productsCreated: totalProductsCreated,
    pricePointsInserted,
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
      results.push({ source: sourceKey, error: err.message, productsCreated: 0, pricePointsInserted: 0 });
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
      logger.info(`  ${r.source}: ${r.totalScraped} scraped, ${r.productsCreated} products, ${r.pricePointsInserted} prices`);
    }
  }
  logger.info('====================================');

  return results;
}
