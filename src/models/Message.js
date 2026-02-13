const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  receiverId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  propertyId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'properties',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Property related to this message (optional)'
  },
  parentMessageId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'messages',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'For threaded conversations/replies'
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Property Inquiry'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Message content is required'
      }
    }
  },
  messageType: {
    type: DataTypes.ENUM('inquiry', 'offer', 'general', 'support'),
    defaultValue: 'general',
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
    comment: 'Array of attachment URLs'
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isStarred: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'messages',
  indexes: [
    {
      fields: ['senderId']
    },
    {
      fields: ['receiverId']
    },
    {
      fields: ['propertyId']
    },
    {
      fields: ['parentMessageId']
    },
    {
      fields: ['isRead']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = Message;