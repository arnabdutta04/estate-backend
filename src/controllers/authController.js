// ============================================================
// FIXED: authController.js — login function
// The full file is provided. Replace your existing authController.js.
// ============================================================

const { User, Broker } = require('../models');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone, password, role } = req.body;

    console.log('📝 Registration attempt:', { email, phone, role });

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already exists'
      });
    }

    // Create user (password hashed by beforeCreate hook in User model)
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'customer',
      balance: 0.00
    });

    // If role is broker, create broker profile with pending status
    if (role === 'broker') {
      await Broker.create({
        userId: user.id,
        verificationStatus: 'pending'
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const token = generateToken(user.id);

    // Get user with broker profile if exists
    const userWithProfile = await User.findByPk(user.id, {
      include: [{
        model: Broker,
        as: 'brokerProfile',
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }],
      attributes: { exclude: ['password'] }
    });

    console.log('✅ Registration successful for:', email);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userWithProfile
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', { email });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email, include broker profile
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Broker,
        as: 'brokerProfile',
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const token = generateToken(user.id);

    // toJSON() removes password (defined in User model)
    const userData = user.toJSON();

    console.log('✅ Login successful for:', email, '| role:', user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Verify token and get current user
// @route   GET /api/auth/verify
// @access  Private
exports.verifyToken = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Broker,
        as: 'brokerProfile',
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('❌ Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Broker,
        as: 'brokerProfile',
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // JWT is stateless — actual logout happens client-side by deleting the token
    // This endpoint exists for logging purposes and frontend consistency
    console.log('👋 User logging out:', req.user?.id);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};