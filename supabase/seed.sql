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

-- ============================================
-- 3. PRODUCTS
-- Use variables for category IDs
-- ============================================

-- ---- MOBILE DEVICES ----
-- These match phone names from Jumia, Konga, and Jiji
INSERT INTO products (name, slug, category_id, subcategory, unit) VALUES
  -- Samsung phones
  ('Samsung Galaxy A15', 'samsung-galaxy-a15', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Samsung Galaxy A25', 'samsung-galaxy-a25', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Samsung Galaxy A35', 'samsung-galaxy-a35', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Samsung Galaxy A55', 'samsung-galaxy-a55', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Samsung Galaxy S24', 'samsung-galaxy-s24', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Samsung Galaxy S23', 'samsung-galaxy-s23', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Samsung Galaxy S23 Ultra', 'samsung-galaxy-s23-ultra', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Samsung Galaxy Z Fold5', 'samsung-galaxy-z-fold5', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Samsung Galaxy Z Flip5', 'samsung-galaxy-z-flip5', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Samsung Galaxy A05', 'samsung-galaxy-a05', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Samsung Galaxy A05s', 'samsung-galaxy-a05s', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Samsung Galaxy A14', 'samsung-galaxy-a14', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Samsung Galaxy A24', 'samsung-galaxy-a24', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Samsung Galaxy A34', 'samsung-galaxy-a34', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Samsung Galaxy A54', 'samsung-galaxy-a54', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),

  -- iPhones
  ('iPhone 15', 'iphone-15', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('iPhone 15 Pro', 'iphone-15-pro', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('iPhone 15 Pro Max', 'iphone-15-pro-max', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('iPhone 15 Plus', 'iphone-15-plus', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('iPhone 14', 'iphone-14', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('iPhone 14 Pro', 'iphone-14-pro', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('iPhone 14 Pro Max', 'iphone-14-pro-max', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('iPhone 13', 'iphone-13', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('iPhone 13 Pro Max', 'iphone-13-pro-max', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('iPhone 12', 'iphone-12', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('iPhone 11', 'iphone-11', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('iPhone 16', 'iphone-16', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('iPhone 16 Pro', 'iphone-16-pro', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('iPhone 16 Pro Max', 'iphone-16-pro-max', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),

  -- Tecno phones (very popular on Jumia/Konga Nigeria)
  ('Tecno Camon 20', 'tecno-camon-20', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Tecno Camon 20 Pro', 'tecno-camon-20-pro', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Tecno Camon 30', 'tecno-camon-30', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Tecno Camon 30 Pro', 'tecno-camon-30-pro', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Tecno Spark 20', 'tecno-spark-20', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Tecno Spark 20 Pro', 'tecno-spark-20-pro', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Tecno Spark 20C', 'tecno-spark-20c', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Tecno Phantom X2', 'tecno-phantom-x2', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Tecno Phantom V Fold', 'tecno-phantom-v-fold', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Tecno Pop 8', 'tecno-pop-8', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Tecno Pova 5', 'tecno-pova-5', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Tecno Pova 5 Pro', 'tecno-pova-5-pro', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),

  -- Infinix phones
  ('Infinix Hot 40', 'infinix-hot-40', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Infinix Hot 40 Pro', 'infinix-hot-40-pro', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Infinix Hot 40i', 'infinix-hot-40i', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Infinix Note 40', 'infinix-note-40', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Infinix Note 40 Pro', 'infinix-note-40-pro', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Infinix Zero 30', 'infinix-zero-30', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Infinix Smart 8', 'infinix-smart-8', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Infinix GT 20 Pro', 'infinix-gt-20-pro', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),

  -- Xiaomi / Redmi
  ('Redmi Note 13', 'redmi-note-13', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Redmi Note 13 Pro', 'redmi-note-13-pro', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Redmi 13C', 'redmi-13c', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Xiaomi 14', 'xiaomi-14', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),

  -- Nokia / Itel / Others
  ('Nokia C32', 'nokia-c32', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Nokia G42', 'nokia-g42', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Itel A70', 'itel-a70', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Itel S24', 'itel-s24', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Itel P55', 'itel-p55', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Google Pixel 8', 'google-pixel-8', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),
  ('Google Pixel 8 Pro', 'google-pixel-8-pro', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Phones', 'per unit'),

  -- Tablets
  ('iPad 10th Generation', 'ipad-10th-generation', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Tablets', 'per unit'),
  ('iPad Air M2', 'ipad-air-m2', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Tablets', 'per unit'),
  ('iPad Pro M4', 'ipad-pro-m4', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Tablets', 'per unit'),
  ('Samsung Galaxy Tab A9', 'samsung-galaxy-tab-a9', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Tablets', 'per unit'),
  ('Samsung Galaxy Tab S9', 'samsung-galaxy-tab-s9', (SELECT id FROM categories WHERE slug = 'mobile-devices'), 'Tablets', 'per unit')
ON CONFLICT (slug) DO NOTHING;

-- ---- COMPUTING & ELECTRONICS ----
INSERT INTO products (name, slug, category_id, subcategory, unit) VALUES
  -- Laptops (scraped by Jumia & Konga)
  ('HP Laptop 15', 'hp-laptop-15', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('HP Pavilion 15', 'hp-pavilion-15', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('HP EliteBook 840', 'hp-elitebook-840', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('HP ProBook 450', 'hp-probook-450', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('HP Envy x360', 'hp-envy-x360', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('HP Spectre x360', 'hp-spectre-x360', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('Dell Inspiron 15', 'dell-inspiron-15', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('Dell Latitude 5540', 'dell-latitude-5540', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('Dell XPS 13', 'dell-xps-13', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('Dell XPS 15', 'dell-xps-15', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('Lenovo IdeaPad 3', 'lenovo-ideapad-3', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('Lenovo IdeaPad 5', 'lenovo-ideapad-5', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('Lenovo ThinkPad E14', 'lenovo-thinkpad-e14', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('Lenovo ThinkPad X1 Carbon', 'lenovo-thinkpad-x1-carbon', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('Lenovo Legion 5', 'lenovo-legion-5', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('MacBook Air M2', 'macbook-air-m2', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('MacBook Air M3', 'macbook-air-m3', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('MacBook Pro 14 M3', 'macbook-pro-14-m3', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('MacBook Pro 16 M3 Pro', 'macbook-pro-16-m3-pro', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('Asus VivoBook 15', 'asus-vivobook-15', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('Asus ZenBook 14', 'asus-zenbook-14', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('Acer Aspire 3', 'acer-aspire-3', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('Acer Aspire 5', 'acer-aspire-5', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),
  ('Acer Nitro 5', 'acer-nitro-5', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Laptops', 'per unit'),

  -- TVs
  ('LG 43 Inch Smart TV', 'lg-43-inch-smart-tv', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'TVs', 'per unit'),
  ('LG 55 Inch Smart TV', 'lg-55-inch-smart-tv', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'TVs', 'per unit'),
  ('Samsung 43 Inch Smart TV', 'samsung-43-inch-smart-tv', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'TVs', 'per unit'),
  ('Samsung 55 Inch Smart TV', 'samsung-55-inch-smart-tv', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'TVs', 'per unit'),
  ('Hisense 43 Inch Smart TV', 'hisense-43-inch-smart-tv', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'TVs', 'per unit'),
  ('Hisense 55 Inch Smart TV', 'hisense-55-inch-smart-tv', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'TVs', 'per unit'),

  -- Audio
  ('JBL Flip 6', 'jbl-flip-6', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Audio', 'per unit'),
  ('JBL Charge 5', 'jbl-charge-5', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Audio', 'per unit'),
  ('Apple AirPods Pro', 'apple-airpods-pro', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Audio', 'per unit'),
  ('Samsung Galaxy Buds', 'samsung-galaxy-buds', (SELECT id FROM categories WHERE slug = 'computing-electronics'), 'Audio', 'per unit')
ON CONFLICT (slug) DO NOTHING;

-- ---- AUTOMOBILES ----
-- Cars scraped from Jiji
INSERT INTO products (name, slug, category_id, subcategory, unit) VALUES
  -- Toyota (most popular in Nigeria)
  ('Toyota Camry', 'toyota-camry', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Toyota Corolla', 'toyota-corolla', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Toyota RAV4', 'toyota-rav4', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Toyota Highlander', 'toyota-highlander', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Toyota Venza', 'toyota-venza', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Toyota Land Cruiser', 'toyota-land-cruiser', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Toyota Hilux', 'toyota-hilux', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Toyota Sienna', 'toyota-sienna', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Toyota Avalon', 'toyota-avalon', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Toyota 4Runner', 'toyota-4runner', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Toyota Prado', 'toyota-prado', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),

  -- Honda
  ('Honda Accord', 'honda-accord', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Honda Civic', 'honda-civic', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Honda CR-V', 'honda-cr-v', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Honda Pilot', 'honda-pilot', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),

  -- Mercedes-Benz
  ('Mercedes-Benz C300', 'mercedes-benz-c300', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Mercedes-Benz E350', 'mercedes-benz-e350', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Mercedes-Benz GLE', 'mercedes-benz-gle', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Mercedes-Benz GLC', 'mercedes-benz-glc', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),

  -- BMW
  ('BMW X5', 'bmw-x5', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('BMW 3 Series', 'bmw-3-series', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('BMW X3', 'bmw-x3', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),

  -- Lexus
  ('Lexus RX 350', 'lexus-rx-350', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Lexus ES 350', 'lexus-es-350', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Lexus GX 460', 'lexus-gx-460', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Lexus LX 570', 'lexus-lx-570', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),

  -- Other brands popular in Nigeria
  ('Hyundai Tucson', 'hyundai-tucson', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Hyundai Elantra', 'hyundai-elantra', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Kia Sportage', 'kia-sportage', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Kia Rio', 'kia-rio', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Ford Explorer', 'ford-explorer', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Ford Edge', 'ford-edge', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Range Rover Sport', 'range-rover-sport', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Range Rover Evoque', 'range-rover-evoque', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Nissan Pathfinder', 'nissan-pathfinder', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Nissan Altima', 'nissan-altima', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Volkswagen Tiguan', 'volkswagen-tiguan', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Peugeot 301', 'peugeot-301', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Innoson IVM Fox', 'innoson-ivm-fox', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),
  ('Innoson IVM Caris', 'innoson-ivm-caris', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Cars', 'per unit'),

  -- Motorcycles
  ('Bajaj Boxer', 'bajaj-boxer', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Motorcycles', 'per unit'),
  ('Honda CG 125', 'honda-cg-125', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Motorcycles', 'per unit'),
  ('Suzuki GN 125', 'suzuki-gn-125', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Motorcycles', 'per unit'),
  ('TVS Apache', 'tvs-apache', (SELECT id FROM categories WHERE slug = 'automobiles'), 'Motorcycles', 'per unit')
ON CONFLICT (slug) DO NOTHING;

-- ---- REAL ESTATE & HOUSING ----
-- Apartments scraped from Jiji
INSERT INTO products (name, slug, category_id, subcategory, unit) VALUES
  ('1 Bedroom Flat', '1-bedroom-flat', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Rent', 'per year'),
  ('2 Bedroom Flat', '2-bedroom-flat', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Rent', 'per year'),
  ('3 Bedroom Flat', '3-bedroom-flat', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Rent', 'per year'),
  ('4 Bedroom Duplex', '4-bedroom-duplex', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Rent', 'per year'),
  ('5 Bedroom Duplex', '5-bedroom-duplex', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Rent', 'per year'),
  ('Self Contained Apartment', 'self-contained-apartment', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Rent', 'per year'),
  ('Studio Apartment', 'studio-apartment', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Rent', 'per year'),
  ('Mini Flat', 'mini-flat', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Rent', 'per year'),
  ('Room and Parlour', 'room-and-parlour', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Rent', 'per year'),
  ('Penthouse', 'penthouse', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Rent', 'per year'),
  ('Detached House', 'detached-house', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Sale', 'per unit'),
  ('Semi-Detached House', 'semi-detached-house', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Sale', 'per unit'),
  ('Terraced House', 'terraced-house', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Sale', 'per unit'),
  ('Commercial Space', 'commercial-space', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Commercial', 'per year'),
  ('Office Space', 'office-space', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Commercial', 'per year'),
  ('Shop Space', 'shop-space', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Commercial', 'per year'),
  ('Land Plot', 'land-plot', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Land', 'per plot'),
  ('Warehouse', 'warehouse', (SELECT id FROM categories WHERE slug = 'real-estate-housing'), 'Commercial', 'per year')
ON CONFLICT (slug) DO NOTHING;

-- ---- FOOD & AGRICULTURE ----
-- Groceries scraped from Jumia & Konga
INSERT INTO products (name, slug, category_id, subcategory, unit) VALUES
  -- Rice & Grains
  ('Rice', 'rice', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Grains', 'per 50kg'),
  ('Local Rice', 'local-rice', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Grains', 'per 50kg'),
  ('Foreign Rice', 'foreign-rice', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Grains', 'per 50kg'),
  ('Basmati Rice', 'basmati-rice', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Grains', 'per 5kg'),
  ('Ofada Rice', 'ofada-rice', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Grains', 'per 50kg'),
  ('Mama Gold Rice', 'mama-gold-rice', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Grains', 'per 50kg'),
  ('Royal Stallion Rice', 'royal-stallion-rice', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Grains', 'per 50kg'),
  ('Caprice Rice', 'caprice-rice', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Grains', 'per 50kg'),

  -- Beans & Legumes
  ('Beans', 'beans', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Grains', 'per 50kg'),
  ('Honey Beans', 'honey-beans', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Grains', 'per kg'),
  ('Brown Beans', 'brown-beans', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Grains', 'per kg'),

  -- Flour & Meals
  ('Semovita', 'semovita', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Flour', 'per 10kg'),
  ('Golden Penny Semovita', 'golden-penny-semovita', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Flour', 'per 10kg'),
  ('Wheat Flour', 'wheat-flour', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Flour', 'per 50kg'),
  ('Golden Penny Flour', 'golden-penny-flour', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Flour', 'per 50kg'),
  ('Honeywell Flour', 'honeywell-flour', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Flour', 'per 50kg'),
  ('Poundo Yam', 'poundo-yam', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Flour', 'per kg'),
  ('Plantain Flour', 'plantain-flour', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Flour', 'per kg'),
  ('Garri', 'garri', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Grains', 'per 50kg'),
  ('Ijebu Garri', 'ijebu-garri', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Grains', 'per 50kg'),

  -- Pasta & Noodles
  ('Spaghetti', 'spaghetti', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Pasta', 'per pack'),
  ('Golden Penny Spaghetti', 'golden-penny-spaghetti', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Pasta', 'per carton'),
  ('Dangote Spaghetti', 'dangote-spaghetti', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Pasta', 'per carton'),
  ('Indomie Noodles', 'indomie-noodles', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Pasta', 'per carton'),
  ('Indomie Instant Noodles', 'indomie-instant-noodles', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Pasta', 'per pack'),

  -- Cooking Oils
  ('Vegetable Oil', 'vegetable-oil', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Cooking Oil', 'per 5 litres'),
  ('Palm Oil', 'palm-oil', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Cooking Oil', 'per 25 litres'),
  ('Groundnut Oil', 'groundnut-oil', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Cooking Oil', 'per 5 litres'),
  ('Kings Vegetable Oil', 'kings-vegetable-oil', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Cooking Oil', 'per 5 litres'),
  ('Devon Kings Oil', 'devon-kings-oil', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Cooking Oil', 'per 5 litres'),
  ('Turkey Vegetable Oil', 'turkey-vegetable-oil', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Cooking Oil', 'per 5 litres'),
  ('Olive Oil', 'olive-oil', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Cooking Oil', 'per litre'),
  ('Coconut Oil', 'coconut-oil', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Cooking Oil', 'per litre'),

  -- Seasonings & Basics
  ('Tomato Paste', 'tomato-paste', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Seasonings', 'per tin'),
  ('Gino Tomato Paste', 'gino-tomato-paste', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Seasonings', 'per carton'),
  ('Maggi Seasoning', 'maggi-seasoning', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Seasonings', 'per carton'),
  ('Knorr Seasoning', 'knorr-seasoning', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Seasonings', 'per carton'),
  ('Salt', 'salt', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Seasonings', 'per kg'),
  ('Sugar', 'sugar', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Seasonings', 'per 50kg'),
  ('Dangote Sugar', 'dangote-sugar', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Seasonings', 'per 50kg'),

  -- Beverages
  ('Milo', 'milo', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Beverages', 'per tin'),
  ('Bournvita', 'bournvita', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Beverages', 'per tin'),
  ('Peak Milk', 'peak-milk', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Beverages', 'per tin'),
  ('Dano Milk', 'dano-milk', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Beverages', 'per tin'),
  ('Nescafe', 'nescafe', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Beverages', 'per jar'),

  -- Produce
  ('Yam Tubers', 'yam-tubers', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Produce', 'per tuber'),
  ('Plantain', 'plantain', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Produce', 'per bunch'),
  ('Tomatoes', 'tomatoes', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Produce', 'per basket'),
  ('Pepper', 'pepper', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Produce', 'per basket'),
  ('Onions', 'onions', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Produce', 'per bag'),
  ('Palm Fruit', 'palm-fruit', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Produce', 'per bunch'),
  ('Maize', 'maize', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Grains', 'per 100kg'),
  ('Millet', 'millet', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Grains', 'per 100kg'),
  ('Sorghum', 'sorghum', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Grains', 'per 100kg'),

  -- Proteins
  ('Frozen Chicken', 'frozen-chicken', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Proteins', 'per carton'),
  ('Frozen Turkey', 'frozen-turkey', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Proteins', 'per kg'),
  ('Frozen Fish', 'frozen-fish', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Proteins', 'per carton'),
  ('Stockfish', 'stockfish', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Proteins', 'per kg'),
  ('Dried Fish', 'dried-fish', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Proteins', 'per kg'),
  ('Eggs', 'eggs', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Proteins', 'per crate'),
  ('Beef', 'beef', (SELECT id FROM categories WHERE slug = 'food-agriculture'), 'Proteins', 'per kg')
ON CONFLICT (slug) DO NOTHING;

-- ---- ENERGY & FUEL ----
INSERT INTO products (name, slug, category_id, subcategory, unit) VALUES
  ('Petrol (PMS)', 'petrol-pms', (SELECT id FROM categories WHERE slug = 'energy-fuel'), 'Fuel', 'per litre'),
  ('Diesel (AGO)', 'diesel-ago', (SELECT id FROM categories WHERE slug = 'energy-fuel'), 'Fuel', 'per litre'),
  ('Kerosene (DPK)', 'kerosene-dpk', (SELECT id FROM categories WHERE slug = 'energy-fuel'), 'Fuel', 'per litre'),
  ('Cooking Gas (LPG)', 'cooking-gas-lpg', (SELECT id FROM categories WHERE slug = 'energy-fuel'), 'Gas', 'per 12.5kg'),
  ('Cooking Gas 6kg', 'cooking-gas-6kg', (SELECT id FROM categories WHERE slug = 'energy-fuel'), 'Gas', 'per 6kg'),
  ('Cooking Gas 25kg', 'cooking-gas-25kg', (SELECT id FROM categories WHERE slug = 'energy-fuel'), 'Gas', 'per 25kg'),
  ('Cooking Gas 50kg', 'cooking-gas-50kg', (SELECT id FROM categories WHERE slug = 'energy-fuel'), 'Gas', 'per 50kg')
ON CONFLICT (slug) DO NOTHING;

-- ---- BUILDING & CONSTRUCTION ----
INSERT INTO products (name, slug, category_id, subcategory, unit) VALUES
  ('Dangote Cement', 'dangote-cement', (SELECT id FROM categories WHERE slug = 'building-construction'), 'Cement', 'per bag'),
  ('BUA Cement', 'bua-cement', (SELECT id FROM categories WHERE slug = 'building-construction'), 'Cement', 'per bag'),
  ('Lafarge Cement', 'lafarge-cement', (SELECT id FROM categories WHERE slug = 'building-construction'), 'Cement', 'per bag'),
  ('Iron Rod 12mm', 'iron-rod-12mm', (SELECT id FROM categories WHERE slug = 'building-construction'), 'Steel', 'per length'),
  ('Iron Rod 16mm', 'iron-rod-16mm', (SELECT id FROM categories WHERE slug = 'building-construction'), 'Steel', 'per length'),
  ('Roofing Sheet', 'roofing-sheet', (SELECT id FROM categories WHERE slug = 'building-construction'), 'Roofing', 'per sheet'),
  ('Aluminum Roofing Sheet', 'aluminum-roofing-sheet', (SELECT id FROM categories WHERE slug = 'building-construction'), 'Roofing', 'per sheet'),
  ('Building Blocks', 'building-blocks', (SELECT id FROM categories WHERE slug = 'building-construction'), 'Blocks', 'per unit'),
  ('Granite', 'granite', (SELECT id FROM categories WHERE slug = 'building-construction'), 'Materials', 'per ton'),
  ('Sharp Sand', 'sharp-sand', (SELECT id FROM categories WHERE slug = 'building-construction'), 'Materials', 'per trip'),
  ('POP Ceiling', 'pop-ceiling', (SELECT id FROM categories WHERE slug = 'building-construction'), 'Finishing', 'per bag'),
  ('Tiles', 'tiles', (SELECT id FROM categories WHERE slug = 'building-construction'), 'Finishing', 'per carton'),
  ('Paint', 'paint', (SELECT id FROM categories WHERE slug = 'building-construction'), 'Finishing', 'per bucket'),
  ('Emulsion Paint', 'emulsion-paint', (SELECT id FROM categories WHERE slug = 'building-construction'), 'Finishing', 'per bucket')
ON CONFLICT (slug) DO NOTHING;

-- ---- INDUSTRIAL EQUIPMENT ----
INSERT INTO products (name, slug, category_id, subcategory, unit) VALUES
  ('Generator 2.5KVA', 'generator-2-5kva', (SELECT id FROM categories WHERE slug = 'industrial-equipment'), 'Generators', 'per unit'),
  ('Generator 3.5KVA', 'generator-3-5kva', (SELECT id FROM categories WHERE slug = 'industrial-equipment'), 'Generators', 'per unit'),
  ('Generator 5KVA', 'generator-5kva', (SELECT id FROM categories WHERE slug = 'industrial-equipment'), 'Generators', 'per unit'),
  ('Generator 10KVA', 'generator-10kva', (SELECT id FROM categories WHERE slug = 'industrial-equipment'), 'Generators', 'per unit'),
  ('Solar Panel 300W', 'solar-panel-300w', (SELECT id FROM categories WHERE slug = 'industrial-equipment'), 'Solar', 'per unit'),
  ('Solar Panel 500W', 'solar-panel-500w', (SELECT id FROM categories WHERE slug = 'industrial-equipment'), 'Solar', 'per unit'),
  ('Inverter 1.5KVA', 'inverter-1-5kva', (SELECT id FROM categories WHERE slug = 'industrial-equipment'), 'Solar', 'per unit'),
  ('Inverter 3.5KVA', 'inverter-3-5kva', (SELECT id FROM categories WHERE slug = 'industrial-equipment'), 'Solar', 'per unit'),
  ('Inverter Battery', 'inverter-battery', (SELECT id FROM categories WHERE slug = 'industrial-equipment'), 'Solar', 'per unit'),
  ('Water Pump', 'water-pump', (SELECT id FROM categories WHERE slug = 'industrial-equipment'), 'Pumps', 'per unit'),
  ('Drilling Machine', 'drilling-machine', (SELECT id FROM categories WHERE slug = 'industrial-equipment'), 'Tools', 'per unit'),
  ('Welding Machine', 'welding-machine', (SELECT id FROM categories WHERE slug = 'industrial-equipment'), 'Tools', 'per unit')
ON CONFLICT (slug) DO NOTHING;

-- ---- HOME & LIVING ----
INSERT INTO products (name, slug, category_id, subcategory, unit) VALUES
  ('Standing Fan', 'standing-fan', (SELECT id FROM categories WHERE slug = 'home-living'), 'Appliances', 'per unit'),
  ('Ceiling Fan', 'ceiling-fan', (SELECT id FROM categories WHERE slug = 'home-living'), 'Appliances', 'per unit'),
  ('Air Conditioner 1HP', 'air-conditioner-1hp', (SELECT id FROM categories WHERE slug = 'home-living'), 'Appliances', 'per unit'),
  ('Air Conditioner 1.5HP', 'air-conditioner-1-5hp', (SELECT id FROM categories WHERE slug = 'home-living'), 'Appliances', 'per unit'),
  ('Air Conditioner 2HP', 'air-conditioner-2hp', (SELECT id FROM categories WHERE slug = 'home-living'), 'Appliances', 'per unit'),
  ('Refrigerator', 'refrigerator', (SELECT id FROM categories WHERE slug = 'home-living'), 'Appliances', 'per unit'),
  ('Washing Machine', 'washing-machine', (SELECT id FROM categories WHERE slug = 'home-living'), 'Appliances', 'per unit'),
  ('Microwave Oven', 'microwave-oven', (SELECT id FROM categories WHERE slug = 'home-living'), 'Appliances', 'per unit'),
  ('Gas Cooker', 'gas-cooker', (SELECT id FROM categories WHERE slug = 'home-living'), 'Appliances', 'per unit'),
  ('Electric Blender', 'electric-blender', (SELECT id FROM categories WHERE slug = 'home-living'), 'Appliances', 'per unit'),
  ('Iron Press', 'iron-press', (SELECT id FROM categories WHERE slug = 'home-living'), 'Appliances', 'per unit'),
  ('Mattress', 'mattress', (SELECT id FROM categories WHERE slug = 'home-living'), 'Furniture', 'per unit'),
  ('Mouka Foam Mattress', 'mouka-foam-mattress', (SELECT id FROM categories WHERE slug = 'home-living'), 'Furniture', 'per unit'),
  ('Dining Table Set', 'dining-table-set', (SELECT id FROM categories WHERE slug = 'home-living'), 'Furniture', 'per set'),
  ('Office Chair', 'office-chair', (SELECT id FROM categories WHERE slug = 'home-living'), 'Furniture', 'per unit'),
  ('Sofa Set', 'sofa-set', (SELECT id FROM categories WHERE slug = 'home-living'), 'Furniture', 'per set'),
  ('Wardrobe', 'wardrobe', (SELECT id FROM categories WHERE slug = 'home-living'), 'Furniture', 'per unit'),
  ('Bed Frame', 'bed-frame', (SELECT id FROM categories WHERE slug = 'home-living'), 'Furniture', 'per unit')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 4. Mark some products as featured
-- ============================================
UPDATE products SET is_featured = TRUE WHERE slug IN (
  'samsung-galaxy-a15',
  'iphone-15',
  'tecno-camon-30',
  'hp-laptop-15',
  'macbook-air-m3',
  'toyota-camry',
  'rice',
  'vegetable-oil',
  'dangote-cement',
  'petrol-pms',
  'cooking-gas-lpg',
  'generator-3-5kva',
  '2-bedroom-flat',
  'air-conditioner-1-5hp',
  'frozen-chicken',
  'eggs'
);

-- ============================================
-- 5. Refresh materialized views
-- ============================================
REFRESH MATERIALIZED VIEW latest_prices;
REFRESH MATERIALIZED VIEW product_price_summaries;
