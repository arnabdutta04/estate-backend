const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { protect } = require('../middleware/authMiddleware');
const { checkBrokerVerification, isAdmin } = require('../middleware/roleMiddleware');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
// Get all properties (with filters)
router.get('/', propertyController.getAllProperties);

// ============================================
// PROTECTED BROKER ROUTES - SPECIFIC PATHS FIRST
// ============================================
// ⚠️ CRITICAL: /broker/my-properties MUST come BEFORE /:id route
// Otherwise Express will treat "broker" as an ID parameter and fail

// Get current broker's properties (for dashboard)
router.get('/broker/my-properties', 
  protect, 
  checkBrokerVerification, 
  propertyController.getMyProperties
);

// ============================================
// BROKER CRUD ROUTES (Protected)
// ============================================
// Create new property (broker only)
router.post('/', 
  protect, 
  checkBrokerVerification, 
  propertyController.createProperty
);

// Update property (broker only)
router.put('/:id', 
  protect, 
  checkBrokerVerification, 
  propertyController.updateProperty
);

// Delete property (broker only)
router.delete('/:id', 
  protect, 
  checkBrokerVerification, 
  propertyController.deleteProperty
);

// ============================================
// AUTHENTICATED USER ROUTES
// ============================================
// Schedule property visit (any authenticated user)
router.post('/:id/schedule-visit', 
  protect, 
  propertyController.scheduleVisit
);

// ============================================
// ADMIN ROUTES
// ============================================
// Toggle featured status (admin only)
router.put('/:id/featured', 
  protect, 
  isAdmin, 
  propertyController.toggleFeatured
);

// ============================================
// PUBLIC ROUTE WITH PARAMETER - MUST BE LAST
// ============================================
// ⚠️ CRITICAL: This MUST be at the very end
// If this comes before /broker/my-properties, it will catch that route
// Get single property by ID (public - no auth required)
router.get('/:id', propertyController.getPropertyById);

module.exports = router;