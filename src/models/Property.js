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
  // UPDATED: Changed to match new frontend categories
  propertyType: {
    type: DataTypes.ENUM('residential', 'commercial', 'land', 'luxury', 'Apartment', 'Villa', 'House', 'Commercial', 'Land', 'Office', 'Shop', 'Warehouse'),
    allowNull: false,
    comment: 'Property type - residential, commercial, land, luxury (new) + legacy types for backward compatibility'
  },
  listingType: {
    type: DataTypes.ENUM('sale', 'rent'),
    allowNull: false,
    comment: 'Listing type - sale or rent'
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
    allowNull: true,
    defaultValue: 0
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  // ADDED: Dining rooms for residential properties
  diningRooms: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Number of dining rooms/spaces'
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
  // Facilities - Individual boolean fields for better filtering
  // Common facilities
  parkingSlot: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Parking available'
  },
  wifi: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'WiFi included'
  },
  security: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '24/7 Security'
  },
  
  // Residential facilities
  kitchen: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Kitchen/Modular Kitchen'
  },
  ac: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Air Conditioning'
  },
  swimmingPool: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Swimming Pool'
  },
  gym: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Gym/Fitness Center'
  },
  petAllowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Pets allowed'
  },
  
  // Luxury facilities
  homeTheater: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Home Theater'
  },
  spa: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Spa facility'
  },
  
  // Commercial facilities
  elevator: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Elevator/Lift'
  },
  conferenceRoom: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Conference Room'
  },
  
  // Land facilities
  gatedCommunity: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Gated Community'
  },
  waterSupply: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Water Supply available'
  },
  electricity: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Electricity connection'
  },
  
  // Legacy amenities array (keep for backward compatibility)
  amenities: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
    comment: 'Legacy amenities array - e.g., Parking, Gym, Pool, Security, WiFi, AC'
  },
  
  // DEPRECATED: Use individual facility fields instead
  parkingSlots: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'DEPRECATED: Use parkingSlot boolean instead'
  },
  
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
    comment: 'Array of image URLs from Cloudinary'
  },
  status: {
    type: DataTypes.ENUM('active', 'pending', 'sold', 'rented', 'inactive'),
    defaultValue: 'active',
    allowNull: false,
    comment: 'Property status'
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
    allowNull: false,
    comment: 'Owner type'
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
    },
    {
      fields: ['bedrooms']
    },
    {
      fields: ['bathrooms']
    }
  ]
});

module.exports = Property;