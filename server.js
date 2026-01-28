// server.js
require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/database');
const config = require('./src/config/config');

const PORT = config.port;

// Connect to PostgreSQL Database
connectDB();

// Start the server
const server = app.listen(PORT, () => {
  console.log('===========================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${config.env}`);
  console.log(`📡 Backend URL: ${config.backendUrl}`);
  console.log(`🔗 Frontend URL: ${config.frontendUrl}`);
  console.log(`🗄️  Database: PostgreSQL (Render)`);
  console.log('===========================================');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  console.error(err.stack);
  
  // Close server & exit process
  server.close(() => {
    console.log('🛑 Server closed due to unhandled rejection');
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  
  // Exit process
  console.log('🛑 Server shutting down due to uncaught exception');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, closing server gracefully');
  server.close(() => {
    console.log('🛑 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, closing server gracefully');
  server.close(() => {
    console.log('🛑 Server closed');
    process.exit(0);
  });
});

module.exports = server;