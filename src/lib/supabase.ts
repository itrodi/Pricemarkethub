/**
 * API configuration.
 * In production, the API is served from the same domain via Nginx reverse proxy.
 * In development, Vite proxies /api to the API server.
 */
export const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Whether the API backend is configured.
 */
export const isApiConfigured = true;

// Legacy compat — pages check this to decide mock vs real data
export const isSupabaseConfigured = true;
export const supabase = null;
