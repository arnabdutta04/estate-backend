const Message = require('../models/Message');
const User = require('../models/User');
const Property = require('../models/Property');
const { Op } = require('sequelize');

// Send a message
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, propertyId, message } = req.body;
    const senderId = req.user.id;

    // Validation
    if (!receiverId || !message) {
      return res.status(400).json({ message: 'Receiver and message are required' });
    }

    // Check if receiver exists
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Create message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      propertyId: propertyId || null,
      message,
      isRead: false
    });

    // Fetch the complete message with sender and receiver details
    const messageWithDetails = await Message.findByPk(newMessage.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'address', 'city', 'price', 'images']
        }
      ]
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: messageWithDetails
    });
  } catch (error) {
    next(error);
  }
};

// Get all conversations for logged-in user
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all unique users the current user has conversed with
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Group messages by conversation partner
    const conversationsMap = new Map();

    messages.forEach(msg => {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partnerId,
          partnerName: partner.name,
          partnerEmail: partner.email,
          partnerRole: partner.role,
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          unreadCount: 0
        });
      }

      // Count unread messages
      if (msg.receiverId === userId && !msg.isRead) {
        conversationsMap.get(partnerId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.status(200).json({ conversations });
  } catch (error) {
    next(error);
  }
};

// Get messages between logged-in user and another user
exports.getMessagesBetweenUsers = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'address', 'city', 'price', 'images']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // Mark messages as read
    await Message.update(
      { isRead: true },
      {
        where: {
          senderId: otherUserId,
          receiverId: userId,
          isRead: false
        }
      }
    );

    res.status(200).json({ messages });
  } catch (error) {
    next(error);
  }
};

// Get all messages for a specific property
exports.getPropertyMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    // Check if property exists
    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const messages = await Message.findAll({
      where: {
        propertyId,
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json({ messages });
  } catch (error) {
    next(error);
  }
};

// Mark message as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await Message.findOne({
      where: { id, receiverId: userId }
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.isRead = true;
    await message.save();

    res.status(200).json({
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// Mark all messages from a user as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { senderId } = req.params;

    await Message.update(
      { isRead: true },
      {
        where: {
          senderId,
          receiverId: userId,
          isRead: false
        }
      }
    );

    res.status(200).json({ message: 'All messages marked as read' });
  } catch (error) {
    next(error);
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const count = await Message.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    next(error);
  }
};

// Delete a message (soft delete by marking as deleted)
exports.deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await Message.findOne({
      where: {
        id,
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Actually delete the message
    await message.destroy();

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    next(error);
  }
};