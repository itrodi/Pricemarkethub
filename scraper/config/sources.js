/**
 * Scraper source configurations.
 * Each source defines the target site, category URLs, and CSS selectors
 * for extracting product data.
 */

export const SOURCES = {
  jiji: {
    name: 'Jiji Nigeria',
    baseUrl: 'https://jiji.ng',
    source: 'jiji',
    categories: [
      {
        name: 'Mobile Phones',
        categorySlug: 'mobile-devices',
        subcategorySlug: 'mobile-phones',
        urls: [
          '/mobile-phones',
        ],
      },
      // More subcategories will be added as we configure them:
      // { name: 'Tablets', subcategorySlug: 'tablets', urls: ['/tablets'] },
      // { name: 'Smart Watches', subcategorySlug: 'smart-watches', urls: ['/smart-watches'] },
      // { name: 'Phone Accessories', subcategorySlug: 'phone-accessories', urls: ['/cell-phones-tablets-accessories'] },
      // { name: 'Headphones', subcategorySlug: 'headphones', urls: ['/headphones'] },
    ],
    selectors: {
      // Jiji gallery-view listing selectors (confirmed from live HTML)
      productCard: '.b-list-advert__gallery__item',
      productName: '.b-advert-title-inner',
      productPrice: '.qa-advert-price',
      productLink: 'a.b-list-advert-base',
      productCondition: '.b-list-advert-base__item-attr',
      productLocation: '.b-list-advert__region__text',
      productImage: '.b-list-advert-base__img img',
      nextPage: 'a.b-pagination__next, a[rel="next"]',
    },
    priceParser(text) {
      // Jiji format: "₦ 150,000" or "₦150000"
      const match = text.replace(/[₦,\s]/g, '').match(/(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    },
    conditionParser(text) {
      // Map Jiji condition labels to our DB enum values
      const t = text.toLowerCase().trim();
      if (t === 'brand new') return 'brand_new';
      if (t === 'used') return 'used';
      if (t === 'foreign used') return 'foreign_used';
      if (t === 'local used' || t === 'locally used') return 'local_used';
      if (t === 'refurbished') return 'refurbished';
      return null;
    },
  },

  // Jumia and Konga will be reconfigured later per category
  // keeping them commented out so only Jiji runs for now
  /*
  jumia: {
    name: 'Jumia Nigeria',
    baseUrl: 'https://www.jumia.com.ng',
    source: 'jumia',
    categories: [],
    selectors: {
      productCard: 'article.prd',
      productName: 'h3.name',
      productPrice: '.prc',
      productLink: 'a.core',
      nextPage: 'a[aria-label="Next page"]',
    },
    priceParser(text) {
      const match = text.replace(/[₦,\s]/g, '').match(/^(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    },
  },

  konga: {
    name: 'Konga',
    baseUrl: 'https://www.konga.com',
    source: 'konga',
    categories: [],
    selectors: {
      productCard: '.product-card, [data-testid="product-card"], .sku',
      productName: '.product-name, .name, h3',
      productPrice: '.product-price, .price, .amount',
      productLink: 'a',
      nextPage: '.pagination a:last-child, a[rel="next"]',
    },
    priceParser(text) {
      const match = text.replace(/[₦,\s]/g, '').match(/(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    },
  },
  */
};
