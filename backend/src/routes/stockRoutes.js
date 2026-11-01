
const express = require("express");

const {
  createStockMovement,
  getStockMovements,
} = require("../controllers/stockController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all stock routes
router.use(protect);

// Get stock movement history
router.get(
  "/history",
  authorize("admin", "manager", "staff"),
  getStockMovements
);

// Add or remove stock
router.post(
  "/",
  authorize("admin", "manager"),
  createStockMovement
);

module.exports = router;
