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
      propertyFor, // ADDED: Frontend compatibility
      city,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      keyword,
      facilities, // ADDED: Handle facilities filtering
      style, // ADDED: Handle style filtering
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

    // FIXED: Support both listingType and propertyFor
    if (listingType || propertyFor) {
      whereConditions.listingType = listingType || propertyFor;
    }

    // FIXED: Handle style filtering
    if (style) {
      whereConditions.style = style;
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

    // FIXED: Correct JSONB city filtering
    if (city) {
      whereConditions['location.city'] = {
        [Op.iLike]: `%${city}%`
      };
    }

    // FIXED: Correct JSONB bedrooms filtering
    if (bedrooms) {
      whereConditions['specifications.bedrooms'] = {
        [Op.gte]: parseInt(bedrooms)
      };
    }

    // FIXED: Correct JSONB bathrooms filtering
    if (bathrooms) {
      whereConditions['specifications.bathrooms'] = {
        [Op.gte]: parseInt(bathrooms)
      };
    }

    // ADDED: Facilities filtering
    if (facilities) {
      const facilityArray = Array.isArray(facilities) ? facilities : [facilities];
      facilityArray.forEach(facility => {
        whereConditions[`facilities.${facility}`] = true;
      });
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

    // FIXED: Transform response to match frontend expectations
    const transformedProperties = properties.map(property => ({
      _id: property.id,
      title: property.title,
      description: property.description,
      propertyType: property.propertyType,
      type: property.propertyType, // ADDED: Frontend compatibility
      listingType: property.listingType,
      propertyFor: property.listingType, // ADDED: Frontend compatibility
      price: property.price,
      location: property.location,
      city: property.location?.city, // ADDED: Direct city access
      specifications: property.specifications,
      bedrooms: property.specifications?.bedrooms, // ADDED: Direct access
      bathrooms: property.specifications?.bathrooms, // ADDED: Direct access
      area: property.specifications?.area, // ADDED: Direct access
      facilities: property.facilities,
      images: property.images,
      image: property.images && property.images.length > 0 ? property.images[0] : null, // ADDED: Single image for frontend
      yearBuilt: property.yearBuilt,
      age: property.age,
      condition: property.condition,
      style: property.style,
      status: property.status,
      views: property.views,
      inquiries: property.inquiries,
      isFeatured: property.isFeatured,
      parking: property.facilities?.parkingSlot || false, // ADDED: Frontend compatibility
      lat: property.location?.coordinates?.lat || 0, // ADDED: Map compatibility
      lng: property.location?.coordinates?.lng || 0, // ADDED: Map compatibility
      broker: property.broker ? {
        userId: property.broker.user?.id,
        company: property.broker.companyName,
        licenseNumber: property.broker.licenseNumber,
        experience: property.broker.yearsOfExperience,
        name: property.broker.user?.name,
        email: property.broker.user?.email,
        phone: property.broker.user?.phone
      } : null,
      createdAt: property.createdAt
    }));

    // FIXED: Response structure to match frontend expectations
    res.status(200).json({
      properties: transformedProperties, // Direct access
      count: transformedProperties.length,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      success: true // Optional for error handling
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching properties',
      properties: [], // ADDED: Empty array for frontend
      currentPage: 1,
      totalPages: 1
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
        attributes: ['id', 'companyName', 'licenseNumber', 'yearsOfExperience', 'profileImage', 'rating', 'totalReviews'],
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

    // FIXED: Transform response with proper user object structure
    const transformedProperty = {
      _id: property.id,
      title: property.title,
      description: property.description,
      propertyType: property.propertyType,
      type: property.propertyType,
      listingType: property.listingType,
      propertyFor: property.listingType,
      price: property.price,
      location: property.location,
      city: property.location?.city,
      specifications: property.specifications,
      bedrooms: property.specifications?.bedrooms,
      bathrooms: property.specifications?.bathrooms,
      area: property.specifications?.area,
      facilities: property.facilities,
      images: property.images,
      image: property.images && property.images.length > 0 ? property.images[0] : null,
      yearBuilt: property.yearBuilt,
      age: property.age,
      condition: property.condition,
      style: property.style,
      status: property.status,
      views: property.views + 1,
      inquiries: property.inquiries,
      isFeatured: property.isFeatured,
      parking: property.facilities?.parkingSlot || false,
      lat: property.location?.coordinates?.lat || 0,
      lng: property.location?.coordinates?.lng || 0,
      ownerType: property.ownerType,
      // FIXED: Broker object with proper userId structure for frontend
      broker: property.broker ? {
        // Frontend expects: property.broker.userId.name
        userId: property.broker.user ? {
          _id: property.broker.user.id,
          id: property.broker.user.id,
          name: property.broker.user.name,
          email: property.broker.user.email,
          phone: property.broker.user.phone
        } : null,
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
      propertyFor, // ADDED: Support frontend parameter
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
      listingType: listingType || propertyFor || 'sale', // FIXED: Support both parameters
      price,
      location,
      specifications,
      facilities: facilities || {},
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

    // FIXED: Support both listingType and propertyFor
    const updateData = { ...req.body };
    if (req.body.propertyFor && !req.body.listingType) {
      updateData.listingType = req.body.propertyFor;
    }

    // Update property
    await property.update(updateData);

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

    // FIXED: Transform response to match frontend expectations
    const transformedProperties = properties.map(property => ({
      _id: property.id,
      title: property.title,
      propertyType: property.propertyType,
      type: property.propertyType, // ADDED
      listingType: property.listingType,
      propertyFor: property.listingType, // ADDED
      price: property.price,
      location: property.location,
      city: property.location?.city, // ADDED
      specifications: property.specifications,
      bedrooms: property.specifications?.bedrooms, // ADDED
      bathrooms: property.specifications?.bathrooms, // ADDED
      area: property.specifications?.area, // ADDED
      images: property.images,
      image: property.images && property.images.length > 0 ? property.images[0] : null, // ADDED
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