// Validation middleware for request data

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Indian format)
const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Validate password strength
const isValidPassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

// Validate registration data
exports.validateRegistration = (req, res, next) => {
  const { name, email, password, phone } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters long' });
  }

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Valid email is required' });
  }

  if (!password || !isValidPassword(password)) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  if (phone && !isValidPhone(phone)) {
    return res.status(400).json({ message: 'Invalid phone number format (10 digits required)' });
  }

  next();
};

// Validate login data
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Valid email is required' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  next();
};

// Validate property data
exports.validateProperty = (req, res, next) => {
  const { title, description, price, address, city, propertyType, status } = req.body;

  if (!title || title.trim().length < 5) {
    return res.status(400).json({ message: 'Title must be at least 5 characters long' });
  }

  if (!description || description.trim().length < 20) {
    return res.status(400).json({ message: 'Description must be at least 20 characters long' });
  }

  if (!price || price <= 0) {
    return res.status(400).json({ message: 'Price must be a positive number' });
  }

  if (!address || address.trim().length < 5) {
    return res.status(400).json({ message: 'Address must be at least 5 characters long' });
  }

  if (!city || city.trim().length < 2) {
    return res.status(400).json({ message: 'City is required' });
  }

  const validPropertyTypes = ['apartment', 'house', 'villa', 'plot', 'commercial', 'office'];
  if (!propertyType || !validPropertyTypes.includes(propertyType.toLowerCase())) {
    return res.status(400).json({ 
      message: 'Invalid property type. Valid types: ' + validPropertyTypes.join(', ') 
    });
  }

  const validStatuses = ['available', 'sold', 'rented', 'pending'];
  if (status && !validStatuses.includes(status.toLowerCase())) {
    return res.status(400).json({ 
      message: 'Invalid status. Valid statuses: ' + validStatuses.join(', ') 
    });
  }

  next();
};

// Validate contact data
exports.validateContact = (req, res, next) => {
  const { name, email, phone, message } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters long' });
  }

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Valid email is required' });
  }

  if (!phone || !isValidPhone(phone)) {
    return res.status(400).json({ message: 'Valid 10-digit phone number is required' });
  }

  if (!message || message.trim().length < 10) {
    return res.status(400).json({ message: 'Message must be at least 10 characters long' });
  }

  next();
};

// Validate broker registration data
exports.validateBrokerRegistration = (req, res, next) => {
  const { name, email, phone, companyName, licenseNumber } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters long' });
  }

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Valid email is required' });
  }

  if (!phone || !isValidPhone(phone)) {
    return res.status(400).json({ message: 'Valid 10-digit phone number is required' });
  }

  if (!companyName || companyName.trim().length < 2) {
    return res.status(400).json({ message: 'Company name must be at least 2 characters long' });
  }

  if (!licenseNumber || licenseNumber.trim().length < 5) {
    return res.status(400).json({ message: 'License number must be at least 5 characters long' });
  }

  next();
};

// Validate schedule data
exports.validateSchedule = (req, res, next) => {
  const { propertyId, scheduledDate, scheduledTime } = req.body;

  if (!propertyId) {
    return res.status(400).json({ message: 'Property ID is required' });
  }

  if (!scheduledDate) {
    return res.status(400).json({ message: 'Scheduled date is required' });
  }

  // Check if date is valid and in the future
  const date = new Date(scheduledDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(date.getTime())) {
    return res.status(400).json({ message: 'Invalid date format' });
  }

  if (date < today) {
    return res.status(400).json({ message: 'Scheduled date must be today or in the future' });
  }

  if (!scheduledTime) {
    return res.status(400).json({ message: 'Scheduled time is required' });
  }

  // Validate time format (HH:MM)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(scheduledTime)) {
    return res.status(400).json({ message: 'Invalid time format. Use HH:MM format' });
  }

  next();
};

// Validate message data
exports.validateMessage = (req, res, next) => {
  const { receiverId, message } = req.body;

  if (!receiverId) {
    return res.status(400).json({ message: 'Receiver ID is required' });
  }

  if (!message || message.trim().length < 1) {
    return res.status(400).json({ message: 'Message cannot be empty' });
  }

  if (message.trim().length > 1000) {
    return res.status(400).json({ message: 'Message cannot exceed 1000 characters' });
  }

  next();
};

// Validate pagination parameters
exports.validatePagination = (req, res, next) => {
  const { page, limit } = req.query;

  if (page && (isNaN(page) || page < 1)) {
    return res.status(400).json({ message: 'Page must be a positive number' });
  }

  if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    return res.status(400).json({ message: 'Limit must be between 1 and 100' });
  }

  next();
};

// Validate update profile data
exports.validateUpdateProfile = (req, res, next) => {
  const { name, phone } = req.body;

  if (name !== undefined && name.trim().length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters long' });
  }

  if (phone !== undefined && phone !== '' && !isValidPhone(phone)) {
    return res.status(400).json({ message: 'Invalid phone number format (10 digits required)' });
  }

  next();
};

// Validate change password data
exports.validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword) {
    return res.status(400).json({ message: 'Current password is required' });
  }

  if (!newPassword || !isValidPassword(newPassword)) {
    return res.status(400).json({ message: 'New password must be at least 6 characters long' });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({ message: 'New password must be different from current password' });
  }

  next();
};