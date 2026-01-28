const Schedule = require('../models/Schedule');
const Property = require('../models/Property');
const User = require('../models/User');

// Create a new schedule
exports.createSchedule = async (req, res, next) => {
  try {
    const { propertyId, scheduledDate, scheduledTime, message } = req.body;
    const userId = req.user.id;

    // Check if property exists
    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user already has a schedule for this property
    const existingSchedule = await Schedule.findOne({
      where: {
        userId,
        propertyId,
        status: 'pending'
      }
    });

    if (existingSchedule) {
      return res.status(400).json({ 
        message: 'You already have a pending schedule for this property' 
      });
    }

    // Create schedule
    const schedule = await Schedule.create({
      userId,
      propertyId,
      scheduledDate,
      scheduledTime,
      message,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Schedule created successfully',
      schedule
    });
  } catch (error) {
    next(error);
  }
};

// Get all schedules for a user
exports.getUserSchedules = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const schedules = await Schedule.findAll({
      where: { userId },
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'address', 'city', 'price', 'images']
        }
      ],
      order: [['scheduledDate', 'DESC'], ['scheduledTime', 'DESC']]
    });

    res.status(200).json({ schedules });
  } catch (error) {
    next(error);
  }
};

// Get all schedules for a broker (property owner)
exports.getBrokerSchedules = async (req, res, next) => {
  try {
    const brokerId = req.user.id;

    // Get all properties owned by this broker
    const properties = await Property.findAll({
      where: { userId: brokerId },
      attributes: ['id']
    });

    const propertyIds = properties.map(p => p.id);

    const schedules = await Schedule.findAll({
      where: {
        propertyId: propertyIds
      },
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'address', 'city', 'price', 'images']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['scheduledDate', 'DESC'], ['scheduledTime', 'DESC']]
    });

    res.status(200).json({ schedules });
  } catch (error) {
    next(error);
  }
};

// Get a single schedule by ID
exports.getScheduleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const schedule = await Schedule.findOne({
      where: { id },
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'address', 'city', 'price', 'images', 'userId']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Check if user is authorized to view this schedule
    if (schedule.userId !== userId && schedule.property.userId !== userId) {
      return res.status(403).json({ 
        message: 'You are not authorized to view this schedule' 
      });
    }

    res.status(200).json({ schedule });
  } catch (error) {
    next(error);
  }
};

// Update schedule status (broker can accept/reject)
exports.updateScheduleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const brokerId = req.user.id;

    // Validate status
    if (!['pending', 'confirmed', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const schedule = await Schedule.findOne({
      where: { id },
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['userId']
        }
      ]
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Check if broker owns the property
    if (schedule.property.userId !== brokerId) {
      return res.status(403).json({ 
        message: 'You are not authorized to update this schedule' 
      });
    }

    schedule.status = status;
    await schedule.save();

    res.status(200).json({
      message: 'Schedule status updated successfully',
      schedule
    });
  } catch (error) {
    next(error);
  }
};

// Cancel schedule (user can cancel their own schedule)
exports.cancelSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const schedule = await Schedule.findOne({
      where: { id, userId }
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    if (schedule.status === 'completed' || schedule.status === 'cancelled') {
      return res.status(400).json({ 
        message: 'Cannot cancel a completed or already cancelled schedule' 
      });
    }

    schedule.status = 'cancelled';
    await schedule.save();

    res.status(200).json({
      message: 'Schedule cancelled successfully',
      schedule
    });
  } catch (error) {
    next(error);
  }
};

// Delete schedule
exports.deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const schedule = await Schedule.findOne({
      where: { id, userId }
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    await schedule.destroy();

    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    next(error);
  }
};