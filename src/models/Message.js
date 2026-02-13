const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  senderId: {
    type: DataTypes.UUID,  // Changed from INTEGER
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'User who sent the message'
  },
  receiverId: {
    type: DataTypes.UUID,  // Changed from INTEGER
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'User who receives the message'
  },
  propertyId: {
    type: DataTypes.UUID,  // Changed from INTEGER
    allowNull: true,
    references: {
      model: 'properties',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    comment: 'Optional - related property'
  },
  parentMessageId: {
    type: DataTypes.UUID,  // Added for message threading
    allowNull: true,
    references: {
      model: 'messages',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    comment: 'Parent message for threading'
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'Property Inquiry',
    comment: 'Message subject line'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Message content'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Whether the message has been read'
  }
}, {
  tableName: 'messages',
  timestamps: true,
  indexes: [
    {
      name: 'idx_message_sender',
      fields: ['senderId']
    },
    {
      name: 'idx_message_receiver',
      fields: ['receiverId']
    },
    {
      name: 'idx_message_property',
      fields: ['propertyId']
    },
    {
      name: 'idx_message_read',
      fields: ['isRead']
    },
    {
      name: 'idx_message_conversation',
      fields: ['senderId', 'receiverId']
    }
  ]
});

module.exports = Message;
