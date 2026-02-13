const { Broker } = require('../models');

// Authorize specific roles - flexible version
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

// Check if broker is verified
exports.checkBrokerVerification = async (req, res, next) => {
  try {
    // Check if user is a broker
    if (req.user.role !== 'broker') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Broker role required.'
      });
    }

    // Get broker profile
    const broker = await Broker.findOne({
      where: { userId: req.user.id }
    });

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker profile not found. Please complete your registration.'
      });
    }

    // Check verification status
    if (broker.verificationStatus === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your broker account is under verification. Please wait for admin approval.',
        verificationStatus: 'pending'
      });
    }

    if (broker.verificationStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your broker verification was rejected.',
        verificationStatus: 'rejected',
        rejectionReason: broker.rejectionReason
      });
    }

    // If verified, attach broker to request
    req.broker = broker;
    next();

  } catch (error) {
    console.error('Broker verification check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification check'
    });
  }
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

// Check if user is broker (regardless of verification)
exports.isBroker = (req, res, next) => {
  if (req.user.role !== 'broker') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Broker role required.'
    });
  }
  next();
};

// Check if user is customer
exports.isCustomer = (req, res, next) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Customer role required.'
    });
  }
  next();
};

// Check if user is broker OR admin
exports.isBrokerOrAdmin = (req, res, next) => {
  if (req.user.role !== 'broker' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Broker or Admin role required.'
    });
  }
  next();
};