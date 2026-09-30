const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

// Security middleware
app.use(helmet());

// Allow frontend to communicate with backend
app.use(cors());

// Read JSON data from requests
app.use(express.json());

// Show HTTP requests in terminal
app.use(morgan("dev"));

// Basic health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Optimized Retail Inventory API is running",
  });
});

module.exports = app;