import pg from 'pg';
import { logger } from './logger.js';

const { Pool } = pg;

let pool = null;

export function initDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    logger.warn('DATABASE_URL not configured. Running in dry-run mode (no data will be saved).');
    return null;
  }

  pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    logger.error('Unexpected PostgreSQL pool error:', { error: err.message });
  });

  logger.info('Database connection initialized.');
  return pool;
}

/**
 * Load category map: slug -> { id, name }
 */
export async function loadCategoryMap() {
  if (!pool) return new Map();

  try {
    const { rows } = await pool.query('SELECT id, name, slug FROM categories');
    const map = new Map();
    for (const cat of rows) {
      map.set(cat.slug, cat);
    }
    logger.info(`Loaded ${rows.length} categories.`);
    return map;
  } catch (err) {
    logger.error('Failed to load categories', { error: err.message });
    return new Map();
  }
}

/**
 * Load subcategory map: slug -> { id, name, category_id }
 */
export async function loadSubcategoryMap() {
  if (!pool) return new Map();

  try {
    const { rows } = await pool.query('SELECT id, name, slug, category_id FROM subcategories');
    const map = new Map();
    for (const sub of rows) {
      map.set(sub.slug, sub);
    }
    logger.info(`Loaded ${rows.length} subcategories.`);
    return map;
  } catch (err) {
    logger.error('Failed to load subcategories', { error: err.message });
    return new Map();
  }
}

/**
 * Load all locations for matching.
 */
export async function loadLocationMap() {
  if (!pool) return new Map();

  try {
    const { rows } = await pool.query('SELECT id, name, state, location_type FROM locations');
    const map = new Map();
    for (const loc of rows) {
      map.set(loc.name.toLowerCase(), loc);
      if (loc.state) {
        map.set(loc.state.toLowerCase(), loc);
      }
    }
    logger.info(`Loaded ${rows.length} locations.`);
    return map;
  } catch (err) {
    logger.error('Failed to load locations', { error: err.message });
    return new Map();
  }
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
  if (!pool) return null;

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

  try {
    // Try to find existing product by slug
    const { rows: existing } = await pool.query(
      'SELECT id, name, slug FROM products WHERE slug = $1',
      [slug]
    );

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new product
    const { rows: created } = await pool.query(
      `INSERT INTO products (name, slug, category_id, subcategory_id, subcategory, condition, description, image_url, source_url, source, unit)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, name, slug`,
      [
        scraped.name,
        slug,
        categoryId,
        subcategoryId || null,
        subcategoryName || null,
        scraped.condition || null,
        description || null,
        scraped.imageUrl || null,
        scraped.link || null,
        source,
        'per unit',
      ]
    );

    return created[0];
  } catch (err) {
    // Handle duplicate slug race condition
    if (err.code === '23505') {
      try {
        const { rows: retry } = await pool.query(
          'SELECT id, name, slug FROM products WHERE slug = $1',
          [slug]
        );
        return retry[0] || null;
      } catch {
        return null;
      }
    }
    logger.warn(`Failed to create product "${scraped.name}": ${err.message}`);
    return null;
  }
}

/**
 * Resolve a Jiji location string like "Lagos, Ikeja" to a location_id.
 * Falls back to "Online" if not found.
 */
export function resolveLocation(locationText, locationMap) {
  if (!locationText) return locationMap.get('online')?.id || null;

  const parts = locationText.split(',').map(p => p.trim());

  if (parts[0]) {
    const stateMatch = locationMap.get(parts[0].toLowerCase());
    if (stateMatch) return stateMatch.id;
  }

  if (parts[1]) {
    const areaMatch = locationMap.get(parts[1].toLowerCase());
    if (areaMatch) return areaMatch.id;
  }

  return locationMap.get('online')?.id || null;
}

/**
 * Insert scraped price points into the database.
 */
export async function insertPricePoints(points) {
  if (!pool || points.length === 0) {
    logger.info(`Dry-run: would insert ${points.length} price points.`);
    return { success: points.length, errors: 0 };
  }

  let success = 0;
  let errors = 0;
  const batchSize = 200;

  for (let i = 0; i < points.length; i += batchSize) {
    const batch = points.slice(i, i + batchSize);

    try {
      const placeholders = batch.map((_, idx) => {
        const base = idx * 7;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`;
      }).join(', ');

      const flatParams = batch.flatMap(p => [
        p.product_id,
        p.location_id,
        p.price,
        p.currency,
        p.source,
        p.location_text,
        p.recorded_at,
      ]);

      await pool.query(
        `INSERT INTO price_points (product_id, location_id, price, currency, source, location_text, recorded_at)
         VALUES ${placeholders}`,
        flatParams
      );

      success += batch.length;
    } catch (err) {
      logger.error(`Batch insert failed at offset ${i}`, { error: err.message });
      errors += batch.length;
    }
  }

  return { success, errors };
}

/**
 * Refresh materialized views after scraping.
 */
export async function refreshViews() {
  if (!pool) return;

  try {
    await pool.query('SELECT refresh_materialized_views()');
    logger.info('Materialized views refreshed.');
  } catch (err) {
    logger.warn('Failed to refresh materialized views', { error: err.message });
  }
}

/**
 * Close the database connection pool.
 */
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
