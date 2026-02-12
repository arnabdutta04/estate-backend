const { User, Broker } = require('../models');
const bcrypt = require('bcryptjs');
const { uploadImage } = require('../utils/supabaseStorage'); // UPDATED

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Broker,
        as: 'brokerProfile',
        attributes: { exclude: ['documentUrl', 'createdAt', 'updatedAt'] }
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
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, dateOfBirth } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Check if phone is being changed and if it's already taken
    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ where: { phone } });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already exists'
        });
      }
    }

    // Update user
    await user.update({
      name: name || user.name,
      email: email || user.email,
      phone: phone || user.phone,
      dateOfBirth: dateOfBirth || user.dateOfBirth
    });

    // Fetch updated user with broker profile
    const updatedUser = await User.findByPk(user.id, {
      include: [{
        model: Broker,
        as: 'brokerProfile',
        attributes: { exclude: ['documentUrl', 'createdAt', 'updatedAt'] }
      }],
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile'
    });
  }
};

// @desc    Update user address
// @route   PUT /api/users/update-address
// @access  Private
exports.updateAddress = async (req, res) => {
  try {
    const { country, city, postalCode } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({
      country: country || user.country,
      city: city || user.city,
      postalCode: postalCode || user.postalCode
    });

    // Fetch updated user
    const updatedUser = await User.findByPk(user.id, {
      include: [{
        model: Broker,
        as: 'brokerProfile',
        attributes: { exclude: ['documentUrl', 'createdAt', 'updatedAt'] }
      }],
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating address'
    });
  }
};

// @desc    Update user balance
// @route   POST /api/users/update-balance
// @access  Private
exports.updateBalance = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount'
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add amount to current balance
    const newBalance = parseFloat(user.balance) + parseFloat(amount);
    await user.update({ balance: newBalance });

    // Fetch updated user
    const updatedUser = await User.findByPk(user.id, {
      include: [{
        model: Broker,
        as: 'brokerProfile',
        attributes: { exclude: ['documentUrl', 'createdAt', 'updatedAt'] }
      }],
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      message: `Successfully added $${parseFloat(amount).toFixed(2)} to your balance`,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating balance'
    });
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/upload-profile-picture
// @access  Private
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // UPDATED: Upload to Supabase Storage instead of Cloudinary
    const uploadResult = await uploadImage(
      req.file.buffer,
      req.file.originalname,
      'profiles' // folder name in Supabase Storage
    );

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Error uploading profile picture'
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({ profilePicture: uploadResult.url });

    // Fetch updated user
    const updatedUser = await User.findByPk(user.id, {
      include: [{
        model: Broker,
        as: 'brokerProfile',
        attributes: { exclude: ['documentUrl', 'createdAt', 'updatedAt'] }
      }],
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture'
    });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password (will be hashed by beforeUpdate hook)
    await user.update({ password: newPassword });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Merge new preferences with existing ones
    const updatedPreferences = {
      ...user.preferences,
      ...preferences
    };

    await user.update({ preferences: updatedPreferences });

    // Fetch updated user
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating preferences'
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your password to confirm deletion'
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Delete user (will cascade delete broker profile and properties)
    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account'
    });
  }
};