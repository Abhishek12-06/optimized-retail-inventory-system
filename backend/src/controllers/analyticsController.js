
const Product = require("../models/product");
const StockMovement = require("../models/StockMovement");

// Get inventory and stock analytics
const getInventoryAnalytics = async (req, res) => {
  try {
    // Overall inventory statistics
    const inventoryStats = await Product.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$quantity" },
          inventoryValue: {
            $sum: {
              $multiply: ["$price", "$quantity"],
            },
          },
        },
      },
    ]);

    // Low-stock product count
    const lowStockCount = await Product.countDocuments({
      isActive: true,
      $expr: {
        $lte: ["$quantity", "$reorderLevel"],
      },
    });

    // Stock IN and OUT statistics
    const movementStats = await StockMovement.aggregate([
      {
        $group: {
          _id: "$type",
          totalQuantity: { $sum: "$quantity" },
          totalMovements: { $sum: 1 },
        },
      },
    ]);

    const stockIn = movementStats.find(
      (item) => item._id === "IN"
    ) || { totalQuantity: 0, totalMovements: 0 };

    const stockOut = movementStats.find(
      (item) => item._id === "OUT"
    ) || { totalQuantity: 0, totalMovements: 0 };

    // Category-wise inventory
    const categoryStats = await Product.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $group: {
          _id: "$category",
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$quantity" },
          inventoryValue: {
            $sum: {
              $multiply: ["$price", "$quantity"],
            },
          },
        },
      },
      {
        $sort: { totalProducts: -1 },
      },
    ]);

    // Latest stock movements
    const recentMovements = await StockMovement.find()
      .populate("product", "name sku")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      data: {
        inventory: {
          totalProducts: inventoryStats[0]?.totalProducts || 0,
          totalStock: inventoryStats[0]?.totalStock || 0,
          inventoryValue: inventoryStats[0]?.inventoryValue || 0,
          lowStockProducts: lowStockCount,
        },
        stockMovements: {
          stockInQuantity: stockIn.totalQuantity,
          stockOutQuantity: stockOut.totalQuantity,
          stockInTransactions: stockIn.totalMovements,
          stockOutTransactions: stockOut.totalMovements,
        },
        categoryStats,
        recentMovements,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate inventory analytics.",
    });
  }
};

module.exports = {
  getInventoryAnalytics,
};
