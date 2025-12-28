const express = require("express");
const router = express.Router();

const {
  getBrokers,
  getBrokerById,
  createBroker,
} = require("../controllers/brokerController");

const { protect, authorize } = require("../middleware/auth");
router.get(
  "/",
  protect,
  authorize("BROKER"),
  getBrokers
);


// Public routes
router.get("/", getBrokers);
router.get("/:id", getBrokerById);

// Private route
router.post("/", protect, createBroker);

module.exports = router;
