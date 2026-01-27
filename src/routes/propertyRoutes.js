const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { protect } = require('../middleware/authMiddleware');
const { checkBrokerVerification, isAdmin } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getPropertyById);

// Protected routes (require authentication)
router.use(protect);

// Property visit scheduling (any authenticated user)
router.post('/:id/schedule-visit', propertyController.scheduleVisit);

// Broker routes (require broker role and verification)
router.post('/', checkBrokerVerification, propertyController.createProperty);
router.put('/:id', checkBrokerVerification, propertyController.updateProperty);
router.delete('/:id', checkBrokerVerification, propertyController.deleteProperty);
router.get('/broker/my-properties', checkBrokerVerification, propertyController.getMyProperties);

// Admin routes
router.put('/:id/featured', isAdmin, propertyController.toggleFeatured);

module.exports = router;