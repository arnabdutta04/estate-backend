// brokerRoutes.js - CORRECTED VERSION
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const brokerController = require('../controllers/brokerController');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Get all verified brokers
router.get('/', brokerController.getAllBrokers);

// ============================================
// PROTECTED ROUTES (Broker only)
// ============================================
// ⚠️ IMPORTANT: These routes with specific paths MUST come BEFORE /:id route
// Otherwise Express will treat "me", "stats" etc. as ID parameters

// Get current broker's profile
router.get('/me', 
  protect, 
  authorize('broker'), 
  brokerController.getMyBrokerProfile
);

// Update/complete broker profile
router.put('/complete-profile', 
  protect, 
  authorize('broker'), 
  brokerController.completeBrokerProfile
);

// Get broker statistics
router.get('/stats', 
  protect, 
  authorize('broker'), 
  brokerController.getBrokerStats
);

// Get broker's properties
router.get('/my-properties', 
  protect, 
  authorize('broker'), 
  brokerController.getMyProperties
);

// Update broker profile image
router.put('/profile-image', 
  protect, 
  authorize('broker'), 
  brokerController.updateProfileImage
);

// ============================================
// PUBLIC ROUTES WITH PARAMETERS
// ============================================
// ⚠️ IMPORTANT: Routes with :id parameter MUST be LAST
// Otherwise they will catch all routes like /me, /stats etc.

// Get single broker by ID (public)
router.get('/:id', brokerController.getBrokerById);

module.exports = router;