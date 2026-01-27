const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// Public route - Submit contact form
router.post('/', contactController.submitContactForm);

// Admin routes - All require authentication and admin role
router.get('/', protect, isAdmin, contactController.getAllContacts);
router.get('/stats', protect, isAdmin, contactController.getContactStats);
router.get('/:id', protect, isAdmin, contactController.getContactById);
router.put('/:id/status', protect, isAdmin, contactController.updateContactStatus);
router.put('/bulk-update', protect, isAdmin, contactController.bulkUpdateContacts);
router.delete('/:id', protect, isAdmin, contactController.deleteContact);

module.exports = router;