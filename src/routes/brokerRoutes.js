const express = require('express');
const router = express.Router();
const brokerController = require('../controllers/brokerController');
const { protect } = require('../middleware/authMiddleware');
const { isBroker, checkBrokerVerification } = require('../middleware/roleMiddleware');

// ============================================
// PUBLIC ROUTES - Must be defined FIRST
// ============================================
router.get('/', brokerController.getAllBrokers);

// ============================================
// PROTECTED BROKER ROUTES - Must be BEFORE /:id
// ============================================
// These routes require authentication and broker role
router.get('/me', protect, isBroker, brokerController.getMyBrokerProfile);
router.put('/complete-profile', protect, isBroker, brokerController.completeBrokerProfile);
router.put('/profile-image', protect, isBroker, brokerController.updateProfileImage);

// Broker stats and properties (require verification)
router.get('/stats', protect, isBroker, checkBrokerVerification, brokerController.getBrokerStats);
router.get('/my-properties', protect, isBroker, checkBrokerVerification, brokerController.getMyProperties);

// ============================================
// PUBLIC DYNAMIC ROUTE - Must be LAST
// ============================================
// This catches /brokers/:id where :id is any value
// If this was first, it would catch /brokers/me as "id=me"
router.get('/:id', brokerController.getBrokerById);

module.exports = router;