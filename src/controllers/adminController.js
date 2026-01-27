const { User, Broker } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all brokers with filter (Admin only)
// @route   GET /api/admin/brokers
// @access  Private (Admin)
exports.getAllBrokersAdmin = async (req, res) => {
  try {
    const { status = 'all' } = req.query;

    // Build where conditions
    let whereConditions = {};
    
    if (status !== 'all') {
      whereConditions.verificationStatus = status;
    }

    // Fetch brokers
    const brokers = await Broker.findAll({
      where: whereConditions,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone']
      }],
      order: [
        ['verificationStatus', 'ASC'], // pending first
        ['createdAt', 'DESC']
      ]
    });

    // Transform response to match frontend expectations
    const transformedBrokers = brokers.map(broker => ({
      _id: broker.id,
      userId: {
        name: broker.user.name,
        email: broker.user.email,
        phone: broker.user.phone
      },
      company: broker.companyName,
      licenseNumber: broker.licenseNumber,
      yearsOfExperience: broker.yearsOfExperience,
      specialization: broker.specialization,
      servingCities: broker.city,
      propertyTypes: broker.propertyTypes,
      listingType: broker.listingTypes,
      photo: broker.profileImage,
      licenseDocument: broker.licenseDocument,
      idProof: broker.idProof,
      verificationStatus: broker.verificationStatus,
      rejectionReason: broker.rejectionReason,
      verifiedAt: broker.verifiedAt,
      createdAt: broker.createdAt
    }));

    res.status(200).json({
      success: true,
      count: transformedBrokers.length,
      data: transformedBrokers
    });

  } catch (error) {
    console.error('Error fetching brokers for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching brokers'
    });
  }
};

// @desc    Get single broker details (Admin only)
// @route   GET /api/admin/brokers/:id
// @access  Private (Admin)
exports.getBrokerDetailsAdmin = async (req, res) => {
  try {
    const broker = await Broker.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone', 'createdAt']
      }]
    });

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker not found'
      });
    }

    // Transform response
    const transformedBroker = {
      _id: broker.id,
      userId: broker.user,
      company: broker.companyName,
      licenseNumber: broker.licenseNumber,
      yearsOfExperience: broker.yearsOfExperience,
      specialization: broker.specialization,
      servingCities: broker.city,
      propertyTypes: broker.propertyTypes,
      listingType: broker.listingTypes,
      about: broker.about,
      address: broker.address,
      city: broker.city,
      state: broker.state,
      pincode: broker.pincode,
      photo: broker.profileImage,
      licenseDocument: broker.licenseDocument,
      idProof: broker.idProof,
      verificationStatus: broker.verificationStatus,
      rejectionReason: broker.rejectionReason,
      verifiedAt: broker.verifiedAt,
      verifiedBy: broker.verifiedBy,
      createdAt: broker.createdAt,
      updatedAt: broker.updatedAt
    };

    res.status(200).json({
      success: true,
      data: transformedBroker
    });

  } catch (error) {
    console.error('Error fetching broker details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching broker details'
    });
  }
};

// @desc    Verify or reject broker
// @route   PUT /api/admin/brokers/:id/verify
// @access  Private (Admin)
exports.verifyBroker = async (req, res) => {
  try {
    const { verificationStatus, rejectionReason } = req.body;
    const brokerId = req.params.id;

    // Validate status
    if (!['verified', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status. Must be "verified" or "rejected"'
      });
    }

    // If rejecting, require rejection reason
    if (verificationStatus === 'rejected' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting a broker'
      });
    }

    // Find broker
    const broker = await Broker.findByPk(brokerId);

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker not found'
      });
    }

    // Update verification status
    const updateData = {
      verificationStatus,
      verifiedBy: req.user.id,
      verifiedAt: new Date()
    };

    if (verificationStatus === 'rejected') {
      updateData.rejectionReason = rejectionReason;
    } else {
      updateData.rejectionReason = null; // Clear rejection reason if verifying
    }

    await broker.update(updateData);

    // Fetch updated broker with user details
    const updatedBroker = await Broker.findByPk(brokerId, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone']
      }]
    });

    res.status(200).json({
      success: true,
      message: `Broker ${verificationStatus} successfully`,
      data: updatedBroker
    });

  } catch (error) {
    console.error('Error verifying broker:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating broker verification status'
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res) => {
  try {
    // Count brokers by status
    const totalBrokers = await Broker.count();
    const pendingBrokers = await Broker.count({
      where: { verificationStatus: 'pending' }
    });
    const verifiedBrokers = await Broker.count({
      where: { verificationStatus: 'verified' }
    });
    const rejectedBrokers = await Broker.count({
      where: { verificationStatus: 'rejected' }
    });

    // Count users by role
    const totalUsers = await User.count();
    const customers = await User.count({
      where: { role: 'customer' }
    });
    const brokers = await User.count({
      where: { role: 'broker' }
    });

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentBrokerRegistrations = await Broker.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    const stats = {
      brokers: {
        total: totalBrokers,
        pending: pendingBrokers,
        verified: verifiedBrokers,
        rejected: rejectedBrokers,
        recentRegistrations: recentBrokerRegistrations
      },
      users: {
        total: totalUsers,
        customers,
        brokers,
        admins: totalUsers - customers - brokers
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin statistics'
    });
  }
};

// @desc    Set broker as featured
// @route   PUT /api/admin/brokers/:id/featured
// @access  Private (Admin)
exports.toggleFeaturedBroker = async (req, res) => {
  try {
    const { isFeatured } = req.body;
    const broker = await Broker.findByPk(req.params.id);

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker not found'
      });
    }

    await broker.update({ isFeatured });

    res.status(200).json({
      success: true,
      message: `Broker ${isFeatured ? 'set as' : 'removed from'} featured`,
      data: broker
    });

  } catch (error) {
    console.error('Error toggling featured broker:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating featured status'
    });
  }
};

// @desc    Set broker as best agent
// @route   PUT /api/admin/brokers/:id/best-agent
// @access  Private (Admin)
exports.toggleBestAgent = async (req, res) => {
  try {
    const { isBestAgent } = req.body;

    // If setting as best agent, remove previous best agent
    if (isBestAgent) {
      await Broker.update(
        { isBestAgent: false },
        { where: { isBestAgent: true } }
      );
    }

    const broker = await Broker.findByPk(req.params.id);

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker not found'
      });
    }

    await broker.update({ isBestAgent });

    res.status(200).json({
      success: true,
      message: `Broker ${isBestAgent ? 'set as' : 'removed from'} best agent`,
      data: broker
    });

  } catch (error) {
    console.error('Error toggling best agent:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating best agent status'
    });
  }
};

// @desc    Delete broker (Admin only)
// @route   DELETE /api/admin/brokers/:id
// @access  Private (Admin)
exports.deleteBroker = async (req, res) => {
  try {
    const broker = await Broker.findByPk(req.params.id);

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker not found'
      });
    }

    // Delete broker (this will also delete associated user due to CASCADE)
    await broker.destroy();

    res.status(200).json({
      success: true,
      message: 'Broker deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting broker:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting broker'
    });
  }
};