// User roles
exports.USER_ROLES = {
  CUSTOMER: 'customer',
  BROKER: 'broker',
  ADMIN: 'admin'
};

// Broker verification status
exports.BROKER_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

// HTTP status codes
exports.HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Error messages
exports.ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  EMAIL_EXISTS: 'Email already exists',
  PHONE_EXISTS: 'Phone number already exists',
  USER_NOT_FOUND: 'User not found',
  UNAUTHORIZED: 'Not authorized',
  TOKEN_EXPIRED: 'Token expired',
  SERVER_ERROR: 'Server error',
  VALIDATION_FAILED: 'Validation failed',
  ACCOUNT_DEACTIVATED: 'Account is deactivated'
};

// Success messages
exports.SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Registration successful',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully'
};

// Token expiry
exports.TOKEN_EXPIRY = {
  ACCESS_TOKEN: '30d',
  REFRESH_TOKEN: '60d'
};

// Pagination defaults
exports.PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};