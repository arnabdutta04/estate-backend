const { Sequelize } = require('sequelize');
require('dotenv').config();

// Validate DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.error('❌ FATAL ERROR: DATABASE_URL is not defined in environment variables');
  console.error('💡 Add DATABASE_URL to your Koyeb environment variables');
  process.exit(1);
}

console.log('🗄️  Database Platform: Supabase PostgreSQL');
console.log('☁️  Hosting Platform: Koyeb');

// PRODUCTION CONFIGURATION FOR SUPABASE POSTGRESQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  
  // SSL Configuration - REQUIRED for Supabase
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Required for Supabase
    },
    // Increase connection timeout for Supabase pooler
    connectTimeout: 60000, // 60 seconds
    connectionTimeoutMillis: 60000,
    statement_timeout: 30000,
    query_timeout: 30000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000
  },
  
  // Logging Configuration
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  // Connection Pool Configuration - Optimized for Supabase
  pool: {
    max: 10,             // Maximum number of connections
    min: 2,              // Minimum connections
    acquire: 60000,      // 60 seconds - Maximum time to get connection
    idle: 10000,         // Maximum time connection can be idle
    evict: 10000,        // Time interval to check for idle connections
    maxUses: 7500,       // Maximum uses per connection before refresh
  },
  
  // Query Configuration
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  },
  
  // Retry Configuration for network issues
  retry: {
    max: 5,              // Increase retry attempts
    timeout: 5000        // Timeout between retries
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
    
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      console.error('⏱️ Connection timeout - Supabase may be paused or unreachable');
      console.error('💡 Try using Session Pooler connection string');
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
      alter: false,
      force: false,
      ...options
    };
    
    await sequelize.sync(syncOptions);
    
    console.log('✅ Database models synced successfully');
    
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

module.exports = {
  sequelize,
  Sequelize,
  testConnection,
  syncDatabase,
  closeConnection,
  getPoolStatus,
  executeQuery
};