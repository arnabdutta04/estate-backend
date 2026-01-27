const { Contact, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContactForm = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create contact submission
    const contact = await Contact.create({
      firstName,
      lastName,
      email,
      phone,
      message,
      status: 'new'
    });

    // TODO: Send email notification to admin
    // TODO: Send auto-reply email to user

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      contact: {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        createdAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting contact form. Please try again.'
    });
  }
};

// @desc    Get all contact submissions
// @route   GET /api/contact
// @access  Private (Admin)
exports.getAllContacts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    // Build where conditions
    const whereConditions = {};

    if (status) {
      whereConditions.status = status;
    }

    if (search) {
      whereConditions[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: contacts } = await Contact.findAndCountAll({
      where: whereConditions,
      include: [{
        model: User,
        as: 'replier',
        attributes: ['id', 'name', 'email']
      }],
      limit: parseInt(limit),
      offset: offset,
      order: [
        ['status', 'ASC'],
        ['createdAt', 'DESC']
      ]
    });

    res.status(200).json({
      success: true,
      count: contacts.length,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      contacts
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact submissions'
    });
  }
};

// @desc    Get single contact submission
// @route   GET /api/contact/:id
// @access  Private (Admin)
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'replier',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    // Mark as read if status is new
    if (contact.status === 'new') {
      await contact.update({ status: 'read' });
    }

    res.status(200).json({
      success: true,
      contact
    });

  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact submission'
    });
  }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id/status
// @access  Private (Admin)
exports.updateContactStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    if (!['new', 'read', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const contact = await Contact.findByPk(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    const updateData = { status };

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    if (status === 'replied') {
      updateData.repliedAt = new Date();
      updateData.repliedBy = req.user.id;
    }

    await contact.update(updateData);

    // Fetch updated contact with replier info
    const updatedContact = await Contact.findByPk(contact.id, {
      include: [{
        model: User,
        as: 'replier',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.status(200).json({
      success: true,
      message: 'Contact status updated successfully',
      contact: updatedContact
    });

  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact status'
    });
  }
};

// @desc    Delete contact submission
// @route   DELETE /api/contact/:id
// @access  Private (Admin)
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    await contact.destroy();

    res.status(200).json({
      success: true,
      message: 'Contact submission deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contact submission'
    });
  }
};

// @desc    Get contact statistics
// @route   GET /api/contact/stats
// @access  Private (Admin)
exports.getContactStats = async (req, res) => {
  try {
    const totalContacts = await Contact.count();
    const newContacts = await Contact.count({ where: { status: 'new' } });
    const readContacts = await Contact.count({ where: { status: 'read' } });
    const repliedContacts = await Contact.count({ where: { status: 'replied' } });
    const closedContacts = await Contact.count({ where: { status: 'closed' } });

    // Get contacts from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentContacts = await Contact.count({
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      }
    });

    // Get contacts from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyContacts = await Contact.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        total: totalContacts,
        new: newContacts,
        read: readContacts,
        replied: repliedContacts,
        closed: closedContacts,
        last7Days: recentContacts,
        last30Days: monthlyContacts
      }
    });

  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact statistics'
    });
  }
};

// @desc    Bulk update contact status
// @route   PUT /api/contact/bulk-update
// @access  Private (Admin)
exports.bulkUpdateContacts = async (req, res) => {
  try {
    const { contactIds, status } = req.body;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide contact IDs'
      });
    }

    if (!status || !['new', 'read', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status'
      });
    }

    const updateData = { status };

    if (status === 'replied') {
      updateData.repliedAt = new Date();
      updateData.repliedBy = req.user.id;
    }

    await Contact.update(updateData, {
      where: {
        id: {
          [Op.in]: contactIds
        }
      }
    });

    res.status(200).json({
      success: true,
      message: `${contactIds.length} contact(s) updated successfully`
    });

  } catch (error) {
    console.error('Error bulk updating contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contacts'
    });
  }
};