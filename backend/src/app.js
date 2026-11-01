
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const stockRoutes = require("./routes/stockRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const supplierRoutes = require("./routes/supplierRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Optimized Retail Inventory API is running",
  });
});

// API routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/suppliers", supplierRoutes);

module.exports = app;
