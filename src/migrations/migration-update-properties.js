// Migration file to add new columns to properties table
// Place this in: backend/migrations/YYYYMMDDHHMMSS-update-properties-table.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new property types to ENUM
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_properties_propertyType" 
      ADD VALUE IF NOT EXISTS 'residential';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_properties_propertyType" 
      ADD VALUE IF NOT EXISTS 'commercial';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_properties_propertyType" 
      ADD VALUE IF NOT EXISTS 'land';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_properties_propertyType" 
      ADD VALUE IF NOT EXISTS 'luxury';
    `);

    // Add dining rooms column
    await queryInterface.addColumn('properties', 'diningRooms', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Number of dining rooms/spaces'
    });

    // Add individual facility columns
    await queryInterface.addColumn('properties', 'parkingSlot', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Parking available'
    });

    await queryInterface.addColumn('properties', 'wifi', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'WiFi included'
    });

    await queryInterface.addColumn('properties', 'security', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: '24/7 Security'
    });

    await queryInterface.addColumn('properties', 'kitchen', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Kitchen/Modular Kitchen'
    });

    await queryInterface.addColumn('properties', 'ac', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Air Conditioning'
    });

    await queryInterface.addColumn('properties', 'swimmingPool', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Swimming Pool'
    });

    await queryInterface.addColumn('properties', 'gym', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Gym/Fitness Center'
    });

    // Luxury facilities
    await queryInterface.addColumn('properties', 'homeTheater', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Home Theater'
    });

    await queryInterface.addColumn('properties', 'spa', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Spa facility'
    });

    // Commercial facilities
    await queryInterface.addColumn('properties', 'elevator', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Elevator/Lift'
    });

    await queryInterface.addColumn('properties', 'conferenceRoom', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Conference Room'
    });

    // Land facilities
    await queryInterface.addColumn('properties', 'gatedCommunity', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Gated Community'
    });

    await queryInterface.addColumn('properties', 'waterSupply', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Water Supply available'
    });

    await queryInterface.addColumn('properties', 'electricity', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Electricity connection'
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('properties', ['propertyType'], {
      name: 'properties_propertyType_idx'
    });

    await queryInterface.addIndex('properties', ['listingType'], {
      name: 'properties_listingType_idx'
    });

    await queryInterface.addIndex('properties', ['bedrooms'], {
      name: 'properties_bedrooms_idx'
    });

    await queryInterface.addIndex('properties', ['bathrooms'], {
      name: 'properties_bathrooms_idx'
    });

    await queryInterface.addIndex('properties', ['price'], {
      name: 'properties_price_idx'
    });

    console.log('✅ Properties table updated successfully');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove added columns
    await queryInterface.removeColumn('properties', 'diningRooms');
    await queryInterface.removeColumn('properties', 'parkingSlot');
    await queryInterface.removeColumn('properties', 'wifi');
    await queryInterface.removeColumn('properties', 'security');
    await queryInterface.removeColumn('properties', 'kitchen');
    await queryInterface.removeColumn('properties', 'ac');
    await queryInterface.removeColumn('properties', 'swimmingPool');
    await queryInterface.removeColumn('properties', 'gym');
    await queryInterface.removeColumn('properties', 'homeTheater');
    await queryInterface.removeColumn('properties', 'spa');
    await queryInterface.removeColumn('properties', 'elevator');
    await queryInterface.removeColumn('properties', 'conferenceRoom');
    await queryInterface.removeColumn('properties', 'gatedCommunity');
    await queryInterface.removeColumn('properties', 'waterSupply');
    await queryInterface.removeColumn('properties', 'electricity');

    // Remove indexes
    await queryInterface.removeIndex('properties', 'properties_propertyType_idx');
    await queryInterface.removeIndex('properties', 'properties_listingType_idx');
    await queryInterface.removeIndex('properties', 'properties_bedrooms_idx');
    await queryInterface.removeIndex('properties', 'properties_bathrooms_idx');
    await queryInterface.removeIndex('properties', 'properties_price_idx');

    console.log('✅ Properties table reverted successfully');
  }
};