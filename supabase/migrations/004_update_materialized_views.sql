-- ============================================
-- Migration 004: Update materialized views to include
-- image_url, description, and condition from products
-- ============================================

-- Drop existing materialized views (must drop summaries first since it depends on latest_prices)
DROP MATERIALIZED VIEW IF EXISTS product_price_summaries;
DROP MATERIALIZED VIEW IF EXISTS latest_prices;

-- Recreate latest_prices (unchanged, but must be recreated since we dropped it)
CREATE MATERIALIZED VIEW latest_prices AS
SELECT DISTINCT ON (product_id, location_id)
  pp.id,
  pp.product_id,
  pp.location_id,
  pp.price,
  pp.currency,
  pp.source,
  pp.verified,
  pp.recorded_at,
  p.name AS product_name,
  p.slug AS product_slug,
  p.unit,
  p.category_id,
  l.name AS location_name,
  l.state,
  l.region
FROM price_points pp
JOIN products p ON pp.product_id = p.id
JOIN locations l ON pp.location_id = l.id
ORDER BY product_id, location_id, recorded_at DESC;

CREATE UNIQUE INDEX idx_latest_prices_pk ON latest_prices(id);
CREATE INDEX idx_latest_prices_product ON latest_prices(product_id);
CREATE INDEX idx_latest_prices_category ON latest_prices(category_id);

-- Recreate product_price_summaries with image_url, description, and condition
CREATE MATERIALIZED VIEW product_price_summaries AS
SELECT
  p.id AS product_id,
  p.name,
  p.slug,
  p.category_id,
  p.unit,
  p.subcategory,
  p.is_featured,
  p.view_count,
  p.image_url,
  p.description,
  p.condition,
  COALESCE(AVG(lp.price), 0) AS avg_price,
  COALESCE(MIN(lp.price), 0) AS min_price,
  COALESCE(MAX(lp.price), 0) AS max_price,
  COUNT(lp.id) AS data_points,
  MAX(lp.recorded_at) AS last_updated
FROM products p
LEFT JOIN latest_prices lp ON p.id = lp.product_id
GROUP BY p.id, p.name, p.slug, p.category_id, p.unit, p.subcategory,
         p.is_featured, p.view_count, p.image_url, p.description, p.condition;

CREATE UNIQUE INDEX idx_product_summaries_pk ON product_price_summaries(product_id);
CREATE INDEX idx_product_summaries_category ON product_price_summaries(category_id);

-- Refresh both views to populate them
REFRESH MATERIALIZED VIEW latest_prices;
REFRESH MATERIALIZED VIEW CONCURRENTLY product_price_summaries;
