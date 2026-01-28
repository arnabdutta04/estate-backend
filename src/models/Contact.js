// Application constants

// User Roles
const USER_ROLES = {
  CUSTOMER: 'customer',
  BROKER: 'broker',
  ADMIN: 'admin'
};

// Broker Verification Status
const BROKER_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

// Property Status
const PROPERTY_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  SOLD: 'sold',
  RENTED: 'rented',
  INACTIVE: 'inactive'
};

// Listing Types
const LISTING_TYPES = {
  SALE: 'sale',
  RENT: 'rent'
};

// Property Types
const PROPERTY_TYPES = {
  APARTMENT: 'Apartment',
  VILLA: 'Villa',
  HOUSE: 'House',
  COMMERCIAL: 'Commercial',
  LAND: 'Land',
  OFFICE: 'Office',
  SHOP: 'Shop',
  WAREHOUSE: 'Warehouse'
};

// Owner Types
const OWNER_TYPES = {
  BROKER: 'broker',
  OWNER: 'owner'
};

// Contact Status
const CONTACT_STATUS = {
  NEW: 'new',
  READ: 'read',
  REPLIED: 'replied',
  CLOSED: 'closed'
};

// File Upload Folders (Cloudinary)
const UPLOAD_FOLDERS = {
  BROKER_PROFILES: 'estate/brokers/profiles',
  BROKER_LICENSE: 'estate/brokers/documents/license',
  BROKER_ID: 'estate/brokers/documents/id-proof',
  PROPERTY_IMAGES: 'estate/properties/images',
  USER_PROFILES: 'estate/users/profiles'
};

// Allowed File Types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_DOC_TYPES = ['application/pdf'];

// File Size Limits (in bytes)
const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024,  // 5MB
  DOCUMENT: 5 * 1024 * 1024 // 5MB
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Success Messages
const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful',
  REGISTER: 'Registration successful',
  LOGOUT: 'Logout successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  BROKER_VERIFIED: 'Broker verified successfully',
  PROPERTY_CREATED: 'Property created successfully',
  PROPERTY_UPDATED: 'Property updated successfully',
  PROPERTY_DELETED: 'Property deleted successfully',
  CONTACT_SUBMITTED: 'Thank you for contacting us! We will get back to you soon.',
  FILE_UPLOADED: 'File uploaded successfully'
};

// Error Messages
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already exists',
  PHONE_EXISTS: 'Phone number already exists',
  USER_NOT_FOUND: 'User not found',
  BROKER_NOT_FOUND: 'Broker not found',
  PROPERTY_NOT_FOUND: 'Property not found',
  UNAUTHORIZED: 'Not authorized to access this route',
  FORBIDDEN: 'You do not have permission to perform this action',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_EXPIRED: 'Token expired',
  SERVER_ERROR: 'Server error. Please try again later',
  FILE_UPLOAD_ERROR: 'Error uploading file',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File size too large'
};

// Indian Cities (Popular)
const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 
  'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Surat',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal',
  'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana'
];

module.exports = {
  USER_ROLES,
  BROKER_STATUS,
  PROPERTY_STATUS,
  LISTING_TYPES,
  PROPERTY_TYPES,
  OWNER_TYPES,
  CONTACT_STATUS,
  UPLOAD_FOLDERS,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOC_TYPES,
  FILE_SIZE_LIMITS,
  PAGINATION,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  INDIAN_CITIES
};