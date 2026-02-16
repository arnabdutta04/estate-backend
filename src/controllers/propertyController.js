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
      propertyFor, // Frontend compatibility (same as listingType)
      city,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      diningRooms,
      keyword,
      facilities, // Array of facility names
      style,
      status = 'active',
      page = 1,
      limit = 12
    } = req.query;

    // Build where conditions
    const whereConditions = {
      status: status
    };

    // Property Type Filter
    if (propertyType) {
      whereConditions.propertyType = propertyType;
    }

    // Listing Type Filter (rent/buy)
    if (listingType || propertyFor) {
      whereConditions.listingType = listingType || propertyFor;
    }

    // Style Filter
    if (style) {
      whereConditions.style = style;
    }

    // Price Range Filter - Manual input support
    if (minPrice || maxPrice) {
      whereConditions.price = {};
      if (minPrice && minPrice !== '' && !isNaN(parseFloat(minPrice))) {
        whereConditions.price[Op.gte] = parseFloat(minPrice);
      }
      if (maxPrice && maxPrice !== '' && !isNaN(parseFloat(maxPrice))) {
        whereConditions.price[Op.lte] = parseFloat(maxPrice);
      }
    }

    // Keyword Search
    if (keyword && keyword.trim() !== '') {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${keyword}%` } },
        { description: { [Op.iLike]: `%${keyword}%` } },
        { address: { [Op.iLike]: `%${keyword}%` } }
      ];
    }

    // City Filter
    if (city && city.trim() !== '') {
      whereConditions.city = {
        [Op.iLike]: `%${city}%`
      };
    }

    // Bedrooms Filter (minimum required)
    if (bedrooms && parseInt(bedrooms) > 0) {
      whereConditions.bedrooms = {
        [Op.gte]: parseInt(bedrooms)
      };
    }

    // Bathrooms Filter (minimum required)
    if (bathrooms && parseInt(bathrooms) > 0) {
      whereConditions.bathrooms = {
        [Op.gte]: parseInt(bathrooms)
      };
    }

    // Dining Rooms Filter (minimum required)
    if (diningRooms && parseInt(diningRooms) > 0) {
      whereConditions.diningRooms = {
        [Op.gte]: parseInt(diningRooms)
      };
    }

    // Facilities Filter - Check individual boolean fields
    if (facilities) {
      const facilityArray = Array.isArray(facilities) ? facilities : [facilities];
      
      // Map frontend facility names to database column names
      const facilityMapping = {
        'furnished': 'furnished',
        'petAllowed': 'petAllowed',
        'parkingSlot': 'parkingSlot',
        'kitchen': 'kitchen',
        'wifi': 'wifi',
        'ac': 'ac',
        'swimmingPool': 'swimmingPool',
        'gym': 'gym',
        'security': 'security',
        'homeTheater': 'homeTheater',
        'spa': 'spa',
        'elevator': 'elevator',
        'conference': 'conferenceRoom',
        'conferenceRoom': 'conferenceRoom',
        'gated': 'gatedCommunity',
        'gatedCommunity': 'gatedCommunity',
        'waterSupply': 'waterSupply',
        'electricity': 'electricity'
      };

      facilityArray.forEach(facility => {
        const dbColumn = facilityMapping[facility] || facility;
        
        // Special handling for furnished (it's an ENUM)
        if (dbColumn === 'furnished') {
          whereConditions.furnished = {
            [Op.in]: ['furnished', 'semi-furnished']
          };
        } else {
          // For boolean fields
          whereConditions[dbColumn] = true;
        }
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

    // Transform response to match frontend expectations
    const transformedProperties = properties.map(property => {
      // Build facilities object from individual boolean fields
      const facilities = {
        furnished: property.furnished === 'furnished' || property.furnished === 'semi-furnished',
        petAllowed: property.petAllowed || false,
        parkingSlot: property.parkingSlot || false,
        kitchen: property.kitchen || false,
        wifi: property.wifi || false,
        ac: property.ac || false,
        swimmingPool: property.swimmingPool || false,
        gym: property.gym || false,
        security: property.security || false,
        homeTheater: property.homeTheater || false,
        spa: property.spa || false,
        elevator: property.elevator || false,
        conferenceRoom: property.conferenceRoom || false,
        gatedCommunity: property.gatedCommunity || false,
        waterSupply: property.waterSupply || false,
        electricity: property.electricity || false
      };

      // Build specifications object
      const specifications = {
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        diningRooms: property.diningRooms || 0,
        area: property.area || 0,
        furnished: property.furnished || 'unfurnished'
      };

      // Build location object
      const location = {
        address: property.address,
        city: property.city,
        state: property.state,
        zipCode: property.pincode,
        country: property.country,
        coordinates: {
          lat: property.latitude ? parseFloat(property.latitude) : 0,
          lng: property.longitude ? parseFloat(property.longitude) : 0
        }
      };

      return {
        _id: property.id,
        id: property.id,
        title: property.title,
        description: property.description,
        propertyType: property.propertyType,
        type: property.propertyType, // Frontend compatibility
        listingType: property.listingType,
        propertyFor: property.listingType, // Frontend compatibility
        price: property.price,
        location: location,
        city: property.city, // Direct city access
        specifications: specifications,
        bedrooms: property.bedrooms || 0, // Direct access
        bathrooms: property.bathrooms || 0, // Direct access
        diningRooms: property.diningRooms || 0, // Direct access
        area: property.area || 0, // Direct access
        facilities: facilities,
        images: property.images || [],
        image: property.images && property.images.length > 0 ? property.images[0] : null, // Single image for cards
        yearBuilt: property.yearBuilt,
        age: property.age,
        condition: property.condition,
        style: property.style,
        status: property.status,
        views: property.views || 0,
        inquiries: property.inquiries || 0,
        isFeatured: property.isFeatured || false,
        parking: property.parkingSlot || false, // Frontend compatibility
        lat: property.latitude ? parseFloat(property.latitude) : 0,
        lng: property.longitude ? parseFloat(property.longitude) : 0,
        broker: property.broker ? {
          userId: property.broker.user?.id,
          company: property.broker.companyName,
          licenseNumber: property.broker.licenseNumber,
          experience: property.broker.yearsOfExperience,
          name: property.broker.user?.name,
          email: property.broker.user?.email,
          phone: property.broker.user?.phone
        } : null,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt
      };
    });

    // Response structure to match frontend expectations
    res.status(200).json({
      success: true,
      properties: transformedProperties,
      count: transformedProperties.length,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit))
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching properties',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      properties: [],
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

    // Build facilities object from individual boolean fields
    const facilities = {
      furnished: property.furnished === 'furnished' || property.furnished === 'semi-furnished',
      petAllowed: property.petAllowed || false,
      parkingSlot: property.parkingSlot || false,
      kitchen: property.kitchen || false,
      wifi: property.wifi || false,
      ac: property.ac || false,
      swimmingPool: property.swimmingPool || false,
      gym: property.gym || false,
      security: property.security || false,
      homeTheater: property.homeTheater || false,
      spa: property.spa || false,
      elevator: property.elevator || false,
      conferenceRoom: property.conferenceRoom || false,
      gatedCommunity: property.gatedCommunity || false,
      waterSupply: property.waterSupply || false,
      electricity: property.electricity || false
    };

    // Build specifications object
    const specifications = {
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      diningRooms: property.diningRooms || 0,
      area: property.area || 0,
      furnished: property.furnished || 'unfurnished'
    };

    // Build location object
    const location = {
      address: property.address,
      city: property.city,
      state: property.state,
      zipCode: property.pincode,
      country: property.country,
      coordinates: {
        lat: property.latitude ? parseFloat(property.latitude) : 0,
        lng: property.longitude ? parseFloat(property.longitude) : 0
      }
    };

    // Transform response with proper structure for frontend
    const transformedProperty = {
      _id: property.id,
      id: property.id,
      title: property.title,
      description: property.description,
      propertyType: property.propertyType,
      type: property.propertyType,
      listingType: property.listingType,
      propertyFor: property.listingType,
      price: property.price,
      location: location,
      city: property.city,
      specifications: specifications,
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      diningRooms: property.diningRooms || 0,
      area: property.area || 0,
      facilities: facilities,
      images: property.images || [],
      image: property.images && property.images.length > 0 ? property.images[0] : null,
      yearBuilt: property.yearBuilt,
      age: property.age,
      condition: property.condition,
      style: property.style,
      status: property.status,
      views: property.views + 1,
      inquiries: property.inquiries || 0,
      isFeatured: property.isFeatured || false,
      parking: property.parkingSlot || false,
      lat: property.latitude ? parseFloat(property.latitude) : 0,
      lng: property.longitude ? parseFloat(property.longitude) : 0,
      ownerType: property.ownerType,
      // Broker object with proper userId structure for frontend
      broker: property.broker ? {
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
      message: 'Error fetching property details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      propertyFor, // Frontend compatibility
      price,
      // Location fields
      address,
      city,
      state,
      pincode,
      country,
      latitude,
      longitude,
      // Specifications
      bedrooms,
      bathrooms,
      diningRooms,
      area,
      furnished,
      // Facilities (individual fields)
      parkingSlot,
      wifi,
      security,
      kitchen,
      ac,
      swimmingPool,
      gym,
      petAllowed,
      homeTheater,
      spa,
      elevator,
      conferenceRoom,
      gatedCommunity,
      waterSupply,
      electricity,
      // Other fields
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
      listingType: listingType || propertyFor || 'sale',
      price,
      // Location
      address,
      city,
      state,
      pincode,
      country,
      latitude,
      longitude,
      // Specifications
      bedrooms: bedrooms || 0,
      bathrooms: bathrooms || 0,
      diningRooms: diningRooms || 0,
      area,
      furnished,
      // Facilities
      parkingSlot: parkingSlot || false,
      wifi: wifi || false,
      security: security || false,
      kitchen: kitchen || false,
      ac: ac || false,
      swimmingPool: swimmingPool || false,
      gym: gym || false,
      petAllowed: petAllowed || false,
      homeTheater: homeTheater || false,
      spa: spa || false,
      elevator: elevator || false,
      conferenceRoom: conferenceRoom || false,
      gatedCommunity: gatedCommunity || false,
      waterSupply: waterSupply || false,
      electricity: electricity || false,
      // Other
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
      message: error.message || 'Error creating property',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    // Support both listingType and propertyFor
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
      message: 'Error updating property',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      message: 'Error deleting property',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    // Transform response to match frontend expectations
    const transformedProperties = properties.map(property => {
      const facilities = {
        furnished: property.furnished === 'furnished' || property.furnished === 'semi-furnished',
        petAllowed: property.petAllowed || false,
        parkingSlot: property.parkingSlot || false,
        kitchen: property.kitchen || false,
        wifi: property.wifi || false,
        ac: property.ac || false,
        swimmingPool: property.swimmingPool || false,
        gym: property.gym || false,
        security: property.security || false
      };

      const specifications = {
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        area: property.area || 0
      };

      const location = {
        city: property.city,
        state: property.state,
        address: property.address
      };

      return {
        _id: property.id,
        title: property.title,
        propertyType: property.propertyType,
        type: property.propertyType,
        listingType: property.listingType,
        propertyFor: property.listingType,
        price: property.price,
        location: location,
        city: property.city,
        specifications: specifications,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        area: property.area || 0,
        facilities: facilities,
        images: property.images || [],
        image: property.images && property.images.length > 0 ? property.images[0] : null,
        status: property.status,
        views: property.views || 0,
        inquiries: property.inquiries || 0,
        createdAt: property.createdAt
      };
    });

    res.status(200).json({
      success: true,
      count: transformedProperties.length,
      data: transformedProperties
    });

  } catch (error) {
    console.error('Error fetching broker properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching properties',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      message: 'Error scheduling visit',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      message: 'Error updating featured status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};