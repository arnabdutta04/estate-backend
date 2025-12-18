const Broker = require('../models/Broker');
const User = require('../models/User');

// @desc    Get all brokers
// @route   GET /api/brokers
// @access  Public
exports.getBrokers = async (req, res) => {
  try {
    const { city, specialization, minRating } = req.query;

    let filter = { verified: true };

    if (specialization) filter.specialization = specialization;
    if (city) filter.servingAreas = new RegExp(city, 'i');
    if (minRating) filter.rating = { $gte: parseFloat(minRating) };

    const brokers = await Broker.find(filter)
      .populate('userId', 'name email phone')
      .sort({ rating: -1 });

    res.json(brokers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single broker
// @route   GET /api/brokers/:id
// @access  Public
exports.getBrokerById = async (req, res) => {
  try {
    const broker = await Broker.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('properties');

    if (!broker) {
      return res.status(404).json({ message: 'Broker not found' });
    }

    res.json(broker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create broker profile
// @route   POST /api/brokers
// @access  Private
exports.createBroker = async (req, res) => {
  try {
    const { company, licenseNumber, experience, specialization, servingAreas } = req.body;

    // Check if broker profile already exists
    const existingBroker = await Broker.findOne({ userId: req.user._id });
    if (existingBroker) {
      return res.status(400).json({ message: 'Broker profile already exists' });
    }

    const broker = await Broker.create({
      userId: req.user._id,
      company,
      licenseNumber,
      experience,
      specialization,
      servingAreas
    });

    // Update user role to broker
    await User.findByIdAndUpdate(req.user._id, { role: 'broker' });

    res.status(201).json(broker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};