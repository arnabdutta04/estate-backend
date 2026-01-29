const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'User who sent the message'
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'User who receives the message'
  },
  propertyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Properties',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    comment: 'Optional - related property'
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
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
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

// Define associations
Message.associate = (models) => {
  // Message belongs to a sender (User)
  Message.belongsTo(models.User, {
    foreignKey: 'senderId',
    as: 'sender'
  });

  // Message belongs to a receiver (User)
  Message.belongsTo(models.User, {
    foreignKey: 'receiverId',
    as: 'receiver'
  });

  // Message optionally belongs to a Property
  Message.belongsTo(models.Property, {
    foreignKey: 'propertyId',
    as: 'property'
  });
};

module.exports = Message;