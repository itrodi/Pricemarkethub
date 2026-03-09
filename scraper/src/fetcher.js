import { logger } from './logger.js';

const DEFAULT_DELAY = parseInt(process.env.SCRAPE_DELAY_MS || '2000', 10);
const USER_AGENT = process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch a URL with retry logic, rate limiting, and proper headers.
 * Returns the HTML body as a string, or null on failure.
 */
export async function fetchPage(url, source = '') {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.debug(`Fetching ${url} (attempt ${attempt})`, {}, source);

      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-NG,en-US;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      if (!response.ok) {
        logger.warn(`HTTP ${response.status} for ${url}`, { status: response.status }, source);

        // Don't retry on 403/404
        if (response.status === 403 || response.status === 404) {
          return null;
        }

        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY * attempt);
          continue;
        }
        return null;
      }

      const html = await response.text();
      logger.debug(`Fetched ${url} (${(html.length / 1024).toFixed(1)} KB)`, {}, source);

      // Polite delay between requests
      await sleep(DEFAULT_DELAY);

      return html;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn(`Fetch error for ${url}: ${message}`, {}, source);

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY * attempt);
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
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      logger.info(`No robots.txt found at ${robotsUrl}, proceeding.`, {}, source);
      return true;
    }

    const text = await response.text();
    const lines = text.split('\n').map(l => l.trim().toLowerCase());

    // Simple check: look for "Disallow: /" for all agents
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
