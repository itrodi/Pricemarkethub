import { Router } from 'express';
import { query, queryAll, queryOne } from '../db.js';
import { requireAdmin, authenticateAdmin, generateToken } from '../auth.js';

const router = Router();

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ============================================
// Auth
// ============================================
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await authenticateAdmin(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/auth/me', requireAdmin, (req, res) => {
  res.json({ user: { id: req.user.id, email: req.user.email } });
});

// ============================================
// Admin Stats
// ============================================
router.get('/stats', requireAdmin, async (_req, res) => {
  try {
    const [cats, subcats, prods, locs, pps, alerts, recent] = await Promise.all([
      queryOne('SELECT COUNT(*)::int AS count FROM categories'),
      queryOne('SELECT COUNT(*)::int AS count FROM subcategories'),
      queryOne('SELECT COUNT(*)::int AS count FROM products'),
      queryOne('SELECT COUNT(*)::int AS count FROM locations'),
      queryOne('SELECT COUNT(*)::int AS count FROM price_points'),
      queryOne('SELECT COUNT(*)::int AS count FROM price_alerts'),
      queryOne("SELECT COUNT(*)::int AS count FROM price_points WHERE recorded_at >= NOW() - INTERVAL '1 day'"),
    ]);

    res.json({
      totalCategories: cats.count,
      totalSubcategories: subcats.count,
      totalProducts: prods.count,
      totalLocations: locs.count,
      totalPricePoints: pps.count,
      totalAlerts: alerts.count,
      recentPricePoints: recent.count,
    });
  } catch (err) {
    console.error('Error fetching stats:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ============================================
// Categories CRUD
// ============================================
router.get('/categories', requireAdmin, async (_req, res) => {
  try {
    const rows = await queryAll('SELECT * FROM categories ORDER BY display_order');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/categories', requireAdmin, async (req, res) => {
  try {
    const { name, icon, description, color, display_order } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

    const slug = slugify(name.trim());
    const row = await queryOne(
      `INSERT INTO categories (name, slug, icon, description, color, display_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name.trim(), slug, icon || 'package', description || null, color || '#10b981', display_order || 0]
    );
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, description, color, display_order } = req.body;

    const updates = [];
    const params = [];
    let idx = 1;

    if (name !== undefined) {
      updates.push(`name = $${idx++}`);
      params.push(name.trim());
      updates.push(`slug = $${idx++}`);
      params.push(slugify(name.trim()));
    }
    if (icon !== undefined) { updates.push(`icon = $${idx++}`); params.push(icon); }
    if (description !== undefined) { updates.push(`description = $${idx++}`); params.push(description); }
    if (color !== undefined) { updates.push(`color = $${idx++}`); params.push(color); }
    if (display_order !== undefined) { updates.push(`display_order = $${idx++}`); params.push(display_order); }
    updates.push(`updated_at = NOW()`);

    params.push(id);
    const row = await queryOne(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    if (!row) return res.status(404).json({ error: 'Category not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/categories/:id', requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// Subcategories CRUD
// ============================================
router.get('/subcategories', requireAdmin, async (_req, res) => {
  try {
    const rows = await queryAll(
      `SELECT s.*, c.name AS category_name
       FROM subcategories s LEFT JOIN categories c ON s.category_id = c.id
       ORDER BY s.display_order`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/subcategories', requireAdmin, async (req, res) => {
  try {
    const { name, category_id, description, display_order } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!category_id) return res.status(400).json({ error: 'Category is required' });

    const slug = slugify(name.trim());
    const row = await queryOne(
      `INSERT INTO subcategories (name, slug, category_id, description, display_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name.trim(), slug, category_id, description || null, display_order || 0]
    );
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/subcategories/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category_id, description, display_order } = req.body;

    const updates = [];
    const params = [];
    let idx = 1;

    if (name !== undefined) {
      updates.push(`name = $${idx++}`);
      params.push(name.trim());
      updates.push(`slug = $${idx++}`);
      params.push(slugify(name.trim()));
    }
    if (category_id !== undefined) { updates.push(`category_id = $${idx++}`); params.push(category_id); }
    if (description !== undefined) { updates.push(`description = $${idx++}`); params.push(description); }
    if (display_order !== undefined) { updates.push(`display_order = $${idx++}`); params.push(display_order); }
    updates.push(`updated_at = NOW()`);

    params.push(id);
    const row = await queryOne(
      `UPDATE subcategories SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    if (!row) return res.status(404).json({ error: 'Subcategory not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/subcategories/:id', requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM subcategories WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// Products CRUD
// ============================================
router.get('/products', requireAdmin, async (_req, res) => {
  try {
    const rows = await queryAll('SELECT * FROM products ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/products', requireAdmin, async (req, res) => {
  try {
    const { name, category_id, subcategory, unit, description, is_featured } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!category_id) return res.status(400).json({ error: 'Category is required' });

    const slug = slugify(name.trim());
    const row = await queryOne(
      `INSERT INTO products (name, slug, category_id, subcategory, unit, description, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name.trim(), slug, category_id, subcategory || null, unit || 'per unit', description || null, is_featured || false]
    );
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category_id, subcategory, unit, description, is_featured } = req.body;

    const updates = [];
    const params = [];
    let idx = 1;

    if (name !== undefined) {
      updates.push(`name = $${idx++}`);
      params.push(name.trim());
      updates.push(`slug = $${idx++}`);
      params.push(slugify(name.trim()));
    }
    if (category_id !== undefined) { updates.push(`category_id = $${idx++}`); params.push(category_id); }
    if (subcategory !== undefined) { updates.push(`subcategory = $${idx++}`); params.push(subcategory); }
    if (unit !== undefined) { updates.push(`unit = $${idx++}`); params.push(unit); }
    if (description !== undefined) { updates.push(`description = $${idx++}`); params.push(description); }
    if (is_featured !== undefined) { updates.push(`is_featured = $${idx++}`); params.push(is_featured); }
    updates.push(`updated_at = NOW()`);

    params.push(id);
    const row = await queryOne(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/products/:id', requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// Locations CRUD
// ============================================
router.get('/locations', requireAdmin, async (_req, res) => {
  try {
    const rows = await queryAll('SELECT * FROM locations ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/locations', requireAdmin, async (req, res) => {
  try {
    const { name, state, region, location_type, is_major } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

    const row = await queryOne(
      `INSERT INTO locations (name, state, region, location_type, is_major)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name.trim(), state, region, location_type || 'city', is_major || false]
    );
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/locations/:id', requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM locations WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// Price Points
// ============================================
router.get('/price-points', requireAdmin, async (req, res) => {
  try {
    const { product_id, location_id, limit: lim } = req.query;
    const rowLimit = parseInt(lim) || 100;
    const conditions = [];
    const params = [];

    if (product_id) {
      params.push(product_id);
      conditions.push(`pp.product_id = $${params.length}`);
    }
    if (location_id) {
      params.push(location_id);
      conditions.push(`pp.location_id = $${params.length}`);
    }

    let sql = `SELECT pp.*, p.name AS product_name, l.name AS location_name
               FROM price_points pp
               LEFT JOIN products p ON pp.product_id = p.id
               LEFT JOIN locations l ON pp.location_id = l.id`;

    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY pp.recorded_at DESC';
    params.push(rowLimit);
    sql += ` LIMIT $${params.length}`;

    const rows = await queryAll(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/price-points', requireAdmin, async (req, res) => {
  try {
    const { product_id, location_id, price, source, recorded_at } = req.body;
    if (!product_id) return res.status(400).json({ error: 'Product is required' });
    if (!location_id) return res.status(400).json({ error: 'Location is required' });
    if (!price || price <= 0) return res.status(400).json({ error: 'Price must be positive' });

    const row = await queryOne(
      `INSERT INTO price_points (product_id, location_id, price, currency, source, recorded_at)
       VALUES ($1, $2, $3, 'NGN', $4, $5) RETURNING *`,
      [product_id, location_id, price, source || 'market_survey', recorded_at || new Date().toISOString()]
    );
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// Bulk Import
// ============================================
router.post('/bulk-import', requireAdmin, async (req, res) => {
  try {
    const { rows: importRows } = req.body;
    if (!Array.isArray(importRows) || importRows.length === 0) {
      return res.status(400).json({ error: 'No rows provided' });
    }

    // Load lookup maps
    const products = await queryAll('SELECT id, name FROM products');
    const locations = await queryAll('SELECT id, name FROM locations');
    const productMap = new Map(products.map(p => [p.name.toLowerCase(), p.id]));
    const locationMap = new Map(locations.map(l => [l.name.toLowerCase(), l.id]));

    const validSources = ['jumia', 'konga', 'jiji', 'nbs', 'cbn', 'nnpc', 'market_survey', 'user_report'];
    const result = { total: importRows.length, success: 0, errors: [] };
    const validPoints = [];

    for (let i = 0; i < importRows.length; i++) {
      const row = importRows[i];
      const productId = productMap.get(row.product_name?.toLowerCase()?.trim());
      if (!productId) { result.errors.push({ row: i + 1, message: `Product not found: "${row.product_name}"` }); continue; }

      const locationId = locationMap.get(row.location_name?.toLowerCase()?.trim());
      if (!locationId) { result.errors.push({ row: i + 1, message: `Location not found: "${row.location_name}"` }); continue; }

      if (!row.price || row.price <= 0 || isNaN(row.price)) { result.errors.push({ row: i + 1, message: `Invalid price: "${row.price}"` }); continue; }

      const source = validSources.includes(row.source) ? row.source : 'market_survey';
      validPoints.push([productId, locationId, row.price, 'NGN', source, row.recorded_at || new Date().toISOString()]);
    }

    // Batch insert
    const batchSize = 500;
    for (let i = 0; i < validPoints.length; i += batchSize) {
      const batch = validPoints.slice(i, i + batchSize);
      const placeholders = batch.map((_, idx) => {
        const base = idx * 6;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`;
      }).join(', ');
      const flatParams = batch.flat();

      try {
        await query(
          `INSERT INTO price_points (product_id, location_id, price, currency, source, recorded_at) VALUES ${placeholders}`,
          flatParams
        );
        result.success += batch.length;
      } catch (err) {
        result.errors.push({ row: i + 1, message: `Batch insert error: ${err.message}` });
      }
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// Refresh Materialized Views
// ============================================
router.post('/refresh-views', requireAdmin, async (_req, res) => {
  try {
    await query('SELECT refresh_materialized_views()');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
