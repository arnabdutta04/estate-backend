const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'User who scheduled the visit'
  },
  propertyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  brokerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'brokers',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Broker associated with the property'
  },
  scheduledDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: {
        msg: 'Please provide a valid date'
      }
    }
  },
  scheduledTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'),
    defaultValue: 'pending',
    allowNull: false
  },
  visitType: {
    type: DataTypes.ENUM('in-person', 'virtual'),
    defaultValue: 'in-person',
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User notes or special requests'
  },
  brokerNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Broker internal notes'
  },
  cancelledBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User who cancelled the schedule'
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'schedules',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['propertyId']
    },
    {
      fields: ['brokerId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['scheduledDate']
    }
  ]
});

module.exports = Schedule;