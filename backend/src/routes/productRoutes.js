
const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} = require("../controllers/productController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Get low-stock products
router.get(
  "/low-stock",
  authorize("admin", "manager", "staff"),
  getLowStockProducts
);

// Product CRUD routes
router.get("/", getProducts);

router.get("/:id", getProductById);

router.post(
  "/",
  authorize("admin", "manager"),
  createProduct
);

router.put(
  "/:id",
  authorize("admin", "manager"),
  updateProduct
);

router.delete(
  "/:id",
  authorize("admin"),
  deleteProduct
);

module.exports = router;
