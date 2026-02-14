// src/config/config.js
require('dotenv').config();

const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8000,
  
  // Frontend URL (CORS)
  frontendUrl: process.env.FRONTEND_URL || 'https://estatefrontend-drab.vercel.app',
  
  // Backend URL
  backendUrl: process.env.BACKEND_URL || 'https://shrill-amphibian-estate-backend-f9bf3bf3.koyeb.app',
  
  // Database
  database: {
    url: process.env.DATABASE_URL || process.env.DB_URL,
    dialect: 'postgres',
    ssl: process.env.NODE_ENV === 'production'
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refreshExpiresIn: '30d'
  },
  
  // Email Configuration (for nodemailer)
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    },
    from: process.env.EMAIL_FROM || 'Propify <noreply@propify.com>'
  },
  
  // File Upload Configuration
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'],
    destination: process.env.UPLOAD_PATH || './public/uploads'
  },
  
  // Cloudinary Configuration (optional - for cloud storage)
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    enabled: process.env.USE_CLOUDINARY === 'true'
  },
  
  // Pagination
  pagination: {
    defaultLimit: 12,
    maxLimit: 100
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  // Session
  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true
    }
  },
  
  // Admin Configuration
  admin: {
    defaultEmail: process.env.ADMIN_EMAIL || 'admin@propify.com',
    defaultPassword: process.env.ADMIN_PASSWORD || 'Admin@123'
  },
  
  // Payment/Wallet Configuration (if needed)
  payment: {
    currency: 'USD',
    minTopUp: 10,
    maxTopUp: 10000
  },
  
  // Property Configuration
  property: {
    maxImages: 10,
    featuredLimit: 6
  },
  
  // Broker Verification
  broker: {
    autoVerify: process.env.AUTO_VERIFY_BROKERS === 'true' || false,
    requireDocuments: true
  }
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

if (config.env === 'production') {
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
}

module.exports = config;