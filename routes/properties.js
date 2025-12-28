const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/featured', propertyController.getFeaturedProperties); // MUST be before /:id
router.get('/', propertyController.getProperties);
router.get('/:id', propertyController.getPropertyById);

// Protected routes
router.post('/', protect, propertyController.createProperty);
router.put('/:id', protect, propertyController.updateProperty);
router.delete('/:id', protect, propertyController.deleteProperty);

module.exports = router;
