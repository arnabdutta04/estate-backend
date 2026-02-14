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
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone, password, role } = req.body;

    console.log('📝 Registration attempt:', { email, phone, role }); // Debug log

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      console.log('❌ Phone already exists:', phone);
      return res.status(400).json({
        success: false,
        message: 'Phone number already exists'
      });
    }

    console.log('✅ Creating user...'); // Debug log

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'customer',
      balance: 0.00
    });

    console.log('✅ User created:', user.id); // Debug log

    // If role is broker, create broker profile with pending status
    if (role === 'broker') {
      console.log('✅ Creating broker profile...'); // Debug log
      await Broker.create({
        userId: user.id,
        verificationStatus: 'pending'
      });
    }

    console.log('✅ Generating token...'); // Debug log

    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not set!');
      throw new Error('JWT_SECRET environment variable is not set');
    }

    // Generate token
    const token = generateToken(user.id);

    console.log('✅ Fetching user with profile...'); // Debug log

    // Get user with broker profile if exists
    const userWithProfile = await User.findByPk(user.id, {
      include: [{
        model: Broker,
        as: 'brokerProfile',
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }],
      attributes: { exclude: ['password'] }
    });

    console.log('✅ Registration successful!'); // Debug log

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userWithProfile
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('Error stack:', error.stack); // More detailed error
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

    console.log('🔐 Login attempt:', { email }); // Debug log

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({ 
      where: { email },
      include: [{
        model: Broker,
        as: 'brokerProfile',
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }]
    });

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ Account deactivated:', email);
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✅ Password verified, updating last login...'); // Debug log

    // Update last login
    await user.update({ lastLogin: new Date() });

    console.log('✅ Generating token...'); // Debug log

    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not set!');
      throw new Error('JWT_SECRET environment variable is not set');
    }

    // Generate token
    const token = generateToken(user.id);

    // Prepare user data (exclude password)
    const userData = user.toJSON();

    console.log('✅ Login successful!'); // Debug log

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error stack:', error.stack); // More detailed error
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
    console.log('🔍 Verifying token for user:', req.user.id); // Debug log

    // User is already attached to req by authMiddleware
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Broker,
        as: 'brokerProfile',
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      console.log('❌ User not found:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ Token verified successfully'); // Debug log

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('❌ Token verification error:', error);
    console.error('Error stack:', error.stack); // More detailed error
    res.status(500).json({
      success: false,
      message: 'Server error during verification',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    console.log('👤 Getting profile for user:', req.user.id); // Debug log

    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Broker,
        as: 'brokerProfile',
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      console.log('❌ User not found:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ Profile retrieved successfully'); // Debug log

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    console.error('Error stack:', error.stack); // More detailed error
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Logout user (client-side operation mainly)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    console.log('👋 User logging out:', req.user?.id); // Debug log

    // In a stateless JWT system, logout is mainly client-side
    // But we can log it or implement token blacklisting if needed
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    console.error('Error stack:', error.stack); // More detailed error
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};