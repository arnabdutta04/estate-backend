const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  propertyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Properties',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
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
      name: 'idx_schedule_status',
      fields: ['status']
    },
    {
      name: 'idx_schedule_date',
      fields: ['scheduledDate']
    }
  ]
});

// Define associations
Schedule.associate = (models) => {
  // Schedule belongs to a User
  Schedule.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // Schedule belongs to a Property
  Schedule.belongsTo(models.Property, {
    foreignKey: 'propertyId',
    as: 'property'
  });
};

module.exports = Schedule;
