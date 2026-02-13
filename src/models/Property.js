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
        msg: 'Property title is required'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  propertyType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., Apartment, Villa, House, Commercial, Land, Office, Shop, Warehouse'
  },
  listingType: {
    type: DataTypes.ENUM('sale', 'rent'),
    allowNull: false
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
  // Location fields
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: 'India',
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  // Specifications
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  area: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Area in square feet'
  },
  furnished: {
    type: DataTypes.ENUM('furnished', 'semi-furnished', 'unfurnished'),
    allowNull: true
  },
  // Facilities
  amenities: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
    comment: 'e.g., Parking, Gym, Pool, Security, WiFi, AC'
  },
  petAllowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  parkingSlots: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
    comment: 'Array of image URLs'
  },
  status: {
    type: DataTypes.ENUM('active', 'pending', 'sold', 'rented', 'inactive'),
    defaultValue: 'active',
    allowNull: false
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  inquiries: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  yearBuilt: {
    type: DataTypes.INTEGER,
    allowNull: true
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
  ownerType: {
    type: DataTypes.ENUM('broker', 'owner'),
    defaultValue: 'broker',
    allowNull: false
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
      fields: ['city']
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
      fields: ['isFeatured']
    },
    {
      fields: ['price']
    }
  ]
});

module.exports = Property;