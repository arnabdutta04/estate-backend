const { Sequelize } = require('sequelize');
require('dotenv').config();

// Validate DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.error('❌ FATAL ERROR: DATABASE_URL is not defined in environment variables');
  console.error('💡 Add DATABASE_URL to your environment variables');
  process.exit(1);
}

// PRODUCTION CONFIGURATION FOR SUPABASE POSTGRESQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  
  // SSL Configuration - REQUIRED for Supabase PostgreSQL
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Required for Supabase
    }
  },
  
  // Logging Configuration
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  // Connection Pool Configuration - Optimized for Supabase
  pool: {
    max: 5,              // Maximum number of connections (Supabase free tier limit)
    min: 0,              // Minimum connections (0 to save resources)
    acquire: 60000,      // Maximum time (ms) to get connection before error
    idle: 10000,         // Maximum time (ms) connection can be idle before release
    evict: 10000         // Time interval (ms) to check for idle connections
  },
  
  // Query Configuration
  define: {
    timestamps: true,    // Add createdAt and updatedAt
    underscored: false,  // Use camelCase instead of snake_case
    freezeTableName: true // Prevent Sequelize from pluralizing table names
  },
  
  // Retry Configuration for network issues
  retry: {
    max: 3,              // Maximum retry attempts
    timeout: 3000        // Timeout between retries
  }
});

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection successful
 */
const testConnection = async () => {
  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    
    await sequelize.authenticate();
    
    console.log('✅ Database connection established successfully');
    console.log('📊 Database:', sequelize.config.database);
    console.log('🌐 Host:', sequelize.config.host);
    console.log('🔐 SSL:', sequelize.config.dialectOptions.ssl ? 'Enabled' : 'Disabled');
    console.log('☁️  Platform: Supabase');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', error.message);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');
    console.error('💡 Troubleshooting Steps:');
    console.error('1. Verify DATABASE_URL in environment variables');
    console.error('2. Check Supabase PostgreSQL database is active');
    console.error('3. Ensure connection string includes: ?sslmode=require');
    console.error('4. Verify network connectivity to Supabase');
    console.error('5. Check Supabase project status at https://supabase.com');
    console.error('');
    
    if (error.message.includes('password authentication failed')) {
      console.error('🔑 Password authentication failed - check your credentials');
    }
    
    if (error.message.includes('timeout')) {
      console.error('⏱️ Connection timeout - check your network or Supabase status');
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('🌐 Cannot reach database host - check connection string');
    }
    
    return false;
  }
};

/**
 * Sync database models with schema
 * @param {Object} options - Sequelize sync options
 * @returns {Promise<void>}
 */
const syncDatabase = async (options = {}) => {
  try {
    console.log('🔄 Syncing database models...');
    
    const syncOptions = {
      alter: false,    // Don't alter existing tables (safer for production)
      force: false,    // Don't drop tables (NEVER use true in production)
      ...options
    };
    
    // Sync all models
    await sequelize.sync(syncOptions);
    
    console.log('✅ Database models synced successfully');
    
    // Log synced models
    const models = Object.keys(sequelize.models);
    if (models.length > 0) {
      console.log('📋 Synced models:', models.join(', '));
    } else {
      console.log('⚠️ No models found to sync');
    }
    
  } catch (error) {
    console.error('❌ Database sync failed!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
};

/**
 * Close database connection gracefully
 * @returns {Promise<void>}
 */
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed gracefully');
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
    throw error;
  }
};

/**
 * Get connection pool status
 * @returns {Object} Pool statistics
 */
const getPoolStatus = () => {
  const pool = sequelize.connectionManager.pool;
  return {
    size: pool.size,
    available: pool.available,
    using: pool.using,
    waiting: pool.waiting
  };
};

/**
 * Execute raw SQL query safely
 * @param {string} query - SQL query
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Query results
 */
const executeQuery = async (query, options = {}) => {
  try {
    const [results] = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
      ...options
    });
    return results;
  } catch (error) {
    console.error('❌ Query execution failed:', error.message);
    throw error;
  }
};

// Export Sequelize instance and utilities
module.exports = {
  sequelize,           // Main Sequelize instance
  Sequelize,           // Sequelize constructor (for data types)
  testConnection,      // Test database connection
  syncDatabase,        // Sync models with database
  closeConnection,     // Close connection gracefully
  getPoolStatus,       // Get connection pool statistics
  executeQuery         // Execute raw SQL queries
};