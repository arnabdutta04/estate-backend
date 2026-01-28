const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All schedule routes require authentication
router.use(authMiddleware);

// Create a new schedule (for users/buyers)
router.post('/', scheduleController.createSchedule);

// Get all schedules for logged-in user
router.get('/my-schedules', scheduleController.getUserSchedules);

// Get all schedules for broker's properties
router.get('/broker-schedules', roleMiddleware(['broker', 'admin']), scheduleController.getBrokerSchedules);

// Get a single schedule by ID
router.get('/:id', scheduleController.getScheduleById);

// Update schedule status (broker/admin can accept/reject)
router.patch('/:id/status', roleMiddleware(['broker', 'admin']), scheduleController.updateScheduleStatus);

// Cancel schedule (user cancels their own schedule)
router.patch('/:id/cancel', scheduleController.cancelSchedule);

// Delete schedule
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;