// Lightweight structured logger (kept dependency-free for portability).
// In a larger production system this would be swapped for winston/pino.
const levels = { info: 'INFO', warn: 'WARN', error: 'ERROR' };

function log(level, message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${levels[level]}] ${message}`;
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

module.exports = {
  info: (msg) => log('info', msg),
  warn: (msg) => log('warn', msg),
  error: (msg) => log('error', msg),
};
