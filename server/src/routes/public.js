import { Router } from 'express';
import { query, queryAll, queryOne } from '../db.js';

const router = Router();

// ============================================
// Categories
// ============================================
router.get('/categories', async (_req, res) => {
  try {
    const rows = await queryAll('SELECT * FROM categories ORDER BY display_order');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/categories/:slug', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM categories WHERE slug = $1', [req.params.slug]);
    if (!row) return res.status(404).json({ error: 'Category not found' });
    res.json(row);
  } catch (err) {
    console.error('Error fetching category:', err.message);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// ============================================
// Subcategories
// ============================================
router.get('/subcategories', async (req, res) => {
  try {
    const { category_id } = req.query;
    let sql = 'SELECT s.*, c.name AS category_name FROM subcategories s LEFT JOIN categories c ON s.category_id = c.id';
    const params = [];
    if (category_id) {
      sql += ' WHERE s.category_id = $1';
      params.push(category_id);
    }
    sql += ' ORDER BY s.display_order';
    const rows = await queryAll(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching subcategories:', err.message);
    res.status(500).json({ error: 'Failed to fetch subcategories' });
  }
});

// ============================================
// Locations
// ============================================
router.get('/locations', async (req, res) => {
  try {
    const majorOnly = req.query.major_only === 'true';
    let sql = 'SELECT * FROM locations';
    if (majorOnly) sql += ' WHERE is_major = TRUE';
    sql += ' ORDER BY name';
    const rows = await queryAll(sql);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching locations:', err.message);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// ============================================
// Products
// ============================================
router.get('/products', async (req, res) => {
  try {
    const { category_id } = req.query;
    let sql = 'SELECT * FROM products';
    const params = [];
    if (category_id) {
      sql += ' WHERE category_id = $1';
      params.push(category_id);
    }
    sql += ' ORDER BY name';
    const rows = await queryAll(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/products/by-slug/:slug', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM products WHERE slug = $1', [req.params.slug]);
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(row);
  } catch (err) {
    console.error('Error fetching product:', err.message);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// ============================================
// Product Price Summaries (materialized view)
// ============================================
router.get('/product-summaries', async (req, res) => {
  try {
    const { category_id } = req.query;
    let sql = 'SELECT * FROM product_price_summaries';
    const params = [];
    if (category_id) {
      sql += ' WHERE category_id = $1';
      params.push(category_id);
    }
    sql += ' ORDER BY name';
    const rows = await queryAll(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching summaries:', err.message);
    res.status(500).json({ error: 'Failed to fetch product summaries' });
  }
});

// ============================================
// Latest Prices (materialized view)
// ============================================
router.get('/latest-prices', async (req, res) => {
  try {
    const { product_id, location_id } = req.query;
    let sql = 'SELECT * FROM latest_prices';
    const conditions = [];
    const params = [];

    if (product_id) {
      params.push(product_id);
      conditions.push(`product_id = $${params.length}`);
    }
    if (location_id) {
      params.push(location_id);
      conditions.push(`location_id = $${params.length}`);
    }

    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY recorded_at DESC';

    const rows = await queryAll(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching latest prices:', err.message);
    res.status(500).json({ error: 'Failed to fetch latest prices' });
  }
});

// ============================================
// Price Changes (RPC replacement)
// ============================================
router.get('/price-changes', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const limit = parseInt(req.query.limit) || 20;

    const rows = await queryAll(
      'SELECT * FROM get_price_changes($1, $2)',
      [days, limit]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching price changes:', err.message);
    res.status(500).json({ error: 'Failed to fetch price changes' });
  }
});

// ============================================
// Price History (RPC replacement)
// ============================================
router.get('/price-history/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const locationId = req.query.location_id || null;
    const days = parseInt(req.query.days) || 30;

    const rows = await queryAll(
      'SELECT * FROM get_price_history($1, $2, $3)',
      [productId, locationId, days]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching price history:', err.message);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

// ============================================
// Search (RPC replacement)
// ============================================
router.get('/search', async (req, res) => {
  try {
    const searchQuery = (req.query.q || '').trim();
    if (!searchQuery) return res.json([]);

    const rows = await queryAll(
      'SELECT * FROM search_products($1, $2)',
      [searchQuery, 20]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error searching products:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

// ============================================
// Price Alerts (public insert)
// ============================================
router.post('/price-alerts', async (req, res) => {
  try {
    const { product_id, location_id, contact_type, contact_value, threshold_type, threshold_value, direction } = req.body;

    if (!product_id || !contact_type || !contact_value || !threshold_type || !threshold_value) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await query(
      `INSERT INTO price_alerts (product_id, location_id, contact_type, contact_value, threshold_type, threshold_value, direction)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [product_id, location_id || null, contact_type, contact_value, threshold_type, threshold_value, direction || 'both']
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error creating alert:', err.message);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// ============================================
// View Count
// ============================================
router.post('/products/:id/view', async (req, res) => {
  try {
    await query('SELECT increment_view_count($1)', [req.params.id]);
    res.json({ success: true });
  } catch {
    res.json({ success: true }); // Non-critical, don't fail
  }
});

export default router;
