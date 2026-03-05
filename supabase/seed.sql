-- ============================================
-- PriceWise Nigeria - Seed Data
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. LOCATIONS (Online location required by scraper)
-- ============================================
INSERT INTO locations (name, state, region, location_type, is_major) VALUES
  ('Online', 'National', 'National', 'online', TRUE),
  ('Lagos', 'Lagos', 'South West', 'city', TRUE),
  ('Abuja', 'FCT', 'North Central', 'city', TRUE),
  ('Port Harcourt', 'Rivers', 'South South', 'city', TRUE),
  ('Kano', 'Kano', 'North West', 'city', TRUE),
  ('Ibadan', 'Oyo', 'South West', 'city', TRUE),
  ('Enugu', 'Enugu', 'South East', 'city', TRUE),
  ('Benin City', 'Edo', 'South South', 'city', TRUE),
  ('Kaduna', 'Kaduna', 'North West', 'city', TRUE),
  ('Warri', 'Delta', 'South South', 'city', FALSE),
  ('Aba', 'Abia', 'South East', 'city', FALSE),
  ('Jos', 'Plateau', 'North Central', 'city', FALSE),
  ('Owerri', 'Imo', 'South East', 'city', FALSE),
  ('Calabar', 'Cross River', 'South South', 'city', FALSE),
  ('Uyo', 'Akwa Ibom', 'South South', 'city', FALSE),
  ('Abeokuta', 'Ogun', 'South West', 'city', FALSE)
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. CATEGORIES
-- ============================================
INSERT INTO categories (name, slug, icon, description, color, display_order) VALUES
  ('Mobile Devices', 'mobile-devices', 'smartphone', 'Smartphones, tablets, and mobile accessories', '#3b82f6', 1),
  ('Computing & Electronics', 'computing-electronics', 'laptop', 'Laptops, desktops, TVs, and electronics', '#6366f1', 2),
  ('Automobiles', 'automobiles', 'car', 'Cars, trucks, motorcycles, and vehicle parts', '#ef4444', 3),
  ('Real Estate & Housing', 'real-estate-housing', 'home', 'Apartments, houses, land, and commercial property', '#f59e0b', 4),
  ('Food & Agriculture', 'food-agriculture', 'wheat', 'Grains, cooking oils, produce, and farm products', '#22c55e', 5),
  ('Home & Living', 'home-living', 'sofa', 'Furniture, appliances, kitchenware, and home decor', '#8b5cf6', 6),
  ('Fashion & Clothing', 'fashion-clothing', 'shirt', 'Men, women, and children clothing and accessories', '#ec4899', 7),
  ('Health & Beauty', 'health-beauty', 'heart', 'Skincare, haircare, cosmetics, and wellness', '#f43f5e', 8),
  ('Professional Services', 'professional-services', 'briefcase', 'Repairs, cleaning, logistics, and skilled services', '#0ea5e9', 9),
  ('Building & Construction', 'building-construction', 'hammer', 'Cement, roofing, plumbing, and building materials', '#78716c', 10),
  ('Industrial Equipment', 'industrial-equipment', 'wrench', 'Generators, tools, commercial equipment', '#64748b', 11),
  ('Sports & Leisure', 'sports-leisure', 'trophy', 'Sports gear, musical instruments, and entertainment', '#14b8a6', 12),
  ('Kids & Baby', 'kids-baby', 'baby', 'Baby gear, toys, and children essentials', '#f97316', 13),
  ('Pets & Animals', 'pets-animals', 'paw-print', 'Pets, livestock, feeds, and animal care', '#84cc16', 14),
  ('Careers & Jobs', 'careers-jobs', 'briefcase', 'Job listings and professional opportunities', '#6d28d9', 15),
  ('Energy & Fuel', 'energy-fuel', 'fuel', 'Petrol, diesel, gas, and energy products', '#dc2626', 16)
ON CONFLICT (slug) DO NOTHING;
