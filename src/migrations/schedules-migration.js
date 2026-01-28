// Migration file for creating schedules table
// Filename should be: YYYYMMDDHHMMSS-create-schedules.js
// Place in: backend/src/migrations/

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('schedules', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      propertyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'properties',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      scheduledDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      scheduledTime: {
        type: Sequelize.TIME,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'rejected', 'completed', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('schedules', ['userId'], {
      name: 'idx_schedule_user'
    });
    
    await queryInterface.addIndex('schedules', ['propertyId'], {
      name: 'idx_schedule_property'
    });
    
    await queryInterface.addIndex('schedules', ['status'], {
      name: 'idx_schedule_status'
    });
    
    await queryInterface.addIndex('schedules', ['scheduledDate'], {
      name: 'idx_schedule_date'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('schedules');
  }
};