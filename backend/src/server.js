import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.get("/api/v1/devices", (req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Devices endpoint working",
  });
});

app.get("/api/v1/problems", (req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Problems endpoint working",
  });
});

app.get("/api/v1/steps", (req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Steps endpoint working",
  });
});

app.get("/api/v1/sessions", (req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Sessions endpoint working",
  });
});

// Catch all for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ANT Support Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 API base: http://localhost:${PORT}/api/v1`);
});

export default app;
