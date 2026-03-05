-- ============================================
-- PriceWise Nigeria - Seed Data
-- Run this in your Supabase SQL Editor
-- Run 003_subcategories.sql migration FIRST
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

-- ============================================
-- 3. SUBCATEGORIES
-- ============================================

-- Mobile Devices subcategories (from Jiji: /mobile-phones-tablets)
INSERT INTO subcategories (name, slug, category_id, description, display_order) VALUES
  ('Mobile Phones', 'mobile-phones', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Smartphones and feature phones', 1),
  ('Tablets', 'tablets', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Android tablets, iPads, and Windows tablets', 2),
  ('Phone Accessories', 'phone-accessories', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Cases, chargers, screen protectors, and more', 3),
  ('Smart Watches', 'smart-watches', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Smart watches and fitness trackers', 4),
  ('Headphones', 'headphones', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Earbuds, headphones, and audio accessories', 5)
ON CONFLICT (slug) DO NOTHING;

-- Computing & Electronics subcategories
INSERT INTO subcategories (name, slug, category_id, description, display_order) VALUES
  ('Laptops', 'laptops', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops and notebooks', 1),
  ('Desktop Computers', 'desktop-computers', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Desktop PCs and workstations', 2),
  ('Computer Accessories', 'computer-accessories', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Keyboards, mice, monitors, and peripherals', 3),
  ('Printers & Scanners', 'printers-scanners', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Printers, scanners, and office equipment', 4),
  ('Networking', 'networking', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Routers, switches, and network equipment', 5),
  ('TVs', 'tvs', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Smart TVs and displays', 6),
  ('Audio & Speakers', 'audio-speakers', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Speakers, soundbars, and home audio', 7),
  ('Cameras & Photography', 'cameras-photography', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Cameras, lenses, and photography gear', 8),
  ('Video Games & Consoles', 'video-games-consoles', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'PlayStation, Xbox, Nintendo, and PC gaming', 9)
ON CONFLICT (slug) DO NOTHING;

-- Automobiles subcategories
INSERT INTO subcategories (name, slug, category_id, description, display_order) VALUES
  ('Cars', 'cars', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Sedans, SUVs, trucks, and other vehicles', 1),
  ('Motorcycles & Scooters', 'motorcycles-scooters', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Bikes, scooters, and motorcycles', 2),
  ('Trucks & Trailers', 'trucks-trailers', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Trucks, trailers, and heavy vehicles', 3),
  ('Vehicle Parts', 'vehicle-parts', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Auto parts, tires, and accessories', 4),
  ('Buses & Vans', 'buses-vans', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Buses, vans, and commercial vehicles', 5)
ON CONFLICT (slug) DO NOTHING;

-- Real Estate subcategories
INSERT INTO subcategories (name, slug, category_id, description, display_order) VALUES
  ('Apartments for Rent', 'apartments-rent', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Flats and apartments for rent', 1),
  ('Houses for Rent', 'houses-rent', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Houses and duplexes for rent', 2),
  ('Apartments for Sale', 'apartments-sale', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Flats and apartments for sale', 3),
  ('Houses for Sale', 'houses-sale', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Houses and duplexes for sale', 4),
  ('Land', 'land', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Plots and land for sale', 5),
  ('Commercial Property', 'commercial-property', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Offices, shops, and warehouses', 6)
ON CONFLICT (slug) DO NOTHING;

-- Food & Agriculture subcategories
INSERT INTO subcategories (name, slug, category_id, description, display_order) VALUES
  ('Grains & Rice', 'grains-rice', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Rice, beans, maize, and other grains', 1),
  ('Cooking Oils', 'cooking-oils', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Vegetable oil, palm oil, and groundnut oil', 2),
  ('Flour & Meals', 'flour-meals', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Wheat flour, semovita, garri, and poundo', 3),
  ('Pasta & Noodles', 'pasta-noodles', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Spaghetti, noodles, and pasta', 4),
  ('Seasonings & Spices', 'seasonings-spices', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Seasoning cubes, pepper, and spices', 5),
  ('Beverages', 'beverages', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Drinks, milk, and beverages', 6),
  ('Proteins', 'proteins', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Meat, fish, eggs, and poultry', 7),
  ('Fresh Produce', 'fresh-produce', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Fruits, vegetables, and tubers', 8)
ON CONFLICT (slug) DO NOTHING;

-- Home & Living subcategories
INSERT INTO subcategories (name, slug, category_id, description, display_order) VALUES
  ('Furniture', 'furniture', (SELECT id FROM categories WHERE slug = 'home-living'), 'Sofas, tables, beds, and storage', 1),
  ('Home Appliances', 'home-appliances', (SELECT id FROM categories WHERE slug = 'home-living'), 'ACs, fans, refrigerators, and washing machines', 2),
  ('Kitchen Appliances', 'kitchen-appliances', (SELECT id FROM categories WHERE slug = 'home-living'), 'Blenders, microwaves, gas cookers', 3),
  ('Home Decor', 'home-decor', (SELECT id FROM categories WHERE slug = 'home-living'), 'Curtains, rugs, and decorative items', 4)
ON CONFLICT (slug) DO NOTHING;
