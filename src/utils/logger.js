// Logger utility for application logging

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Colors for console output
const COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[35m', // Magenta
  RESET: '\x1b[0m'
};

// Format timestamp
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString();
};

// Write to log file
const writeToFile = (level, message, meta = {}) => {
  const logEntry = {
    timestamp: getTimestamp(),
    level,
    message,
    ...meta
  };

  const logLine = JSON.stringify(logEntry) + '\n';
  const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);

  fs.appendFile(logFile, logLine, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
};

// Format console output
const formatConsoleOutput = (level, message, meta = {}) => {
  const color = COLORS[level] || COLORS.RESET;
  const timestamp = getTimestamp();
  
  let output = `${color}[${timestamp}] [${level}]${COLORS.RESET} ${message}`;
  
  if (Object.keys(meta).length > 0) {
    output += '\n' + JSON.stringify(meta, null, 2);
  }
  
  return output;
};

// Main logging function
const log = (level, message, meta = {}) => {
  // Write to file in production
  if (process.env.NODE_ENV === 'production') {
    writeToFile(level, message, meta);
  }

  // Always log to console
  const formattedMessage = formatConsoleOutput(level, message, meta);
  
  switch (level) {
    case LOG_LEVELS.ERROR:
      console.error(formattedMessage);
      break;
    case LOG_LEVELS.WARN:
      console.warn(formattedMessage);
      break;
    case LOG_LEVELS.INFO:
      console.info(formattedMessage);
      break;
    case LOG_LEVELS.DEBUG:
      if (process.env.NODE_ENV === 'development') {
        console.log(formattedMessage);
      }
      break;
    default:
      console.log(formattedMessage);
  }
};

// Logger object with convenience methods
const logger = {
  error: (message, meta = {}) => {
    log(LOG_LEVELS.ERROR, message, meta);
  },

  warn: (message, meta = {}) => {
    log(LOG_LEVELS.WARN, message, meta);
  },

  info: (message, meta = {}) => {
    log(LOG_LEVELS.INFO, message, meta);
  },

  debug: (message, meta = {}) => {
    log(LOG_LEVELS.DEBUG, message, meta);
  },

  // Log HTTP requests
  request: (req) => {
    const meta = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    log(LOG_LEVELS.INFO, 'HTTP Request', meta);
  },

  // Log HTTP responses
  response: (req, res, responseTime) => {
    const meta = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`
    };
    log(LOG_LEVELS.INFO, 'HTTP Response', meta);
  },

  // Log database queries (optional)
  query: (query, duration) => {
    if (process.env.NODE_ENV === 'development') {
      const meta = {
        query,
        duration: `${duration}ms`
      };
      log(LOG_LEVELS.DEBUG, 'Database Query', meta);
    }
  }
};

// Express middleware for request logging
logger.middleware = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.request(req);

  // Log response when finished
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.response(req, res, responseTime);
  });

  next();
};

module.exports = logger;