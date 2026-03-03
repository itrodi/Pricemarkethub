-- PriceWise Nigeria - Database Schema
-- Security-first design with Row Level Security (RLS)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT 'package',
  description TEXT,
  color TEXT NOT NULL DEFAULT '#10b981',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- ============================================
-- LOCATIONS
-- ============================================
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  region TEXT NOT NULL,
  location_type TEXT NOT NULL DEFAULT 'city' CHECK (location_type IN ('city', 'market', 'online')),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_major BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_locations_state ON locations(state);
CREATE INDEX idx_locations_region ON locations(region);
CREATE INDEX idx_locations_major ON locations(is_major) WHERE is_major = TRUE;

-- ============================================
-- PRODUCTS / COMMODITIES
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  subcategory TEXT,
  unit TEXT NOT NULL DEFAULT 'per unit',
  description TEXT,
  image_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  view_count BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;

-- ============================================
-- PRICE POINTS
-- ============================================
CREATE TABLE price_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  price DECIMAL(15, 2) NOT NULL CHECK (price > 0),
  currency TEXT NOT NULL DEFAULT 'NGN',
  source TEXT NOT NULL CHECK (source IN ('jumia', 'konga', 'jiji', 'nbs', 'cbn', 'nnpc', 'market_survey', 'user_report')),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_price_points_product ON price_points(product_id);
CREATE INDEX idx_price_points_location ON price_points(location_id);
CREATE INDEX idx_price_points_recorded ON price_points(recorded_at DESC);
CREATE INDEX idx_price_points_product_location ON price_points(product_id, location_id, recorded_at DESC);

-- ============================================
-- PRICE ALERTS (lightweight, no full account)
-- ============================================
CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('email', 'phone')),
  contact_value TEXT NOT NULL,
  threshold_type TEXT NOT NULL CHECK (threshold_type IN ('percentage', 'absolute')),
  threshold_value DECIMAL(10, 2) NOT NULL CHECK (threshold_value > 0),
  direction TEXT NOT NULL DEFAULT 'both' CHECK (direction IN ('up', 'down', 'both')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_product ON price_alerts(product_id);
CREATE INDEX idx_alerts_active ON price_alerts(is_active) WHERE is_active = TRUE;

-- ============================================
-- MATERIALIZED VIEW: Latest prices per product/location
-- ============================================
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

-- ============================================
-- MATERIALIZED VIEW: Product price summaries
-- ============================================
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
  COALESCE(AVG(lp.price), 0) AS avg_price,
  COALESCE(MIN(lp.price), 0) AS min_price,
  COALESCE(MAX(lp.price), 0) AS max_price,
  COUNT(lp.id) AS data_points,
  MAX(lp.recorded_at) AS last_updated
FROM products p
LEFT JOIN latest_prices lp ON p.id = lp.product_id
GROUP BY p.id, p.name, p.slug, p.category_id, p.unit, p.subcategory, p.is_featured, p.view_count;

CREATE UNIQUE INDEX idx_product_summaries_pk ON product_price_summaries(product_id);
CREATE INDEX idx_product_summaries_category ON product_price_summaries(category_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Public read access for categories, locations, products, price_points
CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Locations are publicly readable"
  ON locations FOR SELECT
  USING (true);

CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Price points are publicly readable"
  ON price_points FOR SELECT
  USING (true);

-- Price alerts: users can only insert (no read/update/delete from client)
CREATE POLICY "Anyone can create price alerts"
  ON price_alerts FOR INSERT
  WITH CHECK (true);

-- No public write access to categories, locations, products, price_points
-- (managed via service role / admin only)

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to search products with fuzzy matching
CREATE OR REPLACE FUNCTION search_products(search_query TEXT, result_limit INT DEFAULT 20)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  category_id UUID,
  subcategory TEXT,
  unit TEXT,
  similarity_score REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.category_id,
    p.subcategory,
    p.unit,
    similarity(p.name, search_query) AS similarity_score
  FROM products p
  WHERE p.name ILIKE '%' || search_query || '%'
     OR similarity(p.name, search_query) > 0.1
  ORDER BY similarity(p.name, search_query) DESC
  LIMIT result_limit;
END;
$$;

-- Function to get price history for a product
CREATE OR REPLACE FUNCTION get_price_history(
  p_product_id UUID,
  p_location_id UUID DEFAULT NULL,
  p_days INT DEFAULT 30
)
RETURNS TABLE (
  recorded_date DATE,
  location_id UUID,
  location_name TEXT,
  avg_price DECIMAL,
  min_price DECIMAL,
  max_price DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(pp.recorded_at) AS recorded_date,
    pp.location_id,
    l.name AS location_name,
    AVG(pp.price)::DECIMAL AS avg_price,
    MIN(pp.price)::DECIMAL AS min_price,
    MAX(pp.price)::DECIMAL AS max_price
  FROM price_points pp
  JOIN locations l ON pp.location_id = l.id
  WHERE pp.product_id = p_product_id
    AND pp.recorded_at >= NOW() - (p_days || ' days')::INTERVAL
    AND (p_location_id IS NULL OR pp.location_id = p_location_id)
  GROUP BY DATE(pp.recorded_at), pp.location_id, l.name
  ORDER BY recorded_date ASC;
END;
$$;

-- Function to get price changes (comparing current vs N days ago)
CREATE OR REPLACE FUNCTION get_price_changes(p_days INT DEFAULT 7, p_limit INT DEFAULT 20)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  product_slug TEXT,
  category_id UUID,
  unit TEXT,
  current_avg DECIMAL,
  previous_avg DECIMAL,
  change_pct DECIMAL,
  abs_change DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH current_prices AS (
    SELECT
      pp.product_id,
      AVG(pp.price) AS avg_price
    FROM price_points pp
    WHERE pp.recorded_at >= NOW() - INTERVAL '2 days'
    GROUP BY pp.product_id
  ),
  previous_prices AS (
    SELECT
      pp.product_id,
      AVG(pp.price) AS avg_price
    FROM price_points pp
    WHERE pp.recorded_at >= NOW() - (p_days || ' days')::INTERVAL
      AND pp.recorded_at < NOW() - INTERVAL '2 days'
    GROUP BY pp.product_id
  )
  SELECT
    p.id AS product_id,
    p.name AS product_name,
    p.slug AS product_slug,
    p.category_id,
    p.unit,
    COALESCE(cp.avg_price, 0)::DECIMAL AS current_avg,
    COALESCE(prev.avg_price, 0)::DECIMAL AS previous_avg,
    CASE
      WHEN COALESCE(prev.avg_price, 0) > 0
      THEN (((cp.avg_price - prev.avg_price) / prev.avg_price) * 100)::DECIMAL
      ELSE 0
    END AS change_pct,
    COALESCE(cp.avg_price - prev.avg_price, 0)::DECIMAL AS abs_change
  FROM products p
  JOIN current_prices cp ON p.id = cp.product_id
  LEFT JOIN previous_prices prev ON p.id = prev.product_id
  WHERE prev.avg_price IS NOT NULL AND prev.avg_price > 0
  ORDER BY ABS((cp.avg_price - prev.avg_price) / prev.avg_price) DESC
  LIMIT p_limit;
END;
$$;

-- Function to increment product view count (rate limited by design)
CREATE OR REPLACE FUNCTION increment_view_count(p_product_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products SET view_count = view_count + 1 WHERE id = p_product_id;
END;
$$;

-- Refresh materialized views function (to be called by cron)
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY latest_prices;
  REFRESH MATERIALIZED VIEW CONCURRENTLY product_price_summaries;
END;
$$;
