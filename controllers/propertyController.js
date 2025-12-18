const Property = require('../models/Property');
const Broker = require('../models/Broker');

// @desc    Get all properties with filters
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res) => {
  try {
    const {
      propertyType,
      listingType,
      city,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      minArea,
      maxArea,
      condition,
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    let filter = { status: 'available' };

    if (propertyType) filter.propertyType = propertyType;
    if (listingType) filter.listingType = listingType;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (condition) filter.condition = condition;
    if (bedrooms) filter['specifications.bedrooms'] = { $gte: parseInt(bedrooms) };
    if (bathrooms) filter['specifications.bathrooms'] = { $gte: parseInt(bathrooms) };

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    // Area range
    if (minArea || maxArea) {
      filter['specifications.area'] = {};
      if (minArea) filter['specifications.area'].$gte = parseInt(minArea);
      if (maxArea) filter['specifications.area'].$lte = parseInt(maxArea);
    }

    const properties = await Property.find(filter)
      .populate('broker', 'company licenseNumber rating')
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Property.countDocuments(filter);

    res.json({
      properties,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('broker')
      .populate('owner', 'name email phone');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Increment views
    property.views += 1;
    await property.save();

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Broker only)
exports.createProperty = async (req, res) => {
  try {
    const broker = await Broker.findOne({ userId: req.user._id });

    if (!broker) {
      return res.status(403).json({ message: 'Only brokers can create properties' });
    }

    const property = await Property.create({
      ...req.body,
      broker: broker._id,
      owner: req.user._id
    });

    // Add property to broker's properties list
    broker.properties.push(property._id);
    await broker.save();

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Broker/Owner only)
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is owner or broker
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Broker/Owner only)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    await property.deleteOne();

    res.json({ message: 'Property removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
exports.getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ featured: true, status: 'available' })
      .populate('broker', 'company rating')
      .limit(6);

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};