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
 * Load all products from the database for matching.
 * Returns a map of lowercase product name -> product record.
 */
export async function loadProductMap() {
  if (!supabase) return new Map();

  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, category_id, subcategory, unit');

  if (error) {
    logger.error('Failed to load products', { error: error.message });
    return new Map();
  }

  const map = new Map();
  for (const product of data) {
    map.set(product.name.toLowerCase(), product);
    // Also add without parenthetical for fuzzy matching
    const simplified = product.name.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
    if (simplified !== product.name.toLowerCase()) {
      map.set(simplified, product);
    }
  }

  logger.info(`Loaded ${data.length} products for matching.`);
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
  }

  // Add "Online" as a fallback
  if (!map.has('online')) {
    // Try to find or use the first location as fallback
    const onlineLoc = data.find(l => l.location_type === 'online');
    if (onlineLoc) {
      map.set('online', onlineLoc);
    }
  }

  logger.info(`Loaded ${data.length} locations for matching.`);
  return map;
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
