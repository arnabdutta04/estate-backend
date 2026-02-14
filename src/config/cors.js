// CORS Configuration
const cors = require('cors');

const corsOptions = {
  // Allow requests from these origins
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://estatefrontend-drab.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean); // Remove undefined values

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      // For development, allow all origins
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },

  // Allow credentials (cookies, authorization headers, etc.)
  credentials: true,

  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],

  // Exposed headers
  exposedHeaders: ['Content-Length', 'X-Request-Id'],

  // Cache preflight requests for 24 hours
  maxAge: 86400,

  // Enable preflight for all routes
  preflightContinue: false,

  // Success status for OPTIONS requests
  optionsSuccessStatus: 204
};

module.exports = corsOptions;