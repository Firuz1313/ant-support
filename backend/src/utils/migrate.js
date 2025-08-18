<<<<<<< HEAD
import { runMigrations, testConnection, createDatabase } from "./database.js";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    console.log("🚀 Starting database migration process...");

    // Test connection first
    console.log("📡 Testing database connection...");
    const connectionResult = await testConnection();

    if (!connectionResult.success) {
      console.error("❌ Database connection failed:", connectionResult.error);
      process.exit(1);
    }

    console.log("✅ Database connection successful");
    console.log(`🕐 Server time: ${connectionResult.serverTime}`);
    console.log(
      `📋 PostgreSQL version: ${connectionResult.version.split(" ")[0]}`,
    );

    // Run migrations
    console.log("🔄 Running database migrations...");
    await runMigrations();

    console.log("🎉 Migration process completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
=======
#!/usr/bin/env node

import {
  runMigrations,
  createDatabase,
  testConnection,
  closePool,
} from "./database.js";

/**
 * Migration runner script
 *
 * Usage:
 *   npm run db:migrate
 *
 * This script will:
 * 1. Validate database connection
 * 2. Create database if it doesn't exist
 * 3. Run all pending migrations
 */
async function runMigrationScript() {
  console.log("🔄 Starting database migration process...");

  try {
    // 1. Test database connection
    console.log("📊 Testing database connection...");
    await testConnection();

    // 2. Create database if needed
    console.log("📊 Ensuring database exists...");
    await createDatabase();

    // 3. Run migrations
    console.log("📊 Running migrations...");
    await runMigrations();

    console.log("✅ Migration process completed successfully!");
  } catch (error) {
    console.error("❌ FATAL: Migration process failed");
    console.error("❌ Error:", error.message);

    if (error.code === "ECONNREFUSED") {
      console.error("❌ PostgreSQL is not running or connection refused");
      console.error("❌ Please check:");
      console.error("   - PostgreSQL service is running");
      console.error("   - Connection parameters in .env file");
      console.error("   - Network connectivity");
    } else if (error.message.includes("password authentication failed")) {
      console.error("❌ Authentication failed");
      console.error("❌ Please check DB_USER and DB_PASSWORD in .env file");
    } else if (
      error.message.includes("database") &&
      error.message.includes("does not exist")
    ) {
      console.error("❌ Database does not exist");
      console.error(
        "❌ Create database manually or check DB_NAME in .env file",
      );
    }

    process.exit(1);
  } finally {
    // Clean up connections
    await closePool();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrationScript();
}

export default runMigrationScript;
>>>>>>> refs/remotes/origin/main
