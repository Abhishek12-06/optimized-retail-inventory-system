
const express = require("express");
const router = express.Router();

const {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, authorize("admin", "manager", "staff"), getSuppliers);
router.get("/:id", protect, authorize("admin", "manager", "staff"), getSupplierById);

router.post("/", protect, authorize("admin", "manager"), createSupplier);
router.put("/:id", protect, authorize("admin", "manager"), updateSupplier);
router.delete("/:id", protect, authorize("admin"), deleteSupplier);

module.exports = router;
