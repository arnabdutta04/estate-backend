const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Broker = sequelize.define('Broker', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: {
      msg: 'License number already exists'
    }
  },
  yearsOfExperience: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: 0,
        msg: 'Years of experience cannot be negative'
      }
    }
  },
  specialization: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
    comment: 'e.g., Residential, Commercial, Luxury, Investment'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Broker office city'
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  servingCities: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Cities where broker operates - store as comma-separated or single city'
  },
  about: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  licenseDocument: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL of license document'
  },
  idProof: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL of ID proof document'
  },
  propertyTypes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
    comment: 'e.g., Apartment, Villa, House, Commercial, Land'
  },
  listingTypes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
    comment: 'e.g., sale, rent'
  },
  languages: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
    comment: 'Languages spoken by broker'
  },
  verificationStatus: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Admin user ID who verified'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether broker is featured on homepage'
  },
  isBestAgent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether broker is best agent of the month (only one should be true)'
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    },
    comment: 'Average rating from reviews'
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total number of reviews received'
  }
}, {
  timestamps: true,
  tableName: 'brokers',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['verificationStatus']
    },
    {
      fields: ['isFeatured']
    },
    {
      fields: ['isBestAgent']
    },
    {
      fields: ['city']
    }
  ]
});

module.exports = Broker;