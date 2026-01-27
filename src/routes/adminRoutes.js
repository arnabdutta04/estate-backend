const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// Admin stats
router.get('/stats', adminController.getAdminStats);

// Broker management
router.get('/brokers', adminController.getAllBrokersAdmin);
router.get('/brokers/:id', adminController.getBrokerDetailsAdmin);
router.put('/brokers/:id/verify', adminController.verifyBroker);
router.put('/brokers/:id/featured', adminController.toggleFeaturedBroker);
router.put('/brokers/:id/best-agent', adminController.toggleBestAgent);
router.delete('/brokers/:id', adminController.deleteBroker);

module.exports = router;