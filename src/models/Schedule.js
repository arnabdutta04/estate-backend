const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,  // Changed from INTEGER
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  propertyId: {
    type: DataTypes.UUID,  // Changed from INTEGER
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  brokerId: {
    type: DataTypes.UUID,  // Added to match your index.js associations
    allowNull: true,
    references: {
      model: 'brokers',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  scheduledDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Date of the scheduled visit (YYYY-MM-DD)'
  },
  scheduledTime: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Time of the scheduled visit (HH:MM:SS)'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Optional message from the user'
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'rejected', 'completed', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false,
    comment: 'Status of the schedule'
  }
}, {
  tableName: 'schedules',
  timestamps: true,
  indexes: [
    {
      name: 'idx_schedule_user',
      fields: ['userId']
    },
    {
      name: 'idx_schedule_property',
      fields: ['propertyId']
    },
    {
      name: 'idx_schedule_broker',
      fields: ['brokerId']
    },
    {
      name: 'idx_schedule_status',
      fields: ['status']
    },
    {
      name: 'idx_schedule_date',
      fields: ['scheduledDate']
    }
  ]
});

module.exports = Schedule;
