const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Optimized Retail Inventory API is running",
  });
});

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;