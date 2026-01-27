const User = require('./User');
const Broker = require('./Broker');
const Property = require('./Property');
const Contact = require('./Contact');

// Define relationships
User.hasOne(Broker, {
  foreignKey: 'userId',
  as: 'brokerProfile',
  onDelete: 'CASCADE'
});

Broker.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Broker.hasMany(Property, {
  foreignKey: 'brokerId',
  as: 'properties',
  onDelete: 'CASCADE'
});

Property.belongsTo(Broker, {
  foreignKey: 'brokerId',
  as: 'broker'
});

Contact.belongsTo(User, {
  foreignKey: 'repliedBy',
  as: 'replier'
});

module.exports = {
  User,
  Broker,
  Property,
  Contact
};