import * as cheerio from 'cheerio';
import { logger } from './logger.js';

/**
 * Parse an HTML page and extract product data using the given selectors.
 *
 * @param {string} html - Raw HTML content
 * @param {object} config - Source configuration with selectors and priceParser
 * @param {string} categoryName - Name of the category being scraped
 * @returns {Array<{name: string, price: number, link: string}>}
 */
export function parseProductPage(html, config, categoryName = '') {
  const $ = cheerio.load(html);
  const products = [];
  const { selectors, priceParser, baseUrl } = config;

  const cards = $(selectors.productCard);
  logger.debug(`Found ${cards.length} product cards for ${categoryName}`, {}, config.source);

  cards.each((_index, element) => {
    try {
      const $el = $(element);

      // Extract product name
      const nameEl = $el.find(selectors.productName).first();
      const name = nameEl.text().trim();
      if (!name) return;

      // Extract price
      const priceEl = $el.find(selectors.productPrice).first();
      const priceText = priceEl.text().trim();
      if (!priceText) return;

      const price = priceParser(priceText);
      if (!price || price <= 0 || price > 100_000_000) return; // Sanity check

      // Extract link
      const linkEl = $el.find(selectors.productLink).first();
      let link = linkEl.attr('href') || '';
      if (link && !link.startsWith('http')) {
        link = baseUrl + link;
      }

      products.push({ name, price, link });
    } catch {
      // Skip malformed entries
    }
  });

  logger.debug(`Parsed ${products.length} valid products from ${categoryName}`, {}, config.source);
  return products;
}

/**
 * Check if there's a next page link.
 */
export function getNextPageUrl(html, config) {
  const $ = cheerio.load(html);
  const nextEl = $(config.selectors.nextPage).first();

  if (!nextEl.length) return null;

  let href = nextEl.attr('href');
  if (!href) return null;

  if (!href.startsWith('http')) {
    href = config.baseUrl + href;
  }

  return href;
}

/**
 * Normalize a product name for matching against the database.
 * Strips common suffixes, standardizes spacing, etc.
 */
export function normalizeProductName(name) {
  return name
    .replace(/\s+/g, ' ')
    .replace(/[""'']/g, '')
    .trim();
}
