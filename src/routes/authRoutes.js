const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle, handleMulterError } = require('../middleware/uploadMiddleware');

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Please provide a valid phone number'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['customer', 'broker', 'admin']).withMessage('Invalid role')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Protected routes
router.get('/verify', protect, authController.verifyToken);
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);

// Profile management routes (legacy endpoints for frontend compatibility)
router.put('/update-profile', protect, userController.updateProfile);
router.put('/update-address', protect, userController.updateAddress);
router.post('/update-balance', protect, userController.updateBalance);
router.post(
  '/upload-profile-picture',
  protect,
  uploadSingle('profilePicture'),
  handleMulterError,
  userController.uploadProfilePicture
);

module.exports = router;