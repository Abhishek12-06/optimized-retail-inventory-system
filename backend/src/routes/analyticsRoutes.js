
const express = require("express");

const {
  getInventoryAnalytics,
} = require("../controllers/analyticsController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

// Admin and manager can access analytics
router.get(
  "/",
  authorize("admin", "manager"),
  getInventoryAnalytics
);

module.exports = router;
