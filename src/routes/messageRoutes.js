const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// All message routes require authentication
router.use(protect);

// FIXED: Add /send endpoint for frontend compatibility
router.post('/send', messageController.sendMessage);
router.post('/', messageController.sendMessage);  // Keep original too

// Get all conversations for logged-in user
router.get('/conversations', messageController.getConversations);

// Get unread message count
router.get('/unread-count', messageController.getUnreadCount);

// Get messages between logged-in user and another user
router.get('/user/:otherUserId', messageController.getMessagesBetweenUsers);

// Get all messages for a specific property
router.get('/property/:propertyId', messageController.getPropertyMessages);

// Mark a specific message as read
router.patch('/:id/read', messageController.markAsRead);

// Mark all messages from a specific sender as read
router.patch('/read-all/:senderId', messageController.markAllAsRead);

// Delete a message
router.delete('/:id', messageController.deleteMessage);

module.exports = router;