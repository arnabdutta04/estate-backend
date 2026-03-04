const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const brokerRoutes = require('./brokerRoutes');
const adminRoutes = require('./adminRoutes');
const uploadRoutes = require('./uploadRoutes');
const propertyRoutes = require('./propertyRoutes');
const userRoutes = require('./userRoutes');
const contactRoutes = require('./contactRoutes');
const messageRoutes = require('./messageRoutes');     // ✅ FIX: was missing
const scheduleRoutes = require('./scheduleRoutes');   // ✅ FIX: was missing

// Mount routes
router.use('/auth', authRoutes);
router.use('/brokers', brokerRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/properties', propertyRoutes);
router.use('/users', userRoutes);
router.use('/contact', contactRoutes);
router.use('/messages', messageRoutes);    // ✅ FIX: messages now reachable
router.use('/schedules', scheduleRoutes);  // ✅ FIX: schedules now reachable

// Health check for API
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;