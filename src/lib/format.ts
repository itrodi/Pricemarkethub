/**
 * Format a number as Nigerian Naira currency.
 */
export function formatNaira(amount: number): string {
  if (amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(1)}M`;
  }
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: amount < 100 ? 2 : 0,
  }).format(amount);
}

/**
 * Format a number as a full Naira amount (no abbreviation).
 */
export function formatNairaFull(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: amount < 100 ? 2 : 0,
    maximumFractionDigits: amount < 100 ? 2 : 0,
  }).format(amount);
}

/**
 * Format percentage change with sign and color class.
 */
export function formatChange(pct: number): { text: string; className: string } {
  const sign = pct > 0 ? '+' : '';
  const text = `${sign}${pct.toFixed(1)}%`;
  const className = pct > 0 ? 'change-up' : pct < 0 ? 'change-down' : 'change-flat';
  return { text, className };
}

/**
 * Format a date relative to now.
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

/**
 * Format a date as short string.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format large numbers with K/M suffixes.
 */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
