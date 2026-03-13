export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  color: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  state: string;
  region: string;
  location_type: 'city' | 'market' | 'online';
  latitude: number | null;
  longitude: number | null;
  is_major: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  subcategory: string | null;
  unit: string;
  description: string | null;
  image_url: string | null;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface PricePoint {
  id: string;
  product_id: string;
  location_id: string;
  price: number;
  currency: string;
  source: 'jumia' | 'konga' | 'jiji' | 'nbs' | 'cbn' | 'nnpc' | 'market_survey' | 'user_report';
  verified: boolean;
  recorded_at: string;
  created_at: string;
}

export interface PriceAlert {
  id: string;
  product_id: string;
  location_id: string | null;
  contact_type: 'email' | 'phone';
  contact_value: string;
  threshold_type: 'percentage' | 'absolute';
  threshold_value: number;
  direction: 'up' | 'down' | 'both';
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
}

export interface LatestPrice {
  id: string;
  product_id: string;
  location_id: string;
  price: number;
  currency: string;
  source: string;
  verified: boolean;
  recorded_at: string;
  product_name: string;
  product_slug: string;
  unit: string;
  category_id: string;
  location_name: string;
  state: string;
  region: string;
}

export interface ProductPriceSummary {
  product_id: string;
  name: string;
  slug: string;
  category_id: string;
  unit: string;
  subcategory: string | null;
  is_featured: boolean;
  view_count: number;
  image_url: string | null;
  description: string | null;
  condition: string | null;
  avg_price: number;
  min_price: number;
  max_price: number;
  data_points: number;
  last_updated: string | null;
}

export interface PriceChange {
  product_id: string;
  product_name: string;
  product_slug: string;
  category_id: string;
  unit: string;
  current_avg: number;
  previous_avg: number;
  change_pct: number;
  abs_change: number;
}

export interface PriceHistoryPoint {
  recorded_date: string;
  location_id: string;
  location_name: string;
  avg_price: number;
  min_price: number;
  max_price: number;
}

export interface SearchResult {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  subcategory: string | null;
  unit: string;
  similarity_score: number;
}

export interface CompareItem {
  productId: string;
  locationId?: string;
}
