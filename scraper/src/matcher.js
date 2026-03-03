import { logger } from './logger.js';

/**
 * Match scraped product names against the PriceWise product database.
 *
 * Uses multiple strategies:
 * 1. Exact match (case-insensitive)
 * 2. Contains match (scraped name contains DB product name or vice versa)
 * 3. Keyword match (shared significant words)
 */

/**
 * Find the best matching product from the database for a scraped item.
 *
 * @param {string} scrapedName - The product name from the scraped site
 * @param {Map<string, object>} productMap - Map of lowercase product name -> product record
 * @param {string} subcategory - Expected subcategory for filtering
 * @returns {object|null} Matched product record, or null
 */
export function findMatchingProduct(scrapedName, productMap, subcategory = '') {
  const normalized = scrapedName.toLowerCase().trim();

  // Strategy 1: Exact match
  if (productMap.has(normalized)) {
    return productMap.get(normalized);
  }

  // Strategy 2: Check if any DB product name is contained in the scraped name
  for (const [dbName, product] of productMap.entries()) {
    // Skip if subcategory doesn't match (when specified)
    if (subcategory && product.subcategory &&
        product.subcategory.toLowerCase() !== subcategory.toLowerCase()) {
      continue;
    }

    if (normalized.includes(dbName) || dbName.includes(normalized)) {
      return product;
    }
  }

  // Strategy 3: Keyword matching (at least 2 significant words must match)
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'for', 'in', 'on', 'at', 'to', 'of', 'with', 'by', 'per', 'new', 'used']);
  const scrapedWords = normalized
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopWords.has(w));

  let bestMatch = null;
  let bestScore = 0;

  for (const [dbName, product] of productMap.entries()) {
    if (subcategory && product.subcategory &&
        product.subcategory.toLowerCase() !== subcategory.toLowerCase()) {
      continue;
    }

    const dbWords = dbName
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1 && !stopWords.has(w));

    const matchedWords = scrapedWords.filter(w => dbWords.some(dw => dw.includes(w) || w.includes(dw)));
    const score = matchedWords.length / Math.max(dbWords.length, 1);

    if (score > bestScore && matchedWords.length >= 2) {
      bestScore = score;
      bestMatch = product;
    }
  }

  if (bestMatch && bestScore >= 0.5) {
    return bestMatch;
  }

  return null;
}

/**
 * Process a batch of scraped products, matching them against the database
 * and returning price points ready for insertion.
 *
 * @param {Array} scrapedProducts - Array of {name, price, link}
 * @param {Map} productMap - Product name -> product record
 * @param {string} locationId - Location ID for these prices
 * @param {string} source - Source identifier (jumia, konga, jiji)
 * @param {string} subcategory - Subcategory for filtering matches
 * @returns {{ matched: Array, unmatched: Array }}
 */
export function matchProducts(scrapedProducts, productMap, locationId, source, subcategory = '') {
  const matched = [];
  const unmatched = [];
  const seen = new Set(); // Dedupe by product ID

  for (const scraped of scrapedProducts) {
    const product = findMatchingProduct(scraped.name, productMap, subcategory);

    if (product && !seen.has(product.id)) {
      seen.add(product.id);
      matched.push({
        product_id: product.id,
        location_id: locationId,
        price: scraped.price,
        currency: 'NGN',
        source,
        verified: false,
        recorded_at: new Date().toISOString(),
      });
    } else if (!product) {
      unmatched.push({
        name: scraped.name,
        price: scraped.price,
        source,
      });
    }
  }

  logger.info(`Matching results: ${matched.length} matched, ${unmatched.length} unmatched`, {}, source);

  if (unmatched.length > 0) {
    logger.debug('Unmatched products (first 10):', {
      products: unmatched.slice(0, 10).map(u => `${u.name} (₦${u.price.toLocaleString()})`)
    }, source);
  }

  return { matched, unmatched };
}
