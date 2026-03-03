import DOMPurify from 'dompurify';

/**
 * Sanitize user input to prevent XSS attacks.
 * Strips all HTML tags and attributes.
 */
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/**
 * Validate email format.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate Nigerian phone number format.
 */
export function isValidNigerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, '');
  // Nigerian phone: +234XXXXXXXXXX or 0XXXXXXXXXX
  const phoneRegex = /^(\+234|0)[789]\d{9}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Sanitize and validate a search query.
 * Returns null if invalid.
 */
export function sanitizeSearchQuery(query: string): string | null {
  const sanitized = sanitizeInput(query).trim();
  if (sanitized.length === 0 || sanitized.length > 200) {
    return null;
  }
  return sanitized;
}

/**
 * Rate limiter for client-side actions.
 */
export class RateLimiter {
  private timestamps: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canProceed(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
    if (this.timestamps.length >= this.maxRequests) {
      return false;
    }
    this.timestamps.push(now);
    return true;
  }
}
