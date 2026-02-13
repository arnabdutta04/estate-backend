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
  onDelete: 'CASCADE'
});
Property.belongsTo(Broker, {
  foreignKey: 'brokerId',
  as: 'broker',
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

// User - Messages (Receiver) (One-to-Many) - Fixed receiverId
User.hasMany(Message, {
  foreignKey: 'receiverId',
  as: 'receivedMessages',
  onDelete: 'CASCADE'
});
Message.belongsTo(User, {
  foreignKey: 'receiverId',
  as: 'receiver',
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

// User - Contact (One-to-Many)
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

// Export all models
module.exports = {
  sequelize,
  User,
  Broker,
  Property,
  Contact,
  Schedule,
  Message
};
