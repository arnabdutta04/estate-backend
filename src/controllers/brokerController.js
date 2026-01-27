const { User, Broker } = require('../models');
const { validationResult } = require('express-validator');

// @desc    Get all verified brokers (public)
// @route   GET /api/brokers
// @access  Public
exports.getAllBrokers = async (req, res) => {
  try {
    const { city, specialization, language, search } = req.query;

    // Build filter conditions
    let whereConditions = {
      verificationStatus: 'verified'
    };

    if (city) {
      whereConditions.servingCities = city;
    }

    if (specialization) {
      whereConditions.specialization = {
        [require('sequelize').Op.contains]: [specialization]
      };
    }

    if (language) {
      whereConditions.languages = {
        [require('sequelize').Op.contains]: [language]
      };
    }

    // Fetch brokers
    const brokers = await Broker.findAll({
      where: whereConditions,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone'],
        where: search ? {
          name: {
            [require('sequelize').Op.iLike]: `%${search}%`
          }
        } : undefined
      }],
      attributes: { exclude: ['documentUrl'] },
      order: [
        ['isFeatured', 'DESC'],
        ['isBestAgent', 'DESC'],
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
      servingCities: broker.city || broker.servingCities,
      propertyTypes: broker.propertyTypes,
      listingType: broker.listingTypes,
      languages: broker.languages,
      photo: broker.profileImage,
      verificationStatus: broker.verificationStatus,
      isFeatured: broker.isFeatured || false,
      isBestAgent: broker.isBestAgent || false,
      createdAt: broker.createdAt
    }));

    res.status(200).json({
      success: true,
      count: transformedBrokers.length,
      data: transformedBrokers
    });

  } catch (error) {
    console.error('Error fetching brokers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching brokers'
    });
  }
};

// @desc    Get single broker by ID
// @route   GET /api/brokers/:id
// @access  Public
exports.getBrokerById = async (req, res) => {
  try {
    const broker = await Broker.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone']
      }],
      attributes: { exclude: ['documentUrl'] }
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
      about: broker.about,
      photo: broker.profileImage,
      verificationStatus: broker.verificationStatus,
      createdAt: broker.createdAt
    };

    res.status(200).json({
      success: true,
      data: transformedBroker
    });

  } catch (error) {
    console.error('Error fetching broker:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching broker details'
    });
  }
};

// @desc    Get current broker's profile
// @route   GET /api/brokers/me
// @access  Private (Broker)
exports.getMyBrokerProfile = async (req, res) => {
  try {
    const broker = await Broker.findOne({
      where: { userId: req.user.id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone']
      }]
    });

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker profile not found'
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
      photo: broker.profileImage,
      licenseDocument: broker.licenseDocument,
      idProof: broker.idProof,
      verificationStatus: broker.verificationStatus,
      rejectionReason: broker.rejectionReason,
      createdAt: broker.createdAt
    };

    res.status(200).json({
      success: true,
      data: transformedBroker
    });

  } catch (error) {
    console.error('Error fetching broker profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching broker profile'
    });
  }
};

// @desc    Complete/Update broker profile
// @route   PUT /api/brokers/complete-profile
// @access  Private (Broker)
exports.completeBrokerProfile = async (req, res) => {
  try {
    const {
      companyName,
      licenseNumber,
      yearsOfExperience,
      specialization,
      city,
      state,
      pincode,
      address,
      about,
      servingCities,
      propertyTypes,
      listingTypes,
      languages,
      profileImage,
      licenseDocument,
      idProof
    } = req.body;

    // Find broker profile
    let broker = await Broker.findOne({
      where: { userId: req.user.id }
    });

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker profile not found'
      });
    }

    // Update broker profile
    await broker.update({
      companyName,
      licenseNumber,
      yearsOfExperience,
      specialization,
      city,
      state,
      pincode,
      address,
      about,
      servingCities,
      propertyTypes,
      listingTypes,
      languages,
      profileImage,
      licenseDocument,
      idProof,
      verificationStatus: 'pending' // Reset to pending when profile is updated
    });

    // Fetch updated broker with user details
    broker = await Broker.findByPk(broker.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone']
      }]
    });

    res.status(200).json({
      success: true,
      message: 'Broker profile updated successfully',
      data: broker
    });

  } catch (error) {
    console.error('Error updating broker profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating broker profile'
    });
  }
};

// @desc    Get broker's properties
// @route   GET /api/brokers/my-properties
// @access  Private (Broker)
exports.getMyProperties = async (req, res) => {
  try {
    const { Property } = require('../models');
    
    const broker = await Broker.findOne({
      where: { userId: req.user.id }
    });

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker profile not found'
      });
    }

    const properties = await Property.findAll({
      where: { brokerId: broker.id },
      order: [['createdAt', 'DESC']]
    });

    // Transform response to match frontend expectations
    const transformedProperties = properties.map(property => ({
      _id: property.id,
      title: property.title,
      propertyType: property.propertyType,
      listingType: property.listingType,
      price: property.price,
      location: property.location,
      images: property.images,
      status: property.status,
      views: property.views,
      inquiries: property.inquiries,
      createdAt: property.createdAt
    }));

    res.status(200).json({
      success: true,
      count: transformedProperties.length,
      data: transformedProperties
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching properties'
    });
  }
};

// @desc    Get broker dashboard stats
// @route   GET /api/brokers/stats
// @access  Private (Broker)
exports.getBrokerStats = async (req, res) => {
  try {
    const { Property } = require('../models');
    
    const broker = await Broker.findOne({
      where: { userId: req.user.id }
    });

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker profile not found'
      });
    }

    // Get property statistics
    const properties = await Property.findAll({
      where: { brokerId: broker.id }
    });

    const stats = {
      totalProperties: properties.length,
      activeListings: properties.filter(p => p.status === 'active').length,
      totalViews: properties.reduce((sum, p) => sum + (p.views || 0), 0),
      inquiries: properties.reduce((sum, p) => sum + (p.inquiries || 0), 0)
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching broker stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching broker statistics'
    });
  }
};

// @desc    Update broker profile image
// @route   PUT /api/brokers/profile-image
// @access  Private (Broker)
exports.updateProfileImage = async (req, res) => {
  try {
    const { profileImage } = req.body;

    const broker = await Broker.findOne({
      where: { userId: req.user.id }
    });

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker profile not found'
      });
    }

    await broker.update({ profileImage });

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      data: { profileImage }
    });

  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile image'
    });
  }
};