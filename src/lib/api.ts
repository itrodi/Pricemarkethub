import { supabase, isSupabaseConfigured } from './supabase';
import { sanitizeSearchQuery } from './sanitize';
import type {
  Category,
  Location,
  Product,
  ProductPriceSummary,
  LatestPrice,
  PriceChange,
  PriceHistoryPoint,
  PriceAlert,
  SearchResult,
} from '../types/database';
import {
  categories as mockCategories,
  locations as mockLocations,
  products as mockProducts,
  getLatestPrices,
  getProductSummaries,
  getPriceChanges as mockGetPriceChanges,
  getPriceHistory as mockGetPriceHistory,
  getTickerData as mockGetTickerData,
  type TickerItem,
} from '../data/mockData';

// ============================================
// Categories
// ============================================
export async function fetchCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return mockCategories;

  const { data, error } = await supabase!
    .from('categories')
    .select('*')
    .order('display_order');

  if (error) {
    console.error('Error fetching categories:', error);
    return mockCategories;
  }
  return data;
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  if (!isSupabaseConfigured) {
    return mockCategories.find(c => c.slug === slug) || null;
  }

  const { data, error } = await supabase!
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

// ============================================
// Locations
// ============================================
export async function fetchLocations(majorOnly = false): Promise<Location[]> {
  if (!isSupabaseConfigured) {
    return majorOnly ? mockLocations.filter(l => l.is_major) : mockLocations;
  }

  let query = supabase!.from('locations').select('*');
  if (majorOnly) query = query.eq('is_major', true);

  const { data, error } = await query.order('name');
  if (error) {
    console.error('Error fetching locations:', error);
    return majorOnly ? mockLocations.filter(l => l.is_major) : mockLocations;
  }
  return data;
}

// ============================================
// Products
// ============================================
export async function fetchProducts(categoryId?: string): Promise<Product[]> {
  if (!isSupabaseConfigured) {
    return categoryId
      ? mockProducts.filter(p => p.category_id === categoryId)
      : mockProducts;
  }

  let query = supabase!.from('products').select('*');
  if (categoryId) query = query.eq('category_id', categoryId);

  const { data, error } = await query.order('name');
  if (error) {
    console.error('Error fetching products:', error);
    return categoryId
      ? mockProducts.filter(p => p.category_id === categoryId)
      : mockProducts;
  }
  return data;
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured) {
    return mockProducts.find(p => p.slug === slug) || null;
  }

  const { data, error } = await supabase!
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

// ============================================
// Product Price Summaries
// ============================================
export async function fetchProductSummaries(categoryId?: string): Promise<ProductPriceSummary[]> {
  if (!isSupabaseConfigured) {
    const summaries = getProductSummaries();
    return categoryId
      ? summaries.filter(s => s.category_id === categoryId)
      : summaries;
  }

  let query = supabase!.from('product_price_summaries').select('*');
  if (categoryId) query = query.eq('category_id', categoryId);

  const { data, error } = await query.order('name');
  if (error) {
    console.error('Error fetching summaries:', error);
    const summaries = getProductSummaries();
    return categoryId ? summaries.filter(s => s.category_id === categoryId) : summaries;
  }
  return data;
}

// ============================================
// Latest Prices
// ============================================
export async function fetchLatestPrices(
  productId?: string,
  locationId?: string
): Promise<LatestPrice[]> {
  if (!isSupabaseConfigured) {
    let prices = getLatestPrices();
    if (productId) prices = prices.filter(p => p.product_id === productId);
    if (locationId) prices = prices.filter(p => p.location_id === locationId);
    return prices;
  }

  let query = supabase!.from('latest_prices').select('*');
  if (productId) query = query.eq('product_id', productId);
  if (locationId) query = query.eq('location_id', locationId);

  const { data, error } = await query.order('recorded_at', { ascending: false });
  if (error) {
    console.error('Error fetching latest prices:', error);
    let prices = getLatestPrices();
    if (productId) prices = prices.filter(p => p.product_id === productId);
    if (locationId) prices = prices.filter(p => p.location_id === locationId);
    return prices;
  }
  return data;
}

// ============================================
// Price Changes
// ============================================
export async function fetchPriceChanges(days: number = 7, limit: number = 20): Promise<PriceChange[]> {
  if (!isSupabaseConfigured) {
    return mockGetPriceChanges(days).slice(0, limit);
  }

  const { data, error } = await supabase!.rpc('get_price_changes', {
    p_days: days,
    p_limit: limit,
  });

  if (error) {
    console.error('Error fetching price changes:', error);
    return mockGetPriceChanges(days).slice(0, limit);
  }
  return data;
}

// ============================================
// Price History
// ============================================
export async function fetchPriceHistory(
  productId: string,
  locationId?: string,
  days: number = 30
): Promise<PriceHistoryPoint[]> {
  if (!isSupabaseConfigured) {
    return mockGetPriceHistory(productId, locationId, days);
  }

  const { data, error } = await supabase!.rpc('get_price_history', {
    p_product_id: productId,
    p_location_id: locationId || null,
    p_days: days,
  });

  if (error) {
    console.error('Error fetching price history:', error);
    return mockGetPriceHistory(productId, locationId, days);
  }
  return data;
}

// ============================================
// Search
// ============================================
export async function searchProducts(query: string): Promise<SearchResult[]> {
  const sanitized = sanitizeSearchQuery(query);
  if (!sanitized) return [];

  if (!isSupabaseConfigured) {
    const lowerQuery = sanitized.toLowerCase();
    return mockProducts
      .filter(p => p.name.toLowerCase().includes(lowerQuery))
      .map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category_id: p.category_id,
        subcategory: p.subcategory,
        unit: p.unit,
        similarity_score: p.name.toLowerCase().startsWith(lowerQuery) ? 1 : 0.5,
      }))
      .sort((a, b) => b.similarity_score - a.similarity_score);
  }

  const { data, error } = await supabase!.rpc('search_products', {
    search_query: sanitized,
    result_limit: 20,
  });

  if (error) {
    console.error('Error searching products:', error);
    return [];
  }
  return data;
}

// ============================================
// Ticker
// ============================================
export async function fetchTickerData(): Promise<TickerItem[]> {
  // For now, always use mock ticker data
  // In production, this would aggregate from latest_prices
  return mockGetTickerData();
}

// ============================================
// Price Alerts
// ============================================
export async function createPriceAlert(
  alert: Omit<PriceAlert, 'id' | 'is_active' | 'last_triggered_at' | 'created_at'>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    // Mock success
    return { success: true };
  }

  const { error } = await supabase!
    .from('price_alerts')
    .insert({
      product_id: alert.product_id,
      location_id: alert.location_id,
      contact_type: alert.contact_type,
      contact_value: alert.contact_value,
      threshold_type: alert.threshold_type,
      threshold_value: alert.threshold_value,
      direction: alert.direction,
    });

  if (error) {
    console.error('Error creating alert:', error);
    return { success: false, error: 'Failed to create alert. Please try again.' };
  }
  return { success: true };
}

// ============================================
// View Count
// ============================================
export async function incrementViewCount(productId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  await supabase!.rpc('increment_view_count', { p_product_id: productId });
}
