const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { sequelize, testConnection, syncDatabase } = require('./src/config/database');

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy - Required for cloud deployment (Koyeb/Render)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// Compression middleware
app.use(compression());

// CORS Configuration - Allow your Vercel frontend (Production)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_ADDITIONAL // Optional: for multiple domains
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - Prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Serve static files (only if using local storage - not recommended for production)
// For production, use Supabase Storage or Cloudinary
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Health check - CRITICAL for Koyeb/any cloud platform
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ 
      status: 'ok',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'production',
      platform: 'Koyeb + Supabase'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Real Estate API - Production Ready',
    version: '1.0.0',
    status: 'running',
    platform: 'Koyeb + Supabase PostgreSQL',
    documentation: '/api/docs',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      properties: '/api/properties',
      brokers: '/api/brokers',
      messages: '/api/messages',
      contact: '/api/contact',
      schedules: '/api/schedules',
      admin: '/api/admin'
    }
  });
});

// API Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/properties', require('./src/routes/propertyRoutes'));
app.use('/api/brokers', require('./src/routes/brokerRoutes'));
app.use('/api/messages', require('./src/routes/messageRoutes'));
app.use('/api/contact', require('./src/routes/contactRoutes'));
app.use('/api/schedules', require('./src/routes/scheduleRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/properties',
      'GET /api/brokers'
    ]
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Server startup configuration
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    console.log('🚀 Starting Real Estate API Server...');
    console.log('📍 Environment:', process.env.NODE_ENV || 'production');
    console.log('🌐 Port:', PORT);
    console.log('🔗 Frontend URL:', process.env.FRONTEND_URL);
    console.log('🗄️  Database Platform: Supabase PostgreSQL');
    console.log('☁️  Hosting Platform: Koyeb');
    
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Cannot start - database connection failed');
      console.error('💡 Check your DATABASE_URL environment variable');
      console.error('💡 Make sure Supabase database is accessible');
      process.exit(1);
    }

    // Sync database models
    console.log('🔄 Syncing database models...');
    await syncDatabase();
    console.log('✅ Database models synced successfully');

    // Start listening on all network interfaces (required for Koyeb)
    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('✅ ========================================');
      console.log('✅  SERVER RUNNING SUCCESSFULLY');
      console.log('✅ ========================================');
      console.log(`🌐 Platform: Koyeb + Supabase`);
      console.log(`🏥 Health Check: /health`);
      console.log(`📡 API Base: /api`);
      console.log(`🔐 CORS Allowed: ${process.env.FRONTEND_URL}`);
      console.log('✅ ========================================');
      console.log('');
    });

  } catch (error) {
    console.error('❌ ========================================');
    console.error('❌  SERVER FAILED TO START');
    console.error('❌ ========================================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('❌ ========================================');
    process.exit(1);
  }
};

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('');
  console.log('📡 SIGTERM signal received: closing HTTP server');
  try {
    await sequelize.close();
    console.log('✅ Database connection closed');
    console.log('👋 Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('');
  console.log('📡 SIGINT signal received: closing HTTP server');
  try {
    await sequelize.close();
    console.log('✅ Database connection closed');
    console.log('👋 Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('❌ Reason:', reason);
  // Don't exit the process in production
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('❌ Stack:', error.stack);
  // Exit process for uncaught exceptions
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;