const { Property, Broker, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all properties with filters
// @route   GET /api/properties
// @access  Public
exports.getAllProperties = async (req, res) => {
  try {
    const {
      propertyType,
      listingType,
      city,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      keyword,
      facilities,
      status = 'active',
      page = 1,
      limit = 12
    } = req.query;

    // Build where conditions
    const whereConditions = {
      status: status
    };

    if (propertyType) {
      whereConditions.propertyType = propertyType;
    }

    if (listingType) {
      whereConditions.listingType = listingType;
    }

    if (minPrice || maxPrice) {
      whereConditions.price = {};
      if (minPrice) whereConditions.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereConditions.price[Op.lte] = parseFloat(maxPrice);
    }

    if (keyword) {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${keyword}%` } },
        { description: { [Op.iLike]: `%${keyword}%` } }
      ];
    }

    if (city) {
      whereConditions.location = {
        city: { [Op.iLike]: `%${city}%` }
      };
    }

    if (bedrooms) {
      whereConditions['specifications.bedrooms'] = parseInt(bedrooms);
    }

    if (bathrooms) {
      whereConditions['specifications.bathrooms'] = parseInt(bathrooms);
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Fetch properties
    const { count, rows: properties } = await Property.findAndCountAll({
      where: whereConditions,
      include: [{
        model: Broker,
        as: 'broker',
        attributes: ['id', 'companyName', 'licenseNumber', 'yearsOfExperience'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }]
      }],
      limit: parseInt(limit),
      offset: offset,
      order: [
        ['isFeatured', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    // Transform response
    const transformedProperties = properties.map(property => ({
      _id: property.id,
      title: property.title,
      description: property.description,
      propertyType: property.propertyType,
      listingType: property.listingType,
      price: property.price,
      location: property.location,
      specifications: property.specifications,
      facilities: property.facilities,
      images: property.images,
      yearBuilt: property.yearBuilt,
      age: property.age,
      condition: property.condition,
      style: property.style,
      status: property.status,
      views: property.views,
      inquiries: property.inquiries,
      isFeatured: property.isFeatured,
      broker: property.broker ? {
        userId: property.broker.user,
        company: property.broker.companyName,
        licenseNumber: property.broker.licenseNumber,
        experience: property.broker.yearsOfExperience
      } : null,
      createdAt: property.createdAt
    }));

    res.status(200).json({
      success: true,
      count: transformedProperties.length,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      properties: transformedProperties
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching properties'
    });
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id, {
      include: [{
        model: Broker,
        as: 'broker',
        attributes: ['id', 'companyName', 'licenseNumber', 'yearsOfExperience', 'profileImage'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }]
      }]
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Increment view count
    await property.increment('views');

    // Transform response
    const transformedProperty = {
      _id: property.id,
      title: property.title,
      description: property.description,
      propertyType: property.propertyType,
      listingType: property.listingType,
      price: property.price,
      location: property.location,
      specifications: property.specifications,
      facilities: property.facilities,
      images: property.images,
      yearBuilt: property.yearBuilt,
      age: property.age,
      condition: property.condition,
      style: property.style,
      status: property.status,
      views: property.views + 1,
      inquiries: property.inquiries,
      ownerType: property.ownerType,
      broker: property.broker ? {
        userId: property.broker.user,
        company: property.broker.companyName,
        licenseNumber: property.broker.licenseNumber,
        experience: property.broker.yearsOfExperience,
        photo: property.broker.profileImage,
        rating: property.broker.rating || 0,
        totalReviews: property.broker.totalReviews || 0
      } : null,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt
    };

    res.status(200).json({
      success: true,
      property: transformedProperty
    });

  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching property details'
    });
  }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Broker only)
exports.createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      propertyType,
      listingType,
      price,
      location,
      specifications,
      facilities,
      images,
      yearBuilt,
      age,
      condition,
      style,
      metaTitle,
      metaDescription
    } = req.body;

    // Get broker profile
    const broker = await Broker.findOne({
      where: { userId: req.user.id }
    });

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker profile not found'
      });
    }

    // Check broker verification
    if (broker.verificationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Your broker account must be verified to list properties'
      });
    }

    // Create property
    const property = await Property.create({
      brokerId: broker.id,
      title,
      description,
      propertyType,
      listingType,
      price,
      location,
      specifications,
      facilities,
      images: images || [],
      yearBuilt,
      age,
      condition,
      style,
      metaTitle,
      metaDescription,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property
    });

  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating property'
    });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Broker - own properties only)
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id, {
      include: [{
        model: Broker,
        as: 'broker'
      }]
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership
    if (property.broker.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }

    // Update property
    await property.update(req.body);

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      property
    });

  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating property'
    });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Broker - own properties only)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id, {
      include: [{
        model: Broker,
        as: 'broker'
      }]
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership
    if (property.broker.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property'
      });
    }

    await property.destroy();

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting property'
    });
  }
};

// @desc    Get broker's properties
// @route   GET /api/properties/broker/my-properties
// @access  Private (Broker)
exports.getMyProperties = async (req, res) => {
  try {
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

    // Transform response
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
    console.error('Error fetching broker properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching properties'
    });
  }
};

// @desc    Schedule property visit
// @route   POST /api/properties/:id/schedule-visit
// @access  Private
exports.scheduleVisit = async (req, res) => {
  try {
    const { date, time, message } = req.body;
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Increment inquiries count
    await property.increment('inquiries');

    // TODO: Send email notification to broker
    // TODO: Create visit record in database

    res.status(200).json({
      success: true,
      message: 'Visit scheduled successfully'
    });

  } catch (error) {
    console.error('Error scheduling visit:', error);
    res.status(500).json({
      success: false,
      message: 'Error scheduling visit'
    });
  }
};

// @desc    Toggle featured status (Admin only)
// @route   PUT /api/properties/:id/featured
// @access  Private (Admin)
exports.toggleFeatured = async (req, res) => {
  try {
    const { isFeatured } = req.body;
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    await property.update({ isFeatured });

    res.status(200).json({
      success: true,
      message: `Property ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
      property
    });

  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating featured status'
    });
  }
};