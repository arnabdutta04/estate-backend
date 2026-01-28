// Email Service for sending emails using Nodemailer
const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter
const createTransporter = () => {
  // For Gmail
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
      }
    });
  }

  // For other SMTP services
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

// Send email function
const sendEmail = async (to, subject, html, text = '') => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      logger.warn('Email service not configured. Skipping email send.');
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Estate Portal'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', { to, subject, messageId: info.messageId });
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Error sending email', { error: error.message, to, subject });
    return { success: false, error: error.message };
  }
};

// Welcome email template
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Estate Portal!';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Estate Portal, ${user.name}!</h2>
      <p style="color: #666; line-height: 1.6;">
        Thank you for registering with us. We're excited to have you on board!
      </p>
      <p style="color: #666; line-height: 1.6;">
        You can now browse properties, connect with brokers, and schedule property visits.
      </p>
      <div style="margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://estate-frontend-62p7.onrender.com'}" 
           style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Get Started
        </a>
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        If you have any questions, feel free to contact our support team.
      </p>
    </div>
  `;
  
  return await sendEmail(user.email, subject, html);
};

// Property inquiry notification for broker
const sendPropertyInquiryEmail = async (broker, property, user, message) => {
  const subject = `New Inquiry for ${property.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Property Inquiry</h2>
      <p style="color: #666;">
        You have received a new inquiry for your property:
      </p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">${property.title}</h3>
        <p style="color: #666; margin: 5px 0;"><strong>Location:</strong> ${property.address}, ${property.city}</p>
        <p style="color: #666; margin: 5px 0;"><strong>Price:</strong> ₹${property.price.toLocaleString()}</p>
      </div>
      <h3 style="color: #333;">From:</h3>
      <p style="color: #666;">
        <strong>Name:</strong> ${user.name}<br>
        <strong>Email:</strong> ${user.email}<br>
        <strong>Phone:</strong> ${user.phone || 'Not provided'}
      </p>
      <h3 style="color: #333;">Message:</h3>
      <p style="color: #666; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50;">
        ${message}
      </p>
      <div style="margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://estate-frontend-62p7.onrender.com'}/messages" 
           style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Messages
        </a>
      </div>
    </div>
  `;
  
  return await sendEmail(broker.email, subject, html);
};

// Schedule confirmation email
const sendScheduleConfirmationEmail = async (user, property, schedule) => {
  const subject = `Property Visit Scheduled - ${property.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Property Visit Scheduled</h2>
      <p style="color: #666;">
        Your property visit has been scheduled successfully!
      </p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">${property.title}</h3>
        <p style="color: #666; margin: 5px 0;"><strong>Location:</strong> ${property.address}, ${property.city}</p>
        <p style="color: #666; margin: 5px 0;"><strong>Date:</strong> ${new Date(schedule.scheduledDate).toLocaleDateString()}</p>
        <p style="color: #666; margin: 5px 0;"><strong>Time:</strong> ${schedule.scheduledTime}</p>
      </div>
      <p style="color: #666;">
        The property owner will confirm your visit shortly. You will receive a notification once confirmed.
      </p>
      <div style="margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://estate-frontend-62p7.onrender.com'}/schedules" 
           style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View My Schedules
        </a>
      </div>
    </div>
  `;
  
  return await sendEmail(user.email, subject, html);
};

// Schedule status update email
const sendScheduleStatusEmail = async (user, property, schedule, status) => {
  const statusMessages = {
    confirmed: 'Your property visit has been confirmed!',
    rejected: 'Unfortunately, your property visit request has been declined.',
    cancelled: 'Your property visit has been cancelled.'
  };

  const subject = `Property Visit ${status.charAt(0).toUpperCase() + status.slice(1)} - ${property.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Schedule Update</h2>
      <p style="color: #666;">
        ${statusMessages[status] || 'Your schedule status has been updated.'}
      </p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">${property.title}</h3>
        <p style="color: #666; margin: 5px 0;"><strong>Location:</strong> ${property.address}, ${property.city}</p>
        <p style="color: #666; margin: 5px 0;"><strong>Date:</strong> ${new Date(schedule.scheduledDate).toLocaleDateString()}</p>
        <p style="color: #666; margin: 5px 0;"><strong>Time:</strong> ${schedule.scheduledTime}</p>
        <p style="color: #666; margin: 5px 0;"><strong>Status:</strong> <span style="color: ${status === 'confirmed' ? '#4CAF50' : '#f44336'}; font-weight: bold;">${status.toUpperCase()}</span></p>
      </div>
      <div style="margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://estate-frontend-62p7.onrender.com'}/schedules" 
           style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View My Schedules
        </a>
      </div>
    </div>
  `;
  
  return await sendEmail(user.email, subject, html);
};

// Contact form submission notification
const sendContactFormEmail = async (contactData) => {
  const subject = 'New Contact Form Submission';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Contact Form Submission</h2>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="color: #666; margin: 5px 0;"><strong>Name:</strong> ${contactData.name}</p>
        <p style="color: #666; margin: 5px 0;"><strong>Email:</strong> ${contactData.email}</p>
        <p style="color: #666; margin: 5px 0;"><strong>Phone:</strong> ${contactData.phone}</p>
        <p style="color: #666; margin: 5px 0;"><strong>Subject:</strong> ${contactData.subject || 'N/A'}</p>
      </div>
      <h3 style="color: #333;">Message:</h3>
      <p style="color: #666; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50;">
        ${contactData.message}
      </p>
    </div>
  `;
  
  // Send to admin email
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  return await sendEmail(adminEmail, subject, html);
};

// Password reset email (if you implement this feature)
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'https://estate-frontend-62p7.onrender.com'}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p style="color: #666;">
        You requested to reset your password. Click the button below to reset it:
      </p>
      <div style="margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #666;">
        This link will expire in 1 hour.
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        If you didn't request this, please ignore this email.
      </p>
    </div>
  `;
  
  return await sendEmail(user.email, subject, html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPropertyInquiryEmail,
  sendScheduleConfirmationEmail,
  sendScheduleStatusEmail,
  sendContactFormEmail,
  sendPasswordResetEmail
};