#!/usr/bin/env node

/**
 * PriceWise Nigeria - Scraper Scheduler
 *
 * Runs all scrapers on a configurable schedule.
 * Default: every day at 6:00 AM and 6:00 PM (WAT).
 *
 * Usage:
 *   node src/scheduler.js
 *
 * Environment:
 *   SCHEDULE_HOURS=6,18     (hours to run, comma-separated, 24h format)
 *   SCHEDULE_INTERVAL=60    (check interval in minutes)
 */

import 'dotenv/config';
import { initDatabase } from './database.js';
import { runAllScrapers } from './scraper.js';
import { logger } from './logger.js';

const SCHEDULE_HOURS = (process.env.SCHEDULE_HOURS || '6,18')
  .split(',')
  .map(h => parseInt(h.trim(), 10))
  .filter(h => !isNaN(h) && h >= 0 && h <= 23);

const CHECK_INTERVAL = parseInt(process.env.SCHEDULE_INTERVAL || '60', 10) * 60 * 1000;

let lastRunDate = '';

async function checkAndRun() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDate = now.toISOString().split('T')[0];
  const runKey = `${currentDate}-${currentHour}`;

  // Only run once per scheduled hour per day
  if (SCHEDULE_HOURS.includes(currentHour) && lastRunDate !== runKey) {
    lastRunDate = runKey;
    logger.info(`Scheduled run triggered at ${now.toISOString()}`);

    try {
      await runAllScrapers();
    } catch (err) {
      logger.error(`Scheduled run failed: ${err.message}`);
    }
  }
}

function main() {
  logger.info('PriceWise Scraper Scheduler starting...', {
    scheduleHours: SCHEDULE_HOURS,
    checkIntervalMinutes: CHECK_INTERVAL / 60000,
  });

  initDatabase();

  // Check immediately
  checkAndRun();

  // Then check periodically
  setInterval(checkAndRun, CHECK_INTERVAL);

  logger.info(`Scheduler running. Will scrape at hours: ${SCHEDULE_HOURS.join(', ')} (local time).`);
  logger.info('Press Ctrl+C to stop.');
}

main();
