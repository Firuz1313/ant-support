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
