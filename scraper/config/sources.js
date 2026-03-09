/**
 * Scraper source configurations.
 * Each source defines the target site, category URLs, and CSS selectors
 * for extracting product data.
 *
 * Updated based on live analysis of Jiji.ng HTML structure (March 2026).
 * Jiji uses a Nuxt.js SSR app with masonry gallery layout.
 */

/**
 * Known phone brands on Jiji (used for brand extraction from titles).
 */
const PHONE_BRANDS = [
  'Apple', 'Samsung', 'Xiaomi', 'Google', 'Tecno', 'Infinix', 'Itel',
  'Huawei', 'Oppo', 'Vivo', 'Realme', 'OnePlus', 'Nokia', 'Motorola',
  'Sony', 'LG', 'HTC', 'BlackBerry', 'Honor', 'Nothing Phone', 'ZTE',
  'Gionee', 'Lenovo', 'Asus', 'HMD', 'Villaon', 'Bontel', 'TCL',
  'Ulefone', 'Umidigi', 'Blackview', 'Doogee', 'Oukitel', 'BLU',
  'Maxfone', 'Thuraya', 'Iridium', 'Razer', 'Meizu', 'Cat',
];

/**
 * Known laptop brands (used for brand extraction from titles).
 */
const LAPTOP_BRANDS = [
  'Apple', 'HP', 'Dell', 'Lenovo', 'Asus', 'Acer', 'Microsoft',
  'Samsung', 'Toshiba', 'MSI', 'Razer', 'Huawei', 'Google',
  'LG', 'Sony', 'Fujitsu', 'Panasonic',
];

/**
 * Extract brand from a product title using a known brand list.
 */
function extractBrand(title, brandList) {
  const lower = title.toLowerCase();
  for (const brand of brandList) {
    if (lower.includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return null;
}

/**
 * Extract product specs from title text.
 * Jiji titles often include storage, RAM, color, and model info.
 * E.g., "Apple iPhone 15 Pro Max 256GB 8GB RAM Blue" or "Samsung Galaxy S24 Ultra 512GB/12GB Titanium Black"
 */
function extractSpecs(title) {
  const specs = {};

  // Storage: 32GB, 64GB, 128GB, 256GB, 512GB, 1TB, 2TB
  const storageMatch = title.match(/\b(\d+)\s*(GB|TB)\b/i);
  if (storageMatch) {
    const value = parseInt(storageMatch[1], 10);
    const unit = storageMatch[2].toUpperCase();
    // If value <= 16 and unit is GB, likely RAM not storage (unless it's the only spec)
    if (unit === 'TB' || value >= 32) {
      specs.storage = `${value}${unit}`;
    }
  }

  // RAM: "8GB RAM", "12GB RAM", "6/128", "8/256", "512GB/12GB"
  const ramPatterns = [
    /\b(\d+)\s*GB\s*RAM\b/i,                    // "8GB RAM"
    /\bRAM\s*(\d+)\s*GB\b/i,                     // "RAM 8GB"
    /\b(\d+)\s*\/\s*(\d+)\s*GB?\b/,              // "8/256" or "12/512GB" (RAM/Storage)
    /\b(\d+)\s*GB\s*\/\s*(\d+)\s*GB\b/i,         // "512GB/12GB" (Storage/RAM)
  ];

  for (const pattern of ramPatterns) {
    const match = title.match(pattern);
    if (match) {
      if (pattern === ramPatterns[2]) {
        // "8/256" format — first number is RAM, second is storage
        const ram = parseInt(match[1], 10);
        const storage = parseInt(match[2], 10);
        if (ram <= 24) specs.ram = `${ram}GB`;
        if (storage >= 32) specs.storage = `${storage}GB`;
      } else if (pattern === ramPatterns[3]) {
        // "512GB/12GB" — larger is storage, smaller is RAM
        const first = parseInt(match[1], 10);
        const second = parseInt(match[2], 10);
        if (first > second) {
          specs.storage = `${first}GB`;
          specs.ram = `${second}GB`;
        } else {
          specs.ram = `${first}GB`;
          specs.storage = `${second}GB`;
        }
      } else {
        specs.ram = `${match[1]}GB`;
      }
      break;
    }
  }

  // If we found storage but not RAM from the main pattern, check for a second GB value
  if (specs.storage && !specs.ram) {
    const allGb = [...title.matchAll(/\b(\d+)\s*GB\b/gi)];
    if (allGb.length >= 2) {
      const values = allGb.map(m => parseInt(m[1], 10));
      const smaller = Math.min(...values);
      if (smaller <= 24 && smaller !== parseInt(specs.storage)) {
        specs.ram = `${smaller}GB`;
      }
    }
  }

  // Color: common phone/device colors
  const COLORS = [
    'Black', 'White', 'Blue', 'Red', 'Green', 'Gold', 'Silver', 'Grey', 'Gray',
    'Purple', 'Pink', 'Yellow', 'Orange', 'Coral', 'Midnight', 'Starlight',
    'Space Gray', 'Space Grey', 'Titanium Black', 'Titanium Blue', 'Titanium Gray',
    'Titanium Natural', 'Titanium White', 'Desert Titanium', 'Natural Titanium',
    'Sierra Blue', 'Alpine Green', 'Deep Purple', 'Phantom Black', 'Cream',
    'Graphite', 'Pacific Blue', 'Midnight Green', 'Rose Gold', 'Lavender',
    'Burgundy', 'Mint', 'Violet', 'Bronze', 'Mystic Bronze',
  ];
  const lower = title.toLowerCase();
  for (const color of COLORS) {
    if (lower.includes(color.toLowerCase())) {
      specs.color = color;
      break;
    }
  }

  return Object.keys(specs).length > 0 ? specs : null;
}

/**
 * Parse price from Jiji's format: "₦ 150,000" or "₦150,000" or "₦ 1,320,000"
 */
function jijiPriceParser(text) {
  const cleaned = text.replace(/[₦,\s]/g, '');
  const match = cleaned.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Map Jiji condition labels to our DB values.
 */
function jijiConditionParser(text) {
  const t = text.toLowerCase().trim();
  if (t === 'brand new') return 'brand_new';
  if (t === 'used') return 'used';
  if (t === 'foreign used') return 'foreign_used';
  if (t === 'local used' || t === 'locally used') return 'local_used';
  if (t === 'refurbished') return 'refurbished';
  return null;
}

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
        urls: ['/mobile-phones'],
        brandList: PHONE_BRANDS,
      },
      {
        name: 'Tablets',
        categorySlug: 'mobile-devices',
        subcategorySlug: 'tablets',
        urls: ['/tablets'],
        brandList: PHONE_BRANDS,
      },
      {
        name: 'Smart Watches',
        categorySlug: 'mobile-devices',
        subcategorySlug: 'smart-watches',
        urls: ['/smart-watches'],
        brandList: [...PHONE_BRANDS, 'Garmin', 'Fitbit', 'Amazfit'],
      },
      {
        name: 'Phone Accessories',
        categorySlug: 'mobile-devices',
        subcategorySlug: 'phone-accessories',
        urls: ['/cell-phones-tablets-accessories'],
        brandList: PHONE_BRANDS,
      },
      {
        name: 'Laptops & Computers',
        categorySlug: 'computing-electronics',
        subcategorySlug: 'laptops-computers',
        urls: ['/computers-and-laptops'],
        brandList: LAPTOP_BRANDS,
      },
    ],

    /**
     * Selectors for Jiji's gallery-view listing.
     *
     * DOM structure (confirmed from live HTML March 2026):
     *   .masonry-wall > .masonry-column > [data-column] > .masonry-item >
     *     .b-list-advert__gallery__item.js-advert-list-item >
     *       a.b-list-advert-base.qa-advert-list-item
     *         > .b-list-advert-base__img__wrapper (images, labels, pkg badge)
     *         > .b-list-advert-base__data (price, title, condition, location)
     */
    selectors: {
      // The wrapper div for each listing card. Some may be empty (ad slots).
      productCard: '.b-list-advert__gallery__item.js-advert-list-item',
      // The <a> tag inside the card that has href and contains all data
      productLink: 'a.qa-advert-list-item',
      // Title text
      productName: '.b-advert-title-inner.qa-advert-title',
      // Price (formatted as "₦ 350,000")
      productPrice: '.qa-advert-price',
      // Original price before discount (if present)
      productOriginalPrice: '.b-advert-discounted-price__price',
      // Discount percentage text (e.g., "-1%")
      productDiscount: '.b-advert-discounted-price__percents',
      // Condition badge (e.g., "Brand New", "Used")
      productCondition: '.b-list-advert-base__item-attr',
      // Location text (e.g., "Lagos, Ikeja")
      productLocation: '.b-list-advert__region__text',
      // Product image (inside <picture> element)
      productImage: '.b-list-advert-base__img picture img',
      // Description snippet
      productDescription: '.b-list-advert-base__description-text',
      // Seller verification badge
      sellerVerified: '.b-list-advert-base__label--blue',
      // Seller tier badge (DIAMOND, VIP, ENTERPRISE, PREMIUM)
      sellerTier: '.b-list-advert-base__pkg-label',
      // Seller tenure label (e.g., "5+ years on Jiji")
      sellerTenure: '.b-list-advert-base__label',
    },

    /**
     * Pagination: Jiji uses ?page=N URL params, 24 items per page.
     * We generate the next URL ourselves rather than looking for a next-page link.
     */
    itemsPerPage: 24,

    priceParser: jijiPriceParser,
    conditionParser: jijiConditionParser,
    extractBrand,
    extractSpecs,
  },

  // Jumia and Konga will be reconfigured later per category
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
    },
    itemsPerPage: 40,
    priceParser: jijiPriceParser,
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
    },
    itemsPerPage: 40,
    priceParser: jijiPriceParser,
  },
  */
};
