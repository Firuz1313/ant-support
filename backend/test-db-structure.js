import { query } from "./src/utils/database.js";

async function checkDatabaseStructure() {
  try {
    console.log("🔍 Checking database structure and foreign keys...\n");

    // Check tables
    console.log("📋 Tables in database:");
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    for (const table of tables.rows) {
      console.log(`   - ${table.table_name}`);
    }

    // Check foreign keys
    console.log("\n🔗 Foreign Key constraints:");
    const fks = await query(`
      SELECT 
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          tc.constraint_name
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      ORDER BY tc.table_name, kcu.column_name
    `);

    for (const fk of fks.rows) {
      console.log(
        `   ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`,
      );
    }

    // Check if tables are empty
    console.log("\n📊 Table row counts:");
    const tablesToCheck = [
      "devices",
      "problems",
      "diagnostic_steps",
      "diagnostic_sessions",
      "tv_interfaces",
      "tv_interface_marks",
    ];

    for (const tableName of tablesToCheck) {
      try {
        const result = await query(
          `SELECT COUNT(*) as count FROM ${tableName}`,
        );
        console.log(`   ${tableName}: ${result.rows[0].count} rows`);
      } catch (error) {
        console.log(`   ${tableName}: Table may not exist`);
      }
    }

    console.log("\n✅ Database structure check completed!");
  } catch (error) {
    console.error("❌ Error checking database structure:", error);
  }
}

checkDatabaseStructure();
