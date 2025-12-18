const express = require('express');
const router = express.Router();
const {
  getBrokers,
  getBrokerById,
  createBroker
} = require('../controllers/brokerController');
const { protect } = require('../middleware/auth');

router.get('/', getBrokers);
router.get('/:id', getBrokerById);
router.post('/', protect, createBroker);

module.exports = router;