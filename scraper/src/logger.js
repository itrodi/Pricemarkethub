/**
 * Simple structured logger for the scraper.
 */

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = LEVELS[process.env.LOG_LEVEL || 'info'] ?? LEVELS.info;

function timestamp() {
  return new Date().toISOString();
}

function format(level, source, message, data) {
  const parts = [`[${timestamp()}]`, `[${level.toUpperCase()}]`];
  if (source) parts.push(`[${source}]`);
  parts.push(message);
  if (data && Object.keys(data).length > 0) {
    parts.push(JSON.stringify(data));
  }
  return parts.join(' ');
}

export const logger = {
  debug(message, data = {}, source = '') {
    if (currentLevel <= LEVELS.debug) {
      console.log(format('debug', source, message, data));
    }
  },
  info(message, data = {}, source = '') {
    if (currentLevel <= LEVELS.info) {
      console.log(format('info', source, message, data));
    }
  },
  warn(message, data = {}, source = '') {
    if (currentLevel <= LEVELS.warn) {
      console.warn(format('warn', source, message, data));
    }
  },
  error(message, data = {}, source = '') {
    if (currentLevel <= LEVELS.error) {
      console.error(format('error', source, message, data));
    }
  },
};
