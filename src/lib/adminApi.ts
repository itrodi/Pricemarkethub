import { API_BASE } from './supabase';
import { sanitizeInput } from './sanitize';
import type { Category, Subcategory, Product, Location, PricePoint } from '../types/database';

const ADMIN_API = `${API_BASE}/admin`;

/**
 * Get the stored admin token.
 */
function getToken(): string | null {
  return localStorage.getItem('pw_admin_token');
}

/**
 * Helper for authenticated admin API calls.
 */
async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${ADMIN_API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ============================================
// Admin Stats
// ============================================
export interface AdminStats {
  totalCategories: number;
  totalSubcategories: number;
  totalProducts: number;
  totalLocations: number;
  totalPricePoints: number;
  totalAlerts: number;
  recentPricePoints: number;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  return adminFetch('/stats');
}

// ============================================
// Categories CRUD
// ============================================
export async function adminFetchCategories(): Promise<Category[]> {
  return adminFetch('/categories');
}

export async function adminCreateCategory(
  input: { name: string; icon: string; description: string; color: string; display_order: number }
): Promise<Category> {
  const name = sanitizeInput(input.name).trim();
  if (!name) throw new Error('Category name is required');

  return adminFetch('/categories', {
    method: 'POST',
    body: JSON.stringify({
      name,
      icon: sanitizeInput(input.icon) || 'package',
      description: sanitizeInput(input.description || ''),
      color: input.color || '#10b981',
      display_order: input.display_order || 0,
    }),
  });
}

export async function adminUpdateCategory(
  id: string,
  input: Partial<{ name: string; icon: string; description: string; color: string; display_order: number }>
): Promise<Category> {
  const updates: Record<string, unknown> = { ...input };
  if (input.name) updates.name = sanitizeInput(input.name).trim();

  return adminFetch(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function adminDeleteCategory(id: string): Promise<void> {
  await adminFetch(`/categories/${id}`, { method: 'DELETE' });
}

// ============================================
// Subcategories CRUD
// ============================================
export async function adminFetchSubcategories(): Promise<(Subcategory & { category_name?: string })[]> {
  return adminFetch('/subcategories');
}

export async function adminCreateSubcategory(
  input: { name: string; category_id: string; description: string; display_order: number }
): Promise<Subcategory> {
  const name = sanitizeInput(input.name).trim();
  if (!name) throw new Error('Subcategory name is required');
  if (!input.category_id) throw new Error('Parent category is required');

  return adminFetch('/subcategories', {
    method: 'POST',
    body: JSON.stringify({
      name,
      category_id: input.category_id,
      description: input.description || '',
      display_order: input.display_order || 0,
    }),
  });
}

export async function adminUpdateSubcategory(
  id: string,
  input: Partial<{ name: string; category_id: string; description: string; display_order: number }>
): Promise<Subcategory> {
  const updates: Record<string, unknown> = { ...input };
  if (input.name) updates.name = sanitizeInput(input.name).trim();

  return adminFetch(`/subcategories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function adminDeleteSubcategory(id: string): Promise<void> {
  await adminFetch(`/subcategories/${id}`, { method: 'DELETE' });
}

// ============================================
// Products CRUD
// ============================================
export async function adminFetchProducts(): Promise<Product[]> {
  return adminFetch('/products');
}

export async function adminCreateProduct(
  input: { name: string; category_id: string; subcategory: string; unit: string; description: string; is_featured: boolean }
): Promise<Product> {
  const name = sanitizeInput(input.name).trim();
  if (!name) throw new Error('Product name is required');
  if (!input.category_id) throw new Error('Category is required');

  return adminFetch('/products', {
    method: 'POST',
    body: JSON.stringify({
      name,
      category_id: input.category_id,
      subcategory: sanitizeInput(input.subcategory || '') || null,
      unit: sanitizeInput(input.unit) || 'per unit',
      description: sanitizeInput(input.description || '') || null,
      is_featured: input.is_featured || false,
    }),
  });
}

export async function adminUpdateProduct(
  id: string,
  input: Partial<{ name: string; category_id: string; subcategory: string; unit: string; description: string; is_featured: boolean }>
): Promise<Product> {
  const updates: Record<string, unknown> = { ...input };
  if (input.name) updates.name = sanitizeInput(input.name).trim();

  return adminFetch(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function adminDeleteProduct(id: string): Promise<void> {
  await adminFetch(`/products/${id}`, { method: 'DELETE' });
}

// ============================================
// Locations CRUD
// ============================================
export async function adminFetchLocations(): Promise<Location[]> {
  return adminFetch('/locations');
}

export async function adminCreateLocation(
  input: { name: string; state: string; region: string; location_type: Location['location_type']; is_major: boolean }
): Promise<Location> {
  const name = sanitizeInput(input.name).trim();
  if (!name) throw new Error('Location name is required');

  return adminFetch('/locations', {
    method: 'POST',
    body: JSON.stringify({
      name,
      state: sanitizeInput(input.state).trim(),
      region: sanitizeInput(input.region).trim(),
      location_type: input.location_type || 'city',
      is_major: input.is_major || false,
    }),
  });
}

export async function adminDeleteLocation(id: string): Promise<void> {
  await adminFetch(`/locations/${id}`, { method: 'DELETE' });
}

// ============================================
// Price Points
// ============================================
export async function adminFetchPricePoints(filters?: {
  product_id?: string; location_id?: string; limit?: number;
}): Promise<(PricePoint & { product_name?: string; location_name?: string })[]> {
  const params = new URLSearchParams();
  if (filters?.product_id) params.set('product_id', filters.product_id);
  if (filters?.location_id) params.set('location_id', filters.location_id);
  if (filters?.limit) params.set('limit', String(filters.limit));
  const qs = params.toString() ? `?${params.toString()}` : '';

  return adminFetch(`/price-points${qs}`);
}

export async function adminCreatePricePoint(
  input: { product_id: string; location_id: string; price: number; source: PricePoint['source']; recorded_at?: string }
): Promise<PricePoint> {
  if (!input.product_id) throw new Error('Product is required');
  if (!input.location_id) throw new Error('Location is required');
  if (!input.price || input.price <= 0) throw new Error('Price must be positive');

  return adminFetch('/price-points', {
    method: 'POST',
    body: JSON.stringify({
      product_id: input.product_id,
      location_id: input.location_id,
      price: input.price,
      source: input.source || 'market_survey',
      recorded_at: input.recorded_at || new Date().toISOString(),
    }),
  });
}

// ============================================
// Bulk Import (CSV)
// ============================================
export interface CsvPriceRow {
  product_name: string;
  location_name: string;
  price: number;
  source: string;
  recorded_at?: string;
}

export interface ImportResult {
  total: number;
  success: number;
  errors: { row: number; message: string }[];
}

export async function adminBulkImportPrices(rows: CsvPriceRow[]): Promise<ImportResult> {
  return adminFetch('/bulk-import', {
    method: 'POST',
    body: JSON.stringify({ rows }),
  });
}
