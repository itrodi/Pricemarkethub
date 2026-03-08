#!/usr/bin/env node

/**
 * PriceWise Scraper API Server
 *
 * Exposes the scraper functionality via HTTP endpoints
 * so the admin panel can trigger and monitor scrape jobs.
 *
 * Endpoints:
 *   GET  /api/scraper/sources   - List available sources and categories
 *   POST /api/scraper/run       - Start a scrape job
 *   GET  /api/scraper/status    - Get current job status
 *   GET  /api/scraper/logs      - SSE stream of live logs
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDatabase } from './database.js';
import { runScraper } from './scraper.js';
import { SOURCES } from '../config/sources.js';

const app = express();
app.use(cors());
app.use(express.json());

// --- State ---
let currentJob = null;
const logBuffer = [];
const MAX_LOG_BUFFER = 500;
const sseClients = new Set();

/**
 * Capture logs and broadcast to SSE clients.
 */
function addLog(level, message, data = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data: Object.keys(data).length > 0 ? data : undefined,
  };
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOG_BUFFER) logBuffer.shift();

  // Broadcast to all SSE clients
  const payload = `data: ${JSON.stringify(entry)}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

/**
 * Monkey-patch the logger to also pipe to our log buffer/SSE.
 */
function patchLogger() {
  const origLog = console.log;
  const origWarn = console.warn;
  const origError = console.error;

  console.log = (...args) => {
    origLog(...args);
    const msg = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
    addLog('info', msg);
  };
  console.warn = (...args) => {
    origWarn(...args);
    const msg = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
    addLog('warn', msg);
  };
  console.error = (...args) => {
    origError(...args);
    const msg = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
    addLog('error', msg);
  };
}

// --- Endpoints ---

/**
 * GET /api/scraper/sources
 * Returns available sources with their categories.
 */
app.get('/api/scraper/sources', (_req, res) => {
  const sources = Object.entries(SOURCES).map(([key, config]) => ({
    key,
    name: config.name,
    baseUrl: config.baseUrl,
    categories: config.categories.map(c => ({
      name: c.name,
      categorySlug: c.categorySlug,
      subcategorySlug: c.subcategorySlug,
      urls: c.urls,
    })),
  }));

  res.json({ sources });
});

/**
 * POST /api/scraper/run
 * Start a scrape job.
 * Body: { source: 'jiji', categoryIndex?: number }
 */
app.post('/api/scraper/run', async (req, res) => {
  if (currentJob && currentJob.status === 'running') {
    return res.status(409).json({ error: 'A scrape job is already running.' });
  }

  const { source } = req.body;

  if (!source || !SOURCES[source]) {
    return res.status(400).json({
      error: `Invalid source. Available: ${Object.keys(SOURCES).join(', ')}`,
    });
  }

  // Initialize DB
  initDatabase();

  // Clear previous logs
  logBuffer.length = 0;

  // Set up job
  currentJob = {
    id: Date.now().toString(36),
    source,
    sourceName: SOURCES[source].name,
    status: 'running',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    result: null,
    error: null,
  };

  addLog('info', `Starting scrape job for ${SOURCES[source].name}...`);

  // Return immediately, run scraper in background
  res.json({ job: currentJob });

  // Run scraper asynchronously
  try {
    const result = await runScraper(source);
    currentJob.status = 'completed';
    currentJob.finishedAt = new Date().toISOString();
    currentJob.result = result;
    addLog('info', `Scrape job completed: ${result.totalScraped} scraped, ${result.productsCreated} products, ${result.pricePointsInserted} prices`);
  } catch (err) {
    currentJob.status = 'failed';
    currentJob.finishedAt = new Date().toISOString();
    currentJob.error = err.message;
    addLog('error', `Scrape job failed: ${err.message}`);
  }
});

/**
 * GET /api/scraper/status
 * Returns current/last job status.
 */
app.get('/api/scraper/status', (_req, res) => {
  res.json({ job: currentJob });
});

/**
 * GET /api/scraper/logs
 * Server-Sent Events stream for real-time logs.
 */
app.get('/api/scraper/logs', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Send existing logs as initial batch
  for (const entry of logBuffer) {
    res.write(`data: ${JSON.stringify(entry)}\n\n`);
  }

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

/**
 * POST /api/scraper/stop
 * Note: We can't truly abort a running scrape mid-flight,
 * but we can mark it as cancelled for the UI.
 */
app.post('/api/scraper/stop', (_req, res) => {
  if (!currentJob || currentJob.status !== 'running') {
    return res.status(400).json({ error: 'No running job to stop.' });
  }

  currentJob.status = 'cancelled';
  currentJob.finishedAt = new Date().toISOString();
  addLog('warn', 'Scrape job was cancelled by user.');

  res.json({ job: currentJob });
});

// --- Start ---
const PORT = parseInt(process.env.SCRAPER_PORT || '3001', 10);

patchLogger();

app.listen(PORT, () => {
  console.log(`Scraper API server running on http://localhost:${PORT}`);
  console.log(`Available sources: ${Object.keys(SOURCES).join(', ')}`);
});
