// src/models/index.js
const { sequelize } = require('../config/database');
const User = require('./User');
const Broker = require('./Broker');
const Property = require('./Property');
const Contact = require('./Contact');
const Schedule = require('./Schedule');
const Message = require('./Message');

// ===========================================
// MODEL ASSOCIATIONS
// ===========================================

// User - Broker (One-to-One)
User.hasOne(Broker, {
  foreignKey: 'userId',
  as: 'brokerProfile',
  onDelete: 'CASCADE'
});
Broker.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE'
});

// Broker - Properties (One-to-Many)
Broker.hasMany(Property, {
  foreignKey: 'brokerId',
  as: 'properties',
  onDelete: 'SET NULL'
});
Property.belongsTo(Broker, {
  foreignKey: 'brokerId',
  as: 'broker',
  onDelete: 'SET NULL'
});

// User - Properties (One-to-Many) - For property owners
User.hasMany(Property, {
  foreignKey: 'ownerId',
  as: 'ownedProperties',
  onDelete: 'CASCADE'
});
Property.belongsTo(User, {
  foreignKey: 'ownerId',
  as: 'owner',
  onDelete: 'CASCADE'
});

// Property - Schedules (One-to-Many)
Property.hasMany(Schedule, {
  foreignKey: 'propertyId',
  as: 'schedules',
  onDelete: 'CASCADE'
});
Schedule.belongsTo(Property, {
  foreignKey: 'propertyId',
  as: 'property',
  onDelete: 'CASCADE'
});

// User - Schedules (One-to-Many)
User.hasMany(Schedule, {
  foreignKey: 'userId',
  as: 'userSchedules',
  onDelete: 'CASCADE'
});
Schedule.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE'
});

// Broker - Schedules (One-to-Many)
Broker.hasMany(Schedule, {
  foreignKey: 'brokerId',
  as: 'brokerSchedules',
  onDelete: 'SET NULL'
});
Schedule.belongsTo(Broker, {
  foreignKey: 'brokerId',
  as: 'broker',
  onDelete: 'SET NULL'
});

// User - Messages (Sender) (One-to-Many)
User.hasMany(Message, {
  foreignKey: 'senderId',
  as: 'sentMessages',
  onDelete: 'CASCADE'
});
Message.belongsTo(User, {
  foreignKey: 'senderId',
  as: 'sender',
  onDelete: 'CASCADE'
});

// User - Messages (Recipient) (One-to-Many)
User.hasMany(Message, {
  foreignKey: 'recipientId',
  as: 'receivedMessages',
  onDelete: 'CASCADE'
});
Message.belongsTo(User, {
  foreignKey: 'recipientId',
  as: 'recipient',
  onDelete: 'CASCADE'
});

// Property - Messages (Optional) (One-to-Many)
Property.hasMany(Message, {
  foreignKey: 'propertyId',
  as: 'messages',
  onDelete: 'SET NULL'
});
Message.belongsTo(Property, {
  foreignKey: 'propertyId',
  as: 'property',
  onDelete: 'SET NULL'
});

// Message - Message (Self-referencing for replies/threads)
Message.hasMany(Message, {
  foreignKey: 'parentMessageId',
  as: 'replies',
  onDelete: 'SET NULL'
});
Message.belongsTo(Message, {
  foreignKey: 'parentMessageId',
  as: 'parentMessage',
  onDelete: 'SET NULL'
});

// User - Contact (One-to-Many) - Optional if you want to track contact forms by user
User.hasMany(Contact, {
  foreignKey: 'userId',
  as: 'contacts',
  onDelete: 'SET NULL'
});
Contact.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'SET NULL'
});

// ===========================================
// SYNC DATABASE (DEVELOPMENT ONLY)
// ===========================================
const syncDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ All models synchronized with database');
    }
  } catch (error) {
    console.error('❌ Error synchronizing models:', error);
    throw error;
  }
};

// Export all models
module.exports = {
  sequelize,
  User,
  Broker,
  Property,
  Contact,
  Schedule,
  Message,
  syncDatabase
};