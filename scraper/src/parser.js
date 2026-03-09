import * as cheerio from 'cheerio';
import { logger } from './logger.js';

/**
 * Parse an HTML page and extract product data using the given selectors.
 *
 * @param {string} html - Raw HTML content
 * @param {object} config - Source configuration with selectors and priceParser
 * @param {object} category - Category config with name and brandList
 * @returns {Array<object>} Parsed product objects
 */
export function parseProductPage(html, config, category = {}) {
  const $ = cheerio.load(html);
  const products = [];
  const { selectors, priceParser, baseUrl } = config;
  const categoryName = typeof category === 'string' ? category : category.name || '';
  const brandList = (typeof category === 'object' && category.brandList) || [];

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
      if (!price || price <= 0 || price > 500_000_000) return;

      // Extract link
      const linkEl = $el.find(selectors.productLink).first();
      let link = linkEl.attr('href') || '';
      if (link && !link.startsWith('http')) {
        link = baseUrl + link;
      }

      // Extract condition (e.g., "Brand New", "Used", "Foreign Used")
      let condition = null;
      if (selectors.productCondition) {
        const conditionEl = $el.find(selectors.productCondition).first();
        const conditionText = conditionEl.text().trim();
        if (conditionText && config.conditionParser) {
          condition = config.conditionParser(conditionText);
        }
      }

      // Extract location (e.g., "Lagos, Ikeja")
      let location = null;
      if (selectors.productLocation) {
        const locationEl = $el.find(selectors.productLocation).first();
        location = locationEl.text().trim() || null;
      }

      // Extract image URL (handles <picture> elements with webp sources)
      let imageUrl = null;
      if (selectors.productImage) {
        const imgEl = $el.find(selectors.productImage).first();
        imageUrl = imgEl.attr('src') || imgEl.attr('data-src') || null;
        // If no img found, try <source> inside <picture>
        if (!imageUrl) {
          const sourceEl = $el.find('.b-list-advert-base__img picture source').first();
          imageUrl = sourceEl.attr('srcset') || null;
        }
      }

      // Extract brand from title using the category's brand list
      let brand = null;
      if (brandList.length > 0 && config.extractBrand) {
        brand = config.extractBrand(name, brandList);
      }

      // Extract description snippet
      let description = null;
      if (selectors.productDescription) {
        const descEl = $el.find(selectors.productDescription).first();
        description = descEl.text().trim() || null;
      }

      // Extract original price (before discount)
      let originalPrice = null;
      if (selectors.productOriginalPrice) {
        const origPriceEl = $el.find(selectors.productOriginalPrice).first();
        const origPriceText = origPriceEl.text().trim();
        if (origPriceText) {
          originalPrice = priceParser(origPriceText);
        }
      }

      // Extract seller info
      let sellerVerified = false;
      if (selectors.sellerVerified) {
        sellerVerified = $el.find(selectors.sellerVerified).length > 0;
      }

      let sellerTier = null;
      if (selectors.sellerTier) {
        const tierEl = $el.find(selectors.sellerTier).first();
        sellerTier = tierEl.text().trim() || null;
      }

      products.push({
        name,
        price,
        originalPrice,
        link,
        condition,
        location,
        imageUrl,
        brand,
        description,
        sellerVerified,
        sellerTier,
      });
    } catch {
      // Skip malformed entries
    }
  });

  logger.debug(`Parsed ${products.length} valid products from ${categoryName}`, {}, config.source);
  return products;
}

/**
 * Build the next page URL using ?page=N pattern.
 * Jiji uses URL-param pagination, not next-page links in the DOM.
 *
 * @param {string} currentUrl - The current page URL
 * @param {number} currentPage - The current page number (1-based)
 * @param {object} config - Source config with itemsPerPage
 * @returns {string} The next page URL
 */
export function buildNextPageUrl(currentUrl, currentPage) {
  const url = new URL(currentUrl);
  url.searchParams.set('page', String(currentPage + 1));
  return url.toString();
}
