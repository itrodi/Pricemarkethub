#!/usr/bin/env node

/**
 * PriceWise Nigeria - Price Data Scraper
 *
 * Usage:
 *   node src/index.js                  # Run all scrapers
 *   node src/index.js --source jumia   # Run specific scraper
 *   node src/index.js --source konga   # Run specific scraper
 *   node src/index.js --source jiji    # Run specific scraper
 *   node src/index.js --dry-run        # Don't save to DB
 */

import 'dotenv/config';
import { initDatabase } from './database.js';
import { runScraper, runAllScrapers } from './scraper.js';
import { logger } from './logger.js';
import { SOURCES } from '../config/sources.js';

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { source: null, dryRun: false };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--source' && args[i + 1]) {
      opts.source = args[++i];
    }
    if (args[i] === '--dry-run') {
      opts.dryRun = true;
    }
  }

  return opts;
}

async function main() {
  const opts = parseArgs();

  logger.info('PriceWise Scraper starting...', {
    source: opts.source || 'all',
    dryRun: opts.dryRun,
  });

  // Initialize database (unless dry-run)
  if (!opts.dryRun) {
    initDatabase();
  } else {
    logger.info('Dry-run mode: no data will be saved to database.');
  }

  let results;

  if (opts.source) {
    // Validate source
    if (!SOURCES[opts.source]) {
      logger.error(`Unknown source: "${opts.source}". Available: ${Object.keys(SOURCES).join(', ')}`);
      process.exit(1);
    }

    results = [await runScraper(opts.source)];
  } else {
    results = await runAllScrapers();
  }

  // Summary
  const totalMatched = results.reduce((sum, r) => sum + (r.totalMatched || 0), 0);
  const totalInserted = results.reduce((sum, r) => sum + (r.pricePointsInserted || 0), 0);
  const errors = results.filter(r => r.error);

  logger.info(`\nFinal Summary: ${totalMatched} products matched, ${totalInserted} price points saved, ${errors.length} errors.`);

  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  logger.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
