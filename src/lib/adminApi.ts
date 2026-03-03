import { supabase, isSupabaseConfigured } from './supabase';
import { sanitizeInput } from './sanitize';
import type { Category, Product, Location, PricePoint } from '../types/database';
import {
  categories as mockCategories,
  locations as mockLocations,
  products as mockProducts,
  pricePoints as mockPricePoints,
} from '../data/mockData';

// In-memory stores for demo mode
let demoCategories = [...mockCategories];
let demoProducts = [...mockProducts];
let demoLocations = [...mockLocations];
let demoPricePoints = [...mockPricePoints];

function generateId(): string { return crypto.randomUUID(); }
function slugify(text: string): string { return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

// ============================================
// Admin Stats
// ============================================
export interface AdminStats {
  totalCategories: number;
  totalProducts: number;
  totalLocations: number;
  totalPricePoints: number;
  totalAlerts: number;
  recentPricePoints: number;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  if (!isSupabaseConfigured) {
    const oneDayAgo = new Date(Date.now() - 86400000);
    return {
      totalCategories: demoCategories.length,
      totalProducts: demoProducts.length,
      totalLocations: demoLocations.length,
      totalPricePoints: demoPricePoints.length,
      totalAlerts: 0,
      recentPricePoints: demoPricePoints.filter(pp => new Date(pp.recorded_at) >= oneDayAgo).length,
    };
  }

  const [cats, prods, locs, pps, alerts] = await Promise.all([
    supabase!.from('categories').select('id', { count: 'exact', head: true }),
    supabase!.from('products').select('id', { count: 'exact', head: true }),
    supabase!.from('locations').select('id', { count: 'exact', head: true }),
    supabase!.from('price_points').select('id', { count: 'exact', head: true }),
    supabase!.from('price_alerts').select('id', { count: 'exact', head: true }),
  ]);
  const recentRes = await supabase!.from('price_points').select('id', { count: 'exact', head: true })
    .gte('recorded_at', new Date(Date.now() - 86400000).toISOString());

  return {
    totalCategories: cats.count || 0, totalProducts: prods.count || 0, totalLocations: locs.count || 0,
    totalPricePoints: pps.count || 0, totalAlerts: alerts.count || 0, recentPricePoints: recentRes.count || 0,
  };
}

// ============================================
// Categories CRUD
// ============================================
export async function adminFetchCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return demoCategories;
  const { data, error } = await supabase!.from('categories').select('*').order('display_order');
  if (error) throw new Error(error.message);
  return data;
}

export async function adminCreateCategory(
  input: { name: string; icon: string; description: string; color: string; display_order: number }
): Promise<Category> {
  const name = sanitizeInput(input.name).trim();
  if (!name) throw new Error('Category name is required');
  const slug = slugify(name);

  if (!isSupabaseConfigured) {
    const newCat: Category = {
      id: generateId(), name, slug, icon: sanitizeInput(input.icon) || 'package',
      description: sanitizeInput(input.description || ''), color: input.color || '#10b981',
      display_order: input.display_order || demoCategories.length + 1,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    demoCategories.push(newCat);
    return newCat;
  }

  const { data, error } = await supabase!.from('categories').insert({
    name, slug, icon: input.icon || 'package', description: input.description || null,
    color: input.color || '#10b981', display_order: input.display_order || 0,
  }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminUpdateCategory(
  id: string, input: Partial<{ name: string; icon: string; description: string; color: string; display_order: number }>
): Promise<Category> {
  if (!isSupabaseConfigured) {
    const idx = demoCategories.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    const updated = { ...demoCategories[idx], ...input,
      name: input.name ? sanitizeInput(input.name).trim() : demoCategories[idx].name,
      slug: input.name ? slugify(sanitizeInput(input.name).trim()) : demoCategories[idx].slug,
      updated_at: new Date().toISOString(),
    };
    demoCategories[idx] = updated;
    return updated;
  }

  const updates: Record<string, unknown> = { ...input, updated_at: new Date().toISOString() };
  if (input.name) { updates.name = sanitizeInput(input.name).trim(); updates.slug = slugify(updates.name as string); }
  const { data, error } = await supabase!.from('categories').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteCategory(id: string): Promise<void> {
  if (!isSupabaseConfigured) { demoCategories = demoCategories.filter(c => c.id !== id); return; }
  const { error } = await supabase!.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================
// Products CRUD
// ============================================
export async function adminFetchProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return demoProducts;
  const { data, error } = await supabase!.from('products').select('*').order('name');
  if (error) throw new Error(error.message);
  return data;
}

export async function adminCreateProduct(
  input: { name: string; category_id: string; subcategory: string; unit: string; description: string; is_featured: boolean }
): Promise<Product> {
  const name = sanitizeInput(input.name).trim();
  if (!name) throw new Error('Product name is required');
  if (!input.category_id) throw new Error('Category is required');
  const slug = slugify(name);

  if (!isSupabaseConfigured) {
    const p: Product = {
      id: generateId(), name, slug, category_id: input.category_id,
      subcategory: sanitizeInput(input.subcategory || '') || null, unit: sanitizeInput(input.unit) || 'per unit',
      description: sanitizeInput(input.description || '') || null, image_url: null, is_featured: input.is_featured || false,
      view_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    demoProducts.push(p);
    return p;
  }

  const { data, error } = await supabase!.from('products').insert({
    name, slug, category_id: input.category_id, subcategory: input.subcategory || null,
    unit: input.unit || 'per unit', description: input.description || null, is_featured: input.is_featured || false,
  }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminUpdateProduct(
  id: string, input: Partial<{ name: string; category_id: string; subcategory: string; unit: string; description: string; is_featured: boolean }>
): Promise<Product> {
  if (!isSupabaseConfigured) {
    const idx = demoProducts.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    const updated = { ...demoProducts[idx], ...input,
      name: input.name ? sanitizeInput(input.name).trim() : demoProducts[idx].name,
      slug: input.name ? slugify(sanitizeInput(input.name).trim()) : demoProducts[idx].slug,
      updated_at: new Date().toISOString(),
    };
    demoProducts[idx] = updated;
    return updated;
  }

  const updates: Record<string, unknown> = { ...input, updated_at: new Date().toISOString() };
  if (input.name) { updates.name = sanitizeInput(input.name).trim(); updates.slug = slugify(updates.name as string); }
  const { data, error } = await supabase!.from('products').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteProduct(id: string): Promise<void> {
  if (!isSupabaseConfigured) { demoProducts = demoProducts.filter(p => p.id !== id); return; }
  const { error } = await supabase!.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================
// Locations CRUD
// ============================================
export async function adminFetchLocations(): Promise<Location[]> {
  if (!isSupabaseConfigured) return demoLocations;
  const { data, error } = await supabase!.from('locations').select('*').order('name');
  if (error) throw new Error(error.message);
  return data;
}

export async function adminCreateLocation(
  input: { name: string; state: string; region: string; location_type: Location['location_type']; is_major: boolean }
): Promise<Location> {
  const name = sanitizeInput(input.name).trim();
  if (!name) throw new Error('Location name is required');

  if (!isSupabaseConfigured) {
    const loc: Location = {
      id: generateId(), name, state: sanitizeInput(input.state).trim(), region: sanitizeInput(input.region).trim(),
      location_type: input.location_type || 'city', latitude: null, longitude: null, is_major: input.is_major || false,
      created_at: new Date().toISOString(),
    };
    demoLocations.push(loc);
    return loc;
  }

  const { data, error } = await supabase!.from('locations').insert({
    name, state: input.state, region: input.region, location_type: input.location_type || 'city', is_major: input.is_major || false,
  }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteLocation(id: string): Promise<void> {
  if (!isSupabaseConfigured) { demoLocations = demoLocations.filter(l => l.id !== id); return; }
  const { error } = await supabase!.from('locations').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================
// Price Points
// ============================================
export async function adminFetchPricePoints(filters?: {
  product_id?: string; location_id?: string; limit?: number;
}): Promise<(PricePoint & { product_name?: string; location_name?: string })[]> {
  const limit = filters?.limit || 100;

  if (!isSupabaseConfigured) {
    let points = [...demoPricePoints] as PricePoint[];
    if (filters?.product_id) points = points.filter(pp => pp.product_id === filters.product_id);
    if (filters?.location_id) points = points.filter(pp => pp.location_id === filters.location_id);
    points.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
    return points.slice(0, limit).map(pp => ({
      ...pp,
      product_name: demoProducts.find(p => p.id === pp.product_id)?.name,
      location_name: demoLocations.find(l => l.id === pp.location_id)?.name,
    }));
  }

  let query = supabase!.from('price_points').select('*').order('recorded_at', { ascending: false }).limit(limit);
  if (filters?.product_id) query = query.eq('product_id', filters.product_id);
  if (filters?.location_id) query = query.eq('location_id', filters.location_id);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function adminCreatePricePoint(
  input: { product_id: string; location_id: string; price: number; source: PricePoint['source']; recorded_at?: string }
): Promise<PricePoint> {
  if (!input.product_id) throw new Error('Product is required');
  if (!input.location_id) throw new Error('Location is required');
  if (!input.price || input.price <= 0) throw new Error('Price must be positive');

  if (!isSupabaseConfigured) {
    const pp: PricePoint = {
      id: generateId(), product_id: input.product_id, location_id: input.location_id,
      price: input.price, currency: 'NGN', source: input.source || 'market_survey', verified: false,
      recorded_at: input.recorded_at || new Date().toISOString(), created_at: new Date().toISOString(),
    };
    demoPricePoints.push(pp);
    return pp;
  }

  const { data, error } = await supabase!.from('price_points').insert({
    product_id: input.product_id, location_id: input.location_id, price: input.price,
    currency: 'NGN', source: input.source || 'market_survey', recorded_at: input.recorded_at || new Date().toISOString(),
  }).select().single();
  if (error) throw new Error(error.message);
  return data;
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
  const result: ImportResult = { total: rows.length, success: 0, errors: [] };

  const products = isSupabaseConfigured ? await adminFetchProducts() : demoProducts;
  const locations = isSupabaseConfigured ? await adminFetchLocations() : demoLocations;

  const productMap = new Map(products.map(p => [p.name.toLowerCase(), p.id]));
  const locationMap = new Map(locations.map(l => [l.name.toLowerCase(), l.id]));
  const validSources: PricePoint['source'][] = ['jumia', 'konga', 'jiji', 'nbs', 'cbn', 'nnpc', 'market_survey', 'user_report'];

  const validPoints: { product_id: string; location_id: string; price: number; source: PricePoint['source']; recorded_at: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const productId = productMap.get(row.product_name.toLowerCase().trim());
    if (!productId) { result.errors.push({ row: i + 1, message: `Product not found: "${row.product_name}"` }); continue; }

    const locationId = locationMap.get(row.location_name.toLowerCase().trim());
    if (!locationId) { result.errors.push({ row: i + 1, message: `Location not found: "${row.location_name}"` }); continue; }

    if (!row.price || row.price <= 0 || isNaN(row.price)) { result.errors.push({ row: i + 1, message: `Invalid price: "${row.price}"` }); continue; }

    const source = (validSources.includes(row.source as PricePoint['source']) ? row.source : 'market_survey') as PricePoint['source'];
    validPoints.push({ product_id: productId, location_id: locationId, price: row.price, source, recorded_at: row.recorded_at || new Date().toISOString() });
  }

  if (validPoints.length === 0) return result;

  if (!isSupabaseConfigured) {
    for (const point of validPoints) {
      demoPricePoints.push({ id: generateId(), ...point, currency: 'NGN', verified: false, created_at: new Date().toISOString() });
      result.success++;
    }
    return result;
  }

  const batchSize = 500;
  for (let i = 0; i < validPoints.length; i += batchSize) {
    const batch = validPoints.slice(i, i + batchSize).map(p => ({ ...p, currency: 'NGN' }));
    const { error } = await supabase!.from('price_points').insert(batch);
    if (error) result.errors.push({ row: i + 1, message: `Batch insert error: ${error.message}` });
    else result.success += batch.length;
  }

  return result;
}
