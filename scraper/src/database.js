import { createClient } from '@supabase/supabase-js';
import { logger } from './logger.js';

let supabase = null;

export function initDatabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    logger.warn('Supabase not configured. Running in dry-run mode (no data will be saved).');
    return null;
  }

  supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  logger.info('Database connection initialized.');
  return supabase;
}

/**
 * Load category map: slug -> { id, name }
 */
export async function loadCategoryMap() {
  if (!supabase) return new Map();

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug');

  if (error) {
    logger.error('Failed to load categories', { error: error.message });
    return new Map();
  }

  const map = new Map();
  for (const cat of data) {
    map.set(cat.slug, cat);
  }

  logger.info(`Loaded ${data.length} categories.`);
  return map;
}

/**
 * Load subcategory map: slug -> { id, name, category_id }
 */
export async function loadSubcategoryMap() {
  if (!supabase) return new Map();

  const { data, error } = await supabase
    .from('subcategories')
    .select('id, name, slug, category_id');

  if (error) {
    logger.error('Failed to load subcategories', { error: error.message });
    return new Map();
  }

  const map = new Map();
  for (const sub of data) {
    map.set(sub.slug, sub);
  }

  logger.info(`Loaded ${data.length} subcategories.`);
  return map;
}

/**
 * Load all locations for matching.
 */
export async function loadLocationMap() {
  if (!supabase) return new Map();

  const { data, error } = await supabase
    .from('locations')
    .select('id, name, state, location_type');

  if (error) {
    logger.error('Failed to load locations', { error: error.message });
    return new Map();
  }

  const map = new Map();
  for (const loc of data) {
    map.set(loc.name.toLowerCase(), loc);
    // Also map by state name for Jiji location matching
    if (loc.state) {
      map.set(loc.state.toLowerCase(), loc);
    }
  }

  logger.info(`Loaded ${data.length} locations.`);
  return map;
}

/**
 * Generate a URL-safe slug from a product name.
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200);
}

/**
 * Find or create a product in the database.
 * Returns the product record with id.
 */
export async function findOrCreateProduct(scraped, categoryId, subcategoryId, source, subcategoryName = null) {
  if (!supabase) return null;

  const slug = slugify(scraped.name);
  if (!slug) return null;

  // Build description from specs if available
  let description = scraped.description || null;
  if (scraped.specs) {
    const specParts = [];
    if (scraped.specs.storage) specParts.push(`Storage: ${scraped.specs.storage}`);
    if (scraped.specs.ram) specParts.push(`RAM: ${scraped.specs.ram}`);
    if (scraped.specs.color) specParts.push(`Color: ${scraped.specs.color}`);
    if (specParts.length > 0) {
      description = description
        ? `${description} | ${specParts.join(', ')}`
        : specParts.join(', ');
    }
  }

  // Try to find existing product by slug
  const { data: existing } = await supabase
    .from('products')
    .select('id, name, slug')
    .eq('slug', slug)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  // Create new product — set both subcategory_id (FK) and subcategory (TEXT) for compatibility
  const { data: created, error } = await supabase
    .from('products')
    .insert({
      name: scraped.name,
      slug,
      category_id: categoryId,
      subcategory_id: subcategoryId || null,
      subcategory: subcategoryName || null,
      condition: scraped.condition || null,
      description: description || null,
      image_url: scraped.imageUrl || null,
      source_url: scraped.link || null,
      source,
      unit: 'per unit',
    })
    .select('id, name, slug')
    .single();

  if (error) {
    // Could be a race condition / duplicate slug - try to fetch again
    if (error.code === '23505') {
      const { data: retry } = await supabase
        .from('products')
        .select('id, name, slug')
        .eq('slug', slug)
        .maybeSingle();
      return retry;
    }
    logger.warn(`Failed to create product "${scraped.name}": ${error.message}`);
    return null;
  }

  return created;
}

/**
 * Resolve a Jiji location string like "Lagos, Ikeja" to a location_id.
 * Falls back to "Online" if not found.
 */
export function resolveLocation(locationText, locationMap) {
  if (!locationText) return locationMap.get('online')?.id || null;

  // Jiji format: "State, Area" e.g., "Lagos, Ikeja" or "Oyo, Ibadan"
  const parts = locationText.split(',').map(p => p.trim());

  // Try the state first (e.g., "Lagos")
  if (parts[0]) {
    const stateMatch = locationMap.get(parts[0].toLowerCase());
    if (stateMatch) return stateMatch.id;
  }

  // Try the area (e.g., "Ibadan")
  if (parts[1]) {
    const areaMatch = locationMap.get(parts[1].toLowerCase());
    if (areaMatch) return areaMatch.id;
  }

  // Fallback to Online
  return locationMap.get('online')?.id || null;
}

/**
 * Insert scraped price points into the database.
 */
export async function insertPricePoints(points) {
  if (!supabase || points.length === 0) {
    logger.info(`Dry-run: would insert ${points.length} price points.`);
    return { success: points.length, errors: 0 };
  }

  let success = 0;
  let errors = 0;
  const batchSize = 200;

  for (let i = 0; i < points.length; i += batchSize) {
    const batch = points.slice(i, i + batchSize);

    const { error } = await supabase
      .from('price_points')
      .insert(batch);

    if (error) {
      logger.error(`Batch insert failed at offset ${i}`, { error: error.message });
      errors += batch.length;
    } else {
      success += batch.length;
    }
  }

  return { success, errors };
}

/**
 * Refresh materialized views after scraping.
 */
export async function refreshViews() {
  if (!supabase) return;

  const { error } = await supabase.rpc('refresh_materialized_views');
  if (error) {
    logger.warn('Failed to refresh materialized views', { error: error.message });
  } else {
    logger.info('Materialized views refreshed.');
  }
}
