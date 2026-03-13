import { API_BASE } from './supabase';
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

/**
 * Helper to fetch from API with error handling and mock fallback.
 */
async function apiFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`API fetch error (${path}):`, err);
    return fallback;
  }
}

// ============================================
// Categories
// ============================================
export async function fetchCategories(): Promise<Category[]> {
  return apiFetch('/categories', mockCategories);
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  return apiFetch(`/categories/${encodeURIComponent(slug)}`, mockCategories.find(c => c.slug === slug) || null);
}

// ============================================
// Locations
// ============================================
export async function fetchLocations(majorOnly = false): Promise<Location[]> {
  const params = majorOnly ? '?major_only=true' : '';
  const fallback = majorOnly ? mockLocations.filter(l => l.is_major) : mockLocations;
  return apiFetch(`/locations${params}`, fallback);
}

// ============================================
// Products
// ============================================
export async function fetchProducts(categoryId?: string): Promise<Product[]> {
  const params = categoryId ? `?category_id=${encodeURIComponent(categoryId)}` : '';
  const fallback = categoryId ? mockProducts.filter(p => p.category_id === categoryId) : mockProducts;
  return apiFetch(`/products${params}`, fallback);
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  return apiFetch(`/products/by-slug/${encodeURIComponent(slug)}`, mockProducts.find(p => p.slug === slug) || null);
}

// ============================================
// Product Price Summaries
// ============================================
export async function fetchProductSummaries(categoryId?: string): Promise<ProductPriceSummary[]> {
  const params = categoryId ? `?category_id=${encodeURIComponent(categoryId)}` : '';
  const fallback = categoryId
    ? getProductSummaries().filter(s => s.category_id === categoryId)
    : getProductSummaries();
  return apiFetch(`/product-summaries${params}`, fallback);
}

// ============================================
// Latest Prices
// ============================================
export async function fetchLatestPrices(
  productId?: string,
  locationId?: string
): Promise<LatestPrice[]> {
  const params = new URLSearchParams();
  if (productId) params.set('product_id', productId);
  if (locationId) params.set('location_id', locationId);
  const qs = params.toString() ? `?${params.toString()}` : '';

  let fallback = getLatestPrices();
  if (productId) fallback = fallback.filter(p => p.product_id === productId);
  if (locationId) fallback = fallback.filter(p => p.location_id === locationId);

  return apiFetch(`/latest-prices${qs}`, fallback);
}

// ============================================
// Price Changes
// ============================================
export async function fetchPriceChanges(days: number = 7, limit: number = 20): Promise<PriceChange[]> {
  return apiFetch(`/price-changes?days=${days}&limit=${limit}`, mockGetPriceChanges(days).slice(0, limit));
}

// ============================================
// Price History
// ============================================
export async function fetchPriceHistory(
  productId: string,
  locationId?: string,
  days: number = 30
): Promise<PriceHistoryPoint[]> {
  const params = new URLSearchParams({ days: String(days) });
  if (locationId) params.set('location_id', locationId);

  return apiFetch(
    `/price-history/${encodeURIComponent(productId)}?${params.toString()}`,
    mockGetPriceHistory(productId, locationId, days)
  );
}

// ============================================
// Search
// ============================================
export async function searchProducts(query: string): Promise<SearchResult[]> {
  const sanitized = sanitizeSearchQuery(query);
  if (!sanitized) return [];

  return apiFetch(`/search?q=${encodeURIComponent(sanitized)}`, []);
}

// ============================================
// Ticker
// ============================================
export async function fetchTickerData(): Promise<TickerItem[]> {
  return mockGetTickerData();
}

// ============================================
// Price Alerts
// ============================================
export async function createPriceAlert(
  alert: Omit<PriceAlert, 'id' | 'is_active' | 'last_triggered_at' | 'created_at'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/price-alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: alert.product_id,
        location_id: alert.location_id,
        contact_type: alert.contact_type,
        contact_value: alert.contact_value,
        threshold_type: alert.threshold_type,
        threshold_value: alert.threshold_value,
        direction: alert.direction,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.error || 'Failed to create alert' };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to create alert. Please try again.' };
  }
}

// ============================================
// View Count
// ============================================
export async function incrementViewCount(productId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/products/${encodeURIComponent(productId)}/view`, {
      method: 'POST',
    });
  } catch {
    // Non-critical, ignore errors
  }
}
