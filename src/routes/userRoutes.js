const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle, handleMulterError } = require('../middleware/uploadMiddleware');

// All routes require authentication
router.use(protect);

// Profile routes
router.get('/profile', userController.getUserProfile);
router.put('/update-profile', userController.updateProfile);
router.put('/update-address', userController.updateAddress);

// Balance
router.post('/update-balance', userController.updateBalance);

// Profile picture
router.post(
  '/upload-profile-picture',
  uploadSingle('profilePicture'),
  handleMulterError,
  userController.uploadProfilePicture
);

// Password
router.put('/change-password', userController.changePassword);

// Preferences
router.put('/preferences', userController.updatePreferences);

// Account deletion
router.delete('/account', userController.deleteAccount);

module.exports = router;