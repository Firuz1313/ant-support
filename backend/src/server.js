import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 3000;

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

const pool = new Pool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW() as current_time, version() as postgres_version");
    console.log("✅ Neon database connected successfully");
    console.log(`🕐 Server time: ${result.rows[0].current_time}`);
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Database health check
app.get("/api/health/db", async (req, res) => {
  const startTime = Date.now();
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW() as server_time");
    const latencyMs = Date.now() - startTime;
    client.release();
    
    res.json({
      status: "ok",
      latencyMs,
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        serverTime: result.rows[0].server_time,
      },
    });
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    res.status(503).json({
      status: "fail",
      latencyMs,
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error.message,
      },
    });
  }
});

// Basic health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Devices endpoints
app.get("/api/v1/devices", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM devices ORDER BY order_index ASC");
    client.release();
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rowCount,
      message: "Devices retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.json({
      success: true,
      data: [],
      total: 0,
      message: "Devices table not found - using empty data",
    });
  }
});

app.get("/api/v1/devices/stats", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true) as active,
        COUNT(*) FILTER (WHERE is_active = false) as inactive
      FROM devices
    `);
    client.release();
    
    res.json({
      success: true,
      data: result.rows[0],
      message: "Device stats retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching device stats:", error);
    res.json({
      success: true,
      data: { total: 0, active: 0, inactive: 0 },
      message: "Device stats not available",
    });
  }
});

// Problems endpoints
app.get("/api/v1/problems", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM problems ORDER BY created_at DESC");
    client.release();
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rowCount,
      message: "Problems retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching problems:", error);
    res.json({
      success: true,
      data: [],
      total: 0,
      message: "Problems table not found - using empty data",
    });
  }
});

app.get("/api/v1/problems/stats", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true) as active,
        COUNT(*) FILTER (WHERE is_active = false) as inactive,
        COUNT(*) FILTER (WHERE status = 'published') as published,
        COUNT(*) FILTER (WHERE status = 'draft') as draft
      FROM problems
    `);
    client.release();
    
    res.json({
      success: true,
      data: result.rows[0],
      message: "Problem stats retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching problem stats:", error);
    res.json({
      success: true,
      data: { total: 0, active: 0, inactive: 0, published: 0, draft: 0 },
      message: "Problem stats not available",
    });
  }
});

// Steps endpoints
app.get("/api/v1/steps", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM diagnostic_steps ORDER BY step_number ASC");
    client.release();
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rowCount,
      message: "Steps retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching steps:", error);
    res.json({
      success: true,
      data: [],
      total: 0,
      message: "Steps table not found - using empty data",
    });
  }
});

app.get("/api/v1/steps/stats", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true) as active,
        COUNT(*) FILTER (WHERE is_active = false) as inactive
      FROM diagnostic_steps
    `);
    client.release();
    
    res.json({
      success: true,
      data: result.rows[0],
      message: "Step stats retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching step stats:", error);
    res.json({
      success: true,
      data: { total: 0, active: 0, inactive: 0 },
      message: "Step stats not available",
    });
  }
});

// Sessions endpoints
app.get("/api/v1/sessions", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM diagnostic_sessions ORDER BY created_at DESC");
    client.release();
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rowCount,
      message: "Sessions retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.json({
      success: true,
      data: [],
      total: 0,
      message: "Sessions table not found - using empty data",
    });
  }
});

app.get("/api/v1/sessions/active", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT * FROM diagnostic_sessions 
      WHERE is_active = true AND end_time IS NULL 
      ORDER BY created_at DESC
    `);
    client.release();
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rowCount,
      message: "Active sessions retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching active sessions:", error);
    res.json({
      success: true,
      data: [],
      total: 0,
      message: "Active sessions not available",
    });
  }
});

app.get("/api/v1/sessions/stats", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true) as active,
        COUNT(*) FILTER (WHERE is_active = false) as inactive,
        COUNT(*) FILTER (WHERE success = true) as successful,
        COUNT(*) FILTER (WHERE success = false) as failed
      FROM diagnostic_sessions
    `);
    client.release();
    
    res.json({
      success: true,
      data: result.rows[0],
      message: "Session stats retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching session stats:", error);
    res.json({
      success: true,
      data: { total: 0, active: 0, inactive: 0, successful: 0, failed: 0 },
      message: "Session stats not available",
    });
  }
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
app.listen(PORT, async () => {
  console.log(`🚀 ANT Support Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 API base: http://localhost:${PORT}/api/v1`);
  console.log(`🗄️  Database check: http://localhost:${PORT}/api/health/db`);
  
  // Test database connection on startup
  const connected = await testConnection();
  if (!connected) {
    console.log("⚠️  Server started but database connection failed");
  }
});

export default app;
