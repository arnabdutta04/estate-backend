const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  brokerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'brokers',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Title is required'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  propertyType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., Apartment, Villa, House, Commercial, Land'
  },
  listingType: {
    type: DataTypes.ENUM('sale', 'rent'),
    allowNull: false,
    defaultValue: 'sale'
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: {
        args: 0,
        msg: 'Price cannot be negative'
      }
    }
  },
  // Location
  location: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    comment: 'Stores address, city, state, zipCode, country, coordinates'
  },
  // Specifications
  specifications: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    comment: 'Stores bedrooms, bathrooms, area, furnished, etc.'
  },
  // Facilities
  facilities: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Stores furnished, petAllowed, parkingSlot, kitchen, wifi, ac, etc.'
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  yearBuilt: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1800,
      max: new Date().getFullYear() + 5
    }
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Property age in years'
  },
  condition: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'e.g., New, Excellent, Good, Fair, Needs Renovation'
  },
  style: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'e.g., Modern, Traditional, Contemporary, Colonial'
  },
  status: {
    type: DataTypes.ENUM('active', 'pending', 'sold', 'rented', 'inactive'),
    defaultValue: 'active',
    allowNull: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  inquiries: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ownerType: {
    type: DataTypes.ENUM('broker', 'owner'),
    defaultValue: 'broker'
  },
  // SEO fields
  metaTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metaDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'properties',
  indexes: [
    {
      fields: ['brokerId']
    },
    {
      fields: ['propertyType']
    },
    {
      fields: ['listingType']
    },
    {
      fields: ['status']
    },
    {
      fields: ['price']
    }
  ]
});

module.exports = Property;