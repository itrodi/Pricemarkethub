import { logger } from './logger.js';

// ============================================
// Configuration
// ============================================
const MIN_DELAY = parseInt(process.env.SCRAPE_DELAY_MIN || '1500', 10);
const MAX_DELAY = parseInt(process.env.SCRAPE_DELAY_MAX || '4000', 10);
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;
const PROXY_URL = process.env.PROXY_URL || ''; // e.g., http://user:pass@proxy.example.com:8080

// ============================================
// User-Agent Rotation
// ============================================
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
];

const ACCEPT_LANGUAGES = [
  'en-NG,en-US;q=0.9,en;q=0.8',
  'en-US,en;q=0.9',
  'en-GB,en;q=0.9,en-US;q=0.8',
  'en-NG,en;q=0.9',
];

/**
 * Get a random item from an array.
 */
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get a random delay between min and max.
 */
function randomDelay() {
  return MIN_DELAY + Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY));
}

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Build randomized headers that mimic a real browser.
 */
function buildHeaders() {
  const ua = randomChoice(USER_AGENTS);
  const isChrome = ua.includes('Chrome');
  const isFirefox = ua.includes('Firefox');

  const headers = {
    'User-Agent': ua,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': randomChoice(ACCEPT_LANGUAGES),
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Upgrade-Insecure-Requests': '1',
  };

  if (isChrome) {
    headers['Sec-Fetch-Dest'] = 'document';
    headers['Sec-Fetch-Mode'] = 'navigate';
    headers['Sec-Fetch-Site'] = 'none';
    headers['Sec-Fetch-User'] = '?1';
    headers['sec-ch-ua'] = '"Chromium";v="134", "Google Chrome";v="134", "Not:A-Brand";v="99"';
    headers['sec-ch-ua-mobile'] = '?0';
    headers['sec-ch-ua-platform'] = '"Windows"';
  } else if (isFirefox) {
    headers['Sec-Fetch-Dest'] = 'document';
    headers['Sec-Fetch-Mode'] = 'navigate';
    headers['Sec-Fetch-Site'] = 'none';
    headers['Sec-Fetch-User'] = '?1';
  }

  return headers;
}

/**
 * Build fetch options, optionally with proxy support.
 */
function buildFetchOptions(headers) {
  const options = {
    headers,
    signal: AbortSignal.timeout(30000),
  };

  // Node.js 18+ supports undici proxy via environment variable
  // For proxy support, set HTTPS_PROXY or HTTP_PROXY env vars,
  // or use the PROXY_URL config
  if (PROXY_URL) {
    // undici/node-fetch proxy support via dispatcher not available in native fetch
    // Users should set HTTP_PROXY/HTTPS_PROXY environment variables instead
    // or use a proxy agent package
    logger.debug(`Proxy configured: ${PROXY_URL.replace(/\/\/.*@/, '//***@')}`);
  }

  return options;
}

/**
 * Fetch a URL with retry logic, rate limiting, and anti-detection.
 * Returns the HTML body as a string, or null on failure.
 */
export async function fetchPage(url, source = '') {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const headers = buildHeaders();
      logger.debug(`Fetching ${url} (attempt ${attempt})`, {}, source);

      const options = buildFetchOptions(headers);
      const response = await fetch(url, options);

      if (!response.ok) {
        logger.warn(`HTTP ${response.status} for ${url}`, { status: response.status }, source);

        // Don't retry on 403/404
        if (response.status === 403 || response.status === 404) {
          return null;
        }

        if (attempt < MAX_RETRIES) {
          const backoff = RETRY_DELAY * attempt + Math.floor(Math.random() * 2000);
          await sleep(backoff);
          continue;
        }
        return null;
      }

      const html = await response.text();
      logger.debug(`Fetched ${url} (${(html.length / 1024).toFixed(1)} KB)`, {}, source);

      // Randomized polite delay between requests
      const delay = randomDelay();
      await sleep(delay);

      return html;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn(`Fetch error for ${url}: ${message}`, {}, source);

      if (attempt < MAX_RETRIES) {
        const backoff = RETRY_DELAY * attempt + Math.floor(Math.random() * 2000);
        await sleep(backoff);
      }
    }
  }

  logger.error(`Failed to fetch ${url} after ${MAX_RETRIES} attempts`, {}, source);
  return null;
}

/**
 * Check robots.txt for a given base URL.
 * Returns true if scraping is likely allowed.
 */
export async function checkRobotsTxt(baseUrl, source = '') {
  try {
    const robotsUrl = `${baseUrl}/robots.txt`;
    const response = await fetch(robotsUrl, {
      headers: { 'User-Agent': randomChoice(USER_AGENTS) },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      logger.info(`No robots.txt found at ${robotsUrl}, proceeding.`, {}, source);
      return true;
    }

    const text = await response.text();
    const lines = text.split('\n').map(l => l.trim().toLowerCase());

    let inUserAgentBlock = false;
    for (const line of lines) {
      if (line.startsWith('user-agent:')) {
        const agent = line.split(':')[1]?.trim();
        inUserAgentBlock = agent === '*';
      }
      if (inUserAgentBlock && line === 'disallow: /') {
        logger.warn(`robots.txt disallows all crawling at ${baseUrl}`, {}, source);
        return false;
      }
    }

    logger.info(`robots.txt check passed for ${baseUrl}`, {}, source);
    return true;
  } catch {
    logger.info(`Could not fetch robots.txt for ${baseUrl}, proceeding.`, {}, source);
    return true;
  }
}
