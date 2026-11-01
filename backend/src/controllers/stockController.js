
const mongoose = require("mongoose");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");

// Create a stock IN or OUT movement
const createStockMovement = async (req, res) => {
  const { productId, type, quantity, note } = req.body;

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid product ID.",
    });
  }

  if (!["IN", "OUT"].includes(type)) {
    return res.status(400).json({
      success: false,
      message: "Stock type must be IN or OUT.",
    });
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be a positive whole number.",
    });
  }

  const session = await mongoose.startSession();

  try {
    let updatedProduct;
    let movement;

    await session.withTransaction(async () => {
      const product = await Product.findById(productId).session(session);

      if (!product) {
        const error = new Error("Product not found.");
        error.statusCode = 404;
        throw error;
      }

      if (type === "OUT" && product.quantity < quantity) {
        const error = new Error("Insufficient stock available.");
        error.statusCode = 400;
        throw error;
      }

      const change = type === "IN" ? quantity : -quantity;

      updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $inc: { quantity: change } },
        { new: true, runValidators: true, session }
      );

      movement = new StockMovement({
        product: productId,
        type,
        quantity,
        note,
        createdBy: req.user.id,
      });

      await movement.save({ session });
    });

    return res.status(201).json({
      success: true,
      message: `Stock ${type === "IN" ? "added" : "removed"} successfully.`,
      data: {
        movement,
        product: updatedProduct,
      },
    });
  } catch (error) {
    console.error("Stock movement error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to record stock movement.",
    });
  } finally {
    await session.endSession();
  }
};

// Get complete stock movement history
const getStockMovements = async (req, res) => {
  try {
    const movements = await StockMovement.find()
      .populate("product", "name sku")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: movements.length,
      data: movements,
    });
  } catch (error) {
    console.error("Get stock movements error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch stock movement history.",
    });
  }
};

module.exports = {
  createStockMovement,
  getStockMovements,
};
