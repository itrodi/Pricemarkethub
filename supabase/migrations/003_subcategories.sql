-- ============================================
-- SUBCATEGORIES TABLE
-- Adds a proper hierarchy: categories > subcategories > products
-- ============================================

CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subcategories_slug ON subcategories(slug);
CREATE INDEX idx_subcategories_category ON subcategories(category_id);

-- Add subcategory_id FK to products table (nullable for backwards compat)
ALTER TABLE products ADD COLUMN subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL;
CREATE INDEX idx_products_subcategory ON products(subcategory_id);

-- Enable RLS
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Subcategories are publicly readable"
  ON subcategories FOR SELECT
  USING (true);

-- Add condition column to products for "Brand New", "Used", "Foreign Used", "Refurbished"
ALTER TABLE products ADD COLUMN condition TEXT CHECK (condition IN ('brand_new', 'used', 'foreign_used', 'local_used', 'refurbished'));

-- Add source_url to track where the product was scraped from
ALTER TABLE products ADD COLUMN source_url TEXT;

-- Add source to track which site discovered this product
ALTER TABLE products ADD COLUMN source TEXT CHECK (source IN ('jumia', 'konga', 'jiji', 'manual'));

-- Add location text for products scraped with location info (e.g., "Lagos, Ikeja")
ALTER TABLE price_points ADD COLUMN location_text TEXT;
