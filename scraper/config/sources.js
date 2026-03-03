/**
 * Scraper source configurations.
 * Each source defines the target site, category URLs, and CSS selectors
 * for extracting product data.
 */

export const SOURCES = {
  jumia: {
    name: 'Jumia Nigeria',
    baseUrl: 'https://www.jumia.com.ng',
    source: 'jumia',
    location: 'Online',
    categories: [
      {
        name: 'Phones',
        categoryId: 'cat-electronics',
        subcategory: 'Phones',
        urls: [
          '/phones-tablets/smartphones/',
        ],
      },
      {
        name: 'Laptops',
        categoryId: 'cat-electronics',
        subcategory: 'Laptops',
        urls: [
          '/computing/laptops/',
        ],
      },
      {
        name: 'Groceries',
        categoryId: 'cat-agriculture',
        subcategory: 'Grains',
        urls: [
          '/grocery/food-cupboard/grains-rice-pasta-noodles/',
          '/grocery/food-cupboard/flours-meals/',
        ],
      },
      {
        name: 'Cooking Oils',
        categoryId: 'cat-agriculture',
        subcategory: 'Cooking Oil',
        urls: [
          '/grocery/food-cupboard/cooking-oils/',
        ],
      },
    ],
    selectors: {
      productCard: 'article.prd',
      productName: 'h3.name',
      productPrice: '.prc',
      productLink: 'a.core',
      nextPage: 'a[aria-label="Next page"]',
    },
    priceParser(text) {
      // Jumia format: "₦ 75,000" or "₦ 75,000 - ₦ 85,000"
      const match = text.replace(/[₦,\s]/g, '').match(/^(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    },
  },

  konga: {
    name: 'Konga',
    baseUrl: 'https://www.konga.com',
    source: 'konga',
    location: 'Online',
    categories: [
      {
        name: 'Phones',
        categoryId: 'cat-electronics',
        subcategory: 'Phones',
        urls: [
          '/category/phones-tablets-5294',
        ],
      },
      {
        name: 'Laptops',
        categoryId: 'cat-electronics',
        subcategory: 'Laptops',
        urls: [
          '/category/laptops-5296',
        ],
      },
      {
        name: 'Groceries',
        categoryId: 'cat-agriculture',
        subcategory: 'Grains',
        urls: [
          '/category/food-702',
        ],
      },
    ],
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

  jiji: {
    name: 'Jiji Nigeria',
    baseUrl: 'https://jiji.ng',
    source: 'jiji',
    location: 'Online',
    categories: [
      {
        name: 'Phones',
        categoryId: 'cat-electronics',
        subcategory: 'Phones',
        urls: [
          '/mobile-phones',
        ],
      },
      {
        name: 'Vehicles',
        categoryId: 'cat-transportation',
        subcategory: 'Vehicles',
        urls: [
          '/cars',
        ],
      },
      {
        name: 'Real Estate',
        categoryId: 'cat-real-estate',
        subcategory: 'Rent',
        urls: [
          '/real-estate/flats-and-apartments-for-rent',
        ],
      },
    ],
    selectors: {
      productCard: '.b-list-advert__item-wrapper, .b-advert-card, [data-advid]',
      productName: '.b-advert-title-inner, .advert-title, h3',
      productPrice: '.qa-advert-price, .advert-price, .price',
      productLink: 'a',
      nextPage: 'a.b-pagination__next, a[rel="next"]',
    },
    priceParser(text) {
      // Jiji format: "₦ 150,000" or "₦150000"
      const match = text.replace(/[₦,\s]/g, '').match(/(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    },
  },
};
