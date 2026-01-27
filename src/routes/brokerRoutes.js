const express = require('express');
const router = express.Router();
const brokerController = require('../controllers/brokerController');
const { protect } = require('../middleware/authMiddleware');
const { isBroker, checkBrokerVerification } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', brokerController.getAllBrokers);
router.get('/:id', brokerController.getBrokerById);

// Protected broker routes (require authentication and broker role)
router.use(protect);
router.use(isBroker);

// Broker profile routes
router.get('/me', brokerController.getMyBrokerProfile);
router.put('/complete-profile', brokerController.completeBrokerProfile);
router.put('/profile-image', brokerController.updateProfileImage);

// Broker stats and properties (require verification)
router.get('/stats', checkBrokerVerification, brokerController.getBrokerStats);
router.get('/my-properties', checkBrokerVerification, brokerController.getMyProperties);

module.exports = router;