import * as cheerio from 'cheerio';
import { logger } from './logger.js';

/**
 * Parse an HTML page and extract product data using the given selectors.
 *
 * @param {string} html - Raw HTML content
 * @param {object} config - Source configuration with selectors and priceParser
 * @param {string} categoryName - Name of the category being scraped
 * @returns {Array<{name: string, price: number, link: string, condition: string|null, location: string|null, imageUrl: string|null}>}
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
      if (!price || price <= 0 || price > 500_000_000) return; // Sanity check (cars can be expensive)

      // Extract link
      const linkEl = $el.find(selectors.productLink).first();
      let link = linkEl.attr('href') || '';
      if (link && !link.startsWith('http')) {
        link = baseUrl + link;
      }

      // Extract condition (Jiji-specific: "Brand New", "Used", "Foreign Used", etc.)
      let condition = null;
      if (selectors.productCondition) {
        const conditionEl = $el.find(selectors.productCondition).first();
        const conditionText = conditionEl.text().trim();
        if (conditionText && config.conditionParser) {
          condition = config.conditionParser(conditionText);
        }
      }

      // Extract location (Jiji-specific: "Lagos, Ikeja")
      let location = null;
      if (selectors.productLocation) {
        const locationEl = $el.find(selectors.productLocation).first();
        location = locationEl.text().trim() || null;
      }

      // Extract image URL
      let imageUrl = null;
      if (selectors.productImage) {
        const imgEl = $el.find(selectors.productImage).first();
        imageUrl = imgEl.attr('src') || imgEl.attr('data-src') || null;
      }

      products.push({ name, price, link, condition, location, imageUrl });
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
