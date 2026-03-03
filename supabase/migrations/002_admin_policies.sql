-- ============================================
-- Admin Write Policies
-- These policies allow authenticated users with
-- the service role to write data.
-- The scraper uses the service_role key which
-- bypasses RLS entirely, so these policies are
-- for admin users authenticated via Supabase Auth.
-- ============================================

-- Categories: authenticated users can manage
CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Products: authenticated users can manage
CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Locations: authenticated users can manage
CREATE POLICY "Authenticated users can insert locations"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update locations"
  ON locations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete locations"
  ON locations FOR DELETE
  TO authenticated
  USING (true);

-- Price Points: authenticated users can insert
CREATE POLICY "Authenticated users can insert price points"
  ON price_points FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update price points"
  ON price_points FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete price points"
  ON price_points FOR DELETE
  TO authenticated
  USING (true);

-- Price Alerts: authenticated users can manage all
CREATE POLICY "Authenticated users can read alerts"
  ON price_alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update alerts"
  ON price_alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete alerts"
  ON price_alerts FOR DELETE
  TO authenticated
  USING (true);
