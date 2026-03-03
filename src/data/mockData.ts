import type {
  Category,
  Location,
  Product,
  PricePoint,
  ProductPriceSummary,
  LatestPrice,
  PriceChange,
  PriceHistoryPoint,
} from '../types/database';

// ============================================
// CATEGORIES
// ============================================
export const categories: Category[] = [
  {
    id: 'cat-agriculture',
    name: 'Agriculture',
    slug: 'agriculture',
    icon: 'wheat',
    description: 'Food staples, grains, tubers, livestock, vegetables, and other agricultural produce',
    color: '#10b981',
    display_order: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-oil-gas',
    name: 'Oil & Gas',
    slug: 'oil-gas',
    icon: 'fuel',
    description: 'Petroleum products, cooking gas, diesel, kerosene, and other energy commodities',
    color: '#f59e0b',
    display_order: 2,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-electronics',
    name: 'Electronics',
    slug: 'electronics',
    icon: 'smartphone',
    description: 'Phones, laptops, tablets, TVs, and other consumer electronics',
    color: '#3b82f6',
    display_order: 3,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-currency',
    name: 'Currency',
    slug: 'currency',
    icon: 'banknote',
    description: 'Foreign exchange rates, parallel market rates, and cryptocurrency',
    color: '#8b5cf6',
    display_order: 4,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-real-estate',
    name: 'Real Estate',
    slug: 'real-estate',
    icon: 'building',
    description: 'Rent prices, property values, and building materials',
    color: '#ec4899',
    display_order: 5,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-transportation',
    name: 'Transportation',
    slug: 'transportation',
    icon: 'car',
    description: 'Vehicle prices, spare parts, ride-hailing fares, and public transport costs',
    color: '#06b6d4',
    display_order: 6,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-hospitality',
    name: 'Hospitality',
    slug: 'hospitality',
    icon: 'utensils',
    description: 'Hotel rates, restaurant prices, and food service costs',
    color: '#f97316',
    display_order: 7,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-commodities',
    name: 'Commodities',
    slug: 'commodities',
    icon: 'gem',
    description: 'Raw materials, cement, iron rods, timber, and industrial commodities',
    color: '#64748b',
    display_order: 8,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

// ============================================
// LOCATIONS
// ============================================
export const locations: Location[] = [
  { id: 'loc-lagos', name: 'Lagos', state: 'Lagos', region: 'South West', location_type: 'city', latitude: 6.5244, longitude: 3.3792, is_major: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'loc-abuja', name: 'Abuja', state: 'FCT', region: 'North Central', location_type: 'city', latitude: 9.0579, longitude: 7.4951, is_major: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'loc-port-harcourt', name: 'Port Harcourt', state: 'Rivers', region: 'South South', location_type: 'city', latitude: 4.8156, longitude: 7.0498, is_major: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'loc-kano', name: 'Kano', state: 'Kano', region: 'North West', location_type: 'city', latitude: 12.0022, longitude: 8.5920, is_major: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'loc-ibadan', name: 'Ibadan', state: 'Oyo', region: 'South West', location_type: 'city', latitude: 7.3775, longitude: 3.9470, is_major: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'loc-enugu', name: 'Enugu', state: 'Enugu', region: 'South East', location_type: 'city', latitude: 6.4584, longitude: 7.5464, is_major: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'loc-kaduna', name: 'Kaduna', state: 'Kaduna', region: 'North West', location_type: 'city', latitude: 10.5105, longitude: 7.4165, is_major: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'loc-benin', name: 'Benin City', state: 'Edo', region: 'South South', location_type: 'city', latitude: 6.3350, longitude: 5.6037, is_major: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'loc-warri', name: 'Warri', state: 'Delta', region: 'South South', location_type: 'city', latitude: 5.5167, longitude: 5.7500, is_major: false, created_at: '2025-01-01T00:00:00Z' },
  { id: 'loc-aba', name: 'Aba', state: 'Abia', region: 'South East', location_type: 'city', latitude: 5.1066, longitude: 7.3667, is_major: false, created_at: '2025-01-01T00:00:00Z' },
];

// ============================================
// PRODUCTS
// ============================================
export const products: Product[] = [
  // Agriculture
  { id: 'prod-rice-50kg', name: 'Rice (50kg bag)', slug: 'rice-50kg', category_id: 'cat-agriculture', subcategory: 'Grains', unit: 'per 50kg bag', description: 'Local and imported rice in 50kg bags', image_url: null, is_featured: true, view_count: 15420, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'prod-beans-paint', name: 'Beans (paint bucket)', slug: 'beans-paint-bucket', category_id: 'cat-agriculture', subcategory: 'Grains', unit: 'per paint bucket', description: 'Brown/white beans sold in paint bucket measure', image_url: null, is_featured: true, view_count: 8930, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'prod-garri-50kg', name: 'Garri (50kg bag)', slug: 'garri-50kg', category_id: 'cat-agriculture', subcategory: 'Tubers', unit: 'per 50kg bag', description: 'White and yellow garri in 50kg bags', image_url: null, is_featured: true, view_count: 12100, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'prod-tomato-basket', name: 'Tomatoes (basket)', slug: 'tomatoes-basket', category_id: 'cat-agriculture', subcategory: 'Vegetables', unit: 'per basket', description: 'Fresh tomatoes sold in baskets', image_url: null, is_featured: false, view_count: 7650, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'prod-palm-oil-25l', name: 'Palm Oil (25L)', slug: 'palm-oil-25l', category_id: 'cat-agriculture', subcategory: 'Cooking Oil', unit: 'per 25 litres', description: 'Red palm oil in 25 litre containers', image_url: null, is_featured: false, view_count: 9200, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'prod-yam-tuber', name: 'Yam (single tuber)', slug: 'yam-tuber', category_id: 'cat-agriculture', subcategory: 'Tubers', unit: 'per tuber', description: 'Fresh yam tuber', image_url: null, is_featured: false, view_count: 6300, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'prod-semovita-10kg', name: 'Semovita (10kg)', slug: 'semovita-10kg', category_id: 'cat-agriculture', subcategory: 'Grains', unit: 'per 10kg', description: 'Semovita semolina flour', image_url: null, is_featured: false, view_count: 4100, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'prod-chicken-whole', name: 'Chicken (whole, frozen)', slug: 'chicken-whole-frozen', category_id: 'cat-agriculture', subcategory: 'Livestock', unit: 'per unit', description: 'Whole frozen chicken', image_url: null, is_featured: false, view_count: 5400, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },

  // Oil & Gas
  { id: 'prod-pms', name: 'PMS (Petrol)', slug: 'pms-petrol', category_id: 'cat-oil-gas', subcategory: 'Fuel', unit: 'per litre', description: 'Premium Motor Spirit (petrol) pump price', image_url: null, is_featured: true, view_count: 45200, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'prod-diesel', name: 'Diesel (AGO)', slug: 'diesel-ago', category_id: 'cat-oil-gas', subcategory: 'Fuel', unit: 'per litre', description: 'Automotive Gas Oil (diesel) price', image_url: null, is_featured: true, view_count: 28100, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'prod-kerosene', name: 'Kerosene (DPK)', slug: 'kerosene-dpk', category_id: 'cat-oil-gas', subcategory: 'Fuel', unit: 'per litre', description: 'Dual Purpose Kerosene price', image_url: null, is_featured: false, view_count: 11300, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'prod-cooking-gas', name: 'Cooking Gas (LPG 12.5kg)', slug: 'cooking-gas-12kg', category_id: 'cat-oil-gas', subcategory: 'Gas', unit: 'per 12.5kg', description: 'Liquefied Petroleum Gas refill', image_url: null, is_featured: true, view_count: 19800, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },

  // Electronics
  { id: 'prod-iphone-15', name: 'iPhone 15 (128GB)', slug: 'iphone-15-128gb', category_id: 'cat-electronics', subcategory: 'Phones', unit: 'per unit', description: 'Apple iPhone 15 128GB', image_url: null, is_featured: true, view_count: 32100, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'prod-samsung-a15', name: 'Samsung Galaxy A15', slug: 'samsung-galaxy-a15', category_id: 'cat-electronics', subcategory: 'Phones', unit: 'per unit', description: 'Samsung Galaxy A15 smartphone', image_url: null, is_featured: true, view_count: 24500, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'prod-tecno-spark-20', name: 'Tecno Spark 20', slug: 'tecno-spark-20', category_id: 'cat-electronics', subcategory: 'Phones', unit: 'per unit', description: 'Tecno Spark 20 smartphone', image_url: null, is_featured: false, view_count: 18200, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'prod-hp-laptop-15', name: 'HP Laptop 15 (i5)', slug: 'hp-laptop-15-i5', category_id: 'cat-electronics', subcategory: 'Laptops', unit: 'per unit', description: 'HP 15-inch laptop with Intel Core i5', image_url: null, is_featured: false, view_count: 14300, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },

  // Currency
  { id: 'prod-usd-ngn', name: 'USD/NGN (Parallel)', slug: 'usd-ngn-parallel', category_id: 'cat-currency', subcategory: 'Forex', unit: 'per $1', description: 'US Dollar to Naira parallel market rate', image_url: null, is_featured: true, view_count: 89500, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'prod-gbp-ngn', name: 'GBP/NGN (Parallel)', slug: 'gbp-ngn-parallel', category_id: 'cat-currency', subcategory: 'Forex', unit: 'per £1', description: 'British Pound to Naira parallel market rate', image_url: null, is_featured: false, view_count: 34200, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'prod-eur-ngn', name: 'EUR/NGN (Parallel)', slug: 'eur-ngn-parallel', category_id: 'cat-currency', subcategory: 'Forex', unit: 'per €1', description: 'Euro to Naira parallel market rate', image_url: null, is_featured: false, view_count: 21100, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },

  // Commodities
  { id: 'prod-cement-50kg', name: 'Cement (50kg bag)', slug: 'cement-50kg', category_id: 'cat-commodities', subcategory: 'Building Materials', unit: 'per 50kg bag', description: 'Dangote/BUA cement 50kg bag', image_url: null, is_featured: true, view_count: 22800, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'prod-iron-rod-12mm', name: 'Iron Rod (12mm)', slug: 'iron-rod-12mm', category_id: 'cat-commodities', subcategory: 'Building Materials', unit: 'per length', description: '12mm iron rod / reinforcement bar', image_url: null, is_featured: false, view_count: 8900, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },

  // Transportation
  { id: 'prod-toyota-camry-2020', name: 'Toyota Camry (2020, Foreign Used)', slug: 'toyota-camry-2020', category_id: 'cat-transportation', subcategory: 'Vehicles', unit: 'per unit', description: 'Foreign used Toyota Camry 2020 model', image_url: null, is_featured: false, view_count: 11400, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },

  // Real Estate
  { id: 'prod-2bed-rent-lekki', name: '2-Bedroom Flat Rent (Lekki)', slug: '2bed-rent-lekki', category_id: 'cat-real-estate', subcategory: 'Rent', unit: 'per annum', description: 'Annual rent for 2-bedroom flat in Lekki, Lagos', image_url: null, is_featured: false, view_count: 16700, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },

  // Hospitality
  { id: 'prod-jollof-rice-plate', name: 'Jollof Rice (plate)', slug: 'jollof-rice-plate', category_id: 'cat-hospitality', subcategory: 'Restaurant', unit: 'per plate', description: 'Plate of jollof rice at a standard restaurant', image_url: null, is_featured: false, view_count: 7800, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
];

// ============================================
// PRICE POINTS - Generate realistic historical data
// ============================================
function generatePriceHistory(
  productId: string,
  locationId: string,
  basePrice: number,
  volatility: number,
  days: number,
  source: PricePoint['source']
): PricePoint[] {
  const points: PricePoint[] = [];
  let currentPrice = basePrice;

  for (let d = days; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const change = (Math.random() - 0.48) * volatility * basePrice;
    currentPrice = Math.max(basePrice * 0.7, Math.min(basePrice * 1.4, currentPrice + change));

    points.push({
      id: `pp-${productId}-${locationId}-${d}`,
      product_id: productId,
      location_id: locationId,
      price: Math.round(currentPrice * 100) / 100,
      currency: 'NGN',
      source,
      verified: true,
      recorded_at: date.toISOString(),
      created_at: date.toISOString(),
    });
  }

  return points;
}

// Base prices by product and location multiplier
const basePrices: Record<string, number> = {
  'prod-rice-50kg': 75000,
  'prod-beans-paint': 6500,
  'prod-garri-50kg': 45000,
  'prod-tomato-basket': 85000,
  'prod-palm-oil-25l': 52000,
  'prod-yam-tuber': 3500,
  'prod-semovita-10kg': 12500,
  'prod-chicken-whole': 8500,
  'prod-pms': 950,
  'prod-diesel': 1350,
  'prod-kerosene': 1400,
  'prod-cooking-gas': 14500,
  'prod-iphone-15': 850000,
  'prod-samsung-a15': 145000,
  'prod-tecno-spark-20': 115000,
  'prod-hp-laptop-15': 580000,
  'prod-usd-ngn': 1620,
  'prod-gbp-ngn': 2050,
  'prod-eur-ngn': 1750,
  'prod-cement-50kg': 7500,
  'prod-iron-rod-12mm': 5800,
  'prod-toyota-camry-2020': 18500000,
  'prod-2bed-rent-lekki': 3500000,
  'prod-jollof-rice-plate': 3500,
};

const locationMultipliers: Record<string, number> = {
  'loc-lagos': 1.15,
  'loc-abuja': 1.10,
  'loc-port-harcourt': 1.05,
  'loc-kano': 0.85,
  'loc-ibadan': 0.92,
  'loc-enugu': 0.95,
  'loc-kaduna': 0.88,
  'loc-benin': 0.93,
  'loc-warri': 0.97,
  'loc-aba': 0.90,
};

const productSources: Record<string, PricePoint['source']> = {
  'prod-rice-50kg': 'market_survey',
  'prod-beans-paint': 'market_survey',
  'prod-garri-50kg': 'market_survey',
  'prod-tomato-basket': 'market_survey',
  'prod-palm-oil-25l': 'market_survey',
  'prod-yam-tuber': 'market_survey',
  'prod-semovita-10kg': 'jumia',
  'prod-chicken-whole': 'market_survey',
  'prod-pms': 'nnpc',
  'prod-diesel': 'nnpc',
  'prod-kerosene': 'nbs',
  'prod-cooking-gas': 'nbs',
  'prod-iphone-15': 'jumia',
  'prod-samsung-a15': 'jumia',
  'prod-tecno-spark-20': 'konga',
  'prod-hp-laptop-15': 'jumia',
  'prod-usd-ngn': 'cbn',
  'prod-gbp-ngn': 'cbn',
  'prod-eur-ngn': 'cbn',
  'prod-cement-50kg': 'market_survey',
  'prod-iron-rod-12mm': 'market_survey',
  'prod-toyota-camry-2020': 'jiji',
  'prod-2bed-rent-lekki': 'jiji',
  'prod-jollof-rice-plate': 'market_survey',
};

// Generate all price points
export const pricePoints: PricePoint[] = [];

const majorLocationIds = locations.filter(l => l.is_major).map(l => l.id);

for (const product of products) {
  const base = basePrices[product.id] || 10000;
  const volatility = product.category_id === 'cat-currency' ? 0.02 :
    product.category_id === 'cat-agriculture' ? 0.04 :
    product.category_id === 'cat-oil-gas' ? 0.03 : 0.015;
  const source = productSources[product.id] || 'market_survey';

  for (const locId of majorLocationIds) {
    const multiplier = locationMultipliers[locId] || 1;
    const adjustedBase = base * multiplier;
    const history = generatePriceHistory(product.id, locId, adjustedBase, volatility, 90, source);
    pricePoints.push(...history);
  }
}

// ============================================
// DERIVED DATA
// ============================================

export function getLatestPrices(): LatestPrice[] {
  const latestMap = new Map<string, PricePoint>();

  for (const pp of pricePoints) {
    const key = `${pp.product_id}-${pp.location_id}`;
    const existing = latestMap.get(key);
    if (!existing || new Date(pp.recorded_at) > new Date(existing.recorded_at)) {
      latestMap.set(key, pp);
    }
  }

  return Array.from(latestMap.values()).map(pp => {
    const product = products.find(p => p.id === pp.product_id)!;
    const location = locations.find(l => l.id === pp.location_id)!;
    return {
      id: pp.id,
      product_id: pp.product_id,
      location_id: pp.location_id,
      price: pp.price,
      currency: pp.currency,
      source: pp.source,
      verified: pp.verified,
      recorded_at: pp.recorded_at,
      product_name: product.name,
      product_slug: product.slug,
      unit: product.unit,
      category_id: product.category_id,
      location_name: location.name,
      state: location.state,
      region: location.region,
    };
  });
}

export function getProductSummaries(): ProductPriceSummary[] {
  const latest = getLatestPrices();

  return products.map(product => {
    const productPrices = latest.filter(lp => lp.product_id === product.id);
    const prices = productPrices.map(pp => pp.price);

    return {
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      category_id: product.category_id,
      unit: product.unit,
      subcategory: product.subcategory,
      is_featured: product.is_featured,
      view_count: product.view_count,
      avg_price: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
      min_price: prices.length > 0 ? Math.min(...prices) : 0,
      max_price: prices.length > 0 ? Math.max(...prices) : 0,
      data_points: prices.length,
      last_updated: productPrices.length > 0
        ? productPrices.reduce((max, pp) =>
            new Date(pp.recorded_at) > new Date(max.recorded_at) ? pp : max
          ).recorded_at
        : null,
    };
  });
}

export function getPriceChanges(days: number = 7): PriceChange[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const recentCutoff = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  return products.map(product => {
    const productPoints = pricePoints.filter(pp => pp.product_id === product.id);

    const currentPoints = productPoints.filter(pp => new Date(pp.recorded_at) >= recentCutoff);
    const previousPoints = productPoints.filter(pp => {
      const date = new Date(pp.recorded_at);
      return date >= cutoff && date < recentCutoff;
    });

    const currentAvg = currentPoints.length > 0
      ? currentPoints.reduce((sum, pp) => sum + pp.price, 0) / currentPoints.length
      : 0;
    const previousAvg = previousPoints.length > 0
      ? previousPoints.reduce((sum, pp) => sum + pp.price, 0) / previousPoints.length
      : 0;

    const changePct = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;

    return {
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      category_id: product.category_id,
      unit: product.unit,
      current_avg: Math.round(currentAvg * 100) / 100,
      previous_avg: Math.round(previousAvg * 100) / 100,
      change_pct: Math.round(changePct * 100) / 100,
      abs_change: Math.round((currentAvg - previousAvg) * 100) / 100,
    };
  }).filter(pc => pc.current_avg > 0 && pc.previous_avg > 0)
    .sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct));
}

export function getPriceHistory(productId: string, locationId?: string, days: number = 30): PriceHistoryPoint[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const filtered = pricePoints.filter(pp => {
    if (pp.product_id !== productId) return false;
    if (locationId && pp.location_id !== locationId) return false;
    return new Date(pp.recorded_at) >= cutoff;
  });

  // Group by date and location
  const grouped = new Map<string, { prices: number[]; locationId: string; locationName: string }>();

  for (const pp of filtered) {
    const date = new Date(pp.recorded_at).toISOString().split('T')[0];
    const key = `${date}-${pp.location_id}`;
    const location = locations.find(l => l.id === pp.location_id);

    if (!grouped.has(key)) {
      grouped.set(key, {
        prices: [],
        locationId: pp.location_id,
        locationName: location?.name || 'Unknown',
      });
    }
    grouped.get(key)!.prices.push(pp.price);
  }

  return Array.from(grouped.entries()).map(([key, data]) => {
    const date = key.split('-').slice(0, 3).join('-');
    return {
      recorded_date: date,
      location_id: data.locationId,
      location_name: data.locationName,
      avg_price: Math.round(data.prices.reduce((a, b) => a + b, 0) / data.prices.length * 100) / 100,
      min_price: Math.min(...data.prices),
      max_price: Math.max(...data.prices),
    };
  }).sort((a, b) => a.recorded_date.localeCompare(b.recorded_date));
}

// Ticker data
export interface TickerItem {
  name: string;
  price: number;
  change: number;
  unit: string;
}

export function getTickerData(): TickerItem[] {
  const changes = getPriceChanges(1);
  const summaries = getProductSummaries();

  const tickerProducts = ['prod-usd-ngn', 'prod-pms', 'prod-diesel', 'prod-rice-50kg', 'prod-cement-50kg', 'prod-cooking-gas', 'prod-beans-paint', 'prod-garri-50kg'];

  return tickerProducts.map(pid => {
    const summary = summaries.find(s => s.product_id === pid);
    const change = changes.find(c => c.product_id === pid);
    const product = products.find(p => p.id === pid);

    return {
      name: product?.name || 'Unknown',
      price: summary?.avg_price || 0,
      change: change?.change_pct || 0,
      unit: product?.unit || '',
    };
  });
}
