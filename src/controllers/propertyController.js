// ============================================================
// FIXED SECTION ONLY: scheduleVisit function
// Replace only this function in your existing propertyController.js
// All other functions (getAllProperties, getPropertyById, etc.) remain unchanged
// ============================================================

// @desc    Schedule property visit
// @route   POST /api/properties/:id/schedule-visit
// @access  Private
exports.scheduleVisit = async (req, res) => {
  try {
    const { Property, Schedule, Broker } = require('../models');

    // ✅ FIX: Frontend sends { date, time, message } but Schedule model uses
    //         { scheduledDate, scheduledTime, notes }
    const { date, time, message } = req.body;
    const propertyId = req.params.id;
    const userId = req.user.id;

    // Validate required fields
    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Date and time are required to schedule a visit'
      });
    }

    // Validate date is not in the past
    const visitDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (visitDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Visit date must be today or in the future'
      });
    }

    // Check if property exists
    const property = await Property.findByPk(propertyId, {
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

    // Check if user already has a pending schedule for this property
    const existingSchedule = await Schedule.findOne({
      where: {
        userId,
        propertyId,
        status: 'pending'
      }
    });

    if (existingSchedule) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending visit scheduled for this property'
      });
    }

    // ✅ FIX: Map frontend field names to Schedule model field names:
    //   date      → scheduledDate
    //   time      → scheduledTime
    //   message   → notes
    const schedule = await Schedule.create({
      userId,
      propertyId,
      brokerId: property.brokerId || null,
      scheduledDate: date,        // ✅ FIX: was "date", model field is "scheduledDate"
      scheduledTime: time,        // ✅ FIX: was "time", model field is "scheduledTime"
      notes: message || '',       // ✅ FIX: was "message", model field is "notes"
      status: 'pending',
      visitType: 'in-person'
    });

    // Increment property inquiries count
    await property.increment('inquiries');

    res.status(201).json({
      success: true,
      message: 'Visit scheduled successfully! The broker will confirm your appointment.',
      data: {
        scheduleId: schedule.id,
        scheduledDate: schedule.scheduledDate,
        scheduledTime: schedule.scheduledTime,
        status: schedule.status
      }
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