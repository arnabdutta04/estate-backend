const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  propertyType: {
    type: String,
    required: true,
    enum: ['apartment', 'villa', 'house', 'flat', 'commercial', 'land']
  },
  listingType: {
    type: String,
    required: true,
    enum: ['sale', 'rent']
  },
  price: {
    type: Number,
    required: true
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  specifications: {
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    area: { type: Number, required: true }, // in sq ft
    floors: { type: Number },
    furnished: { 
      type: String, 
      enum: ['fully', 'semi', 'unfurnished'],
      default: 'unfurnished'
    }
  },
  yearBuilt: {
    type: Number,
    required: true
  },
  age: {
    type: Number // calculated field
  },
  condition: {
    type: String,
    enum: ['new', 'excellent', 'good', 'fair', 'needs_renovation'],
    required: true
  },
  features: [{
    type: String
  }],
  images: [{
    type: String
  }],
  broker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Broker',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'rented', 'pending'],
    default: 'available'
  },
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate property age before saving
propertySchema.pre('save', function(next) {
  const currentYear = new Date().getFullYear();
  this.age = currentYear - this.yearBuilt;
  this.updatedAt = Date.now();
  next();
});

// Index for search optimization
propertySchema.index({ 'location.city': 1, propertyType: 1, listingType: 1 });
propertySchema.index({ price: 1 });

module.exports = mongoose.model('Property', propertySchema);