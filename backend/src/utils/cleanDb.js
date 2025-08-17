import { query, testConnection } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('🧹 Starting database cleanup process...');
    
    // Test connection first
    console.log('📡 Testing database connection...');
    const connectionResult = await testConnection();
    
    if (!connectionResult.success) {
      console.error('❌ Database connection failed:', connectionResult.error);
      process.exit(1);
    }
    
    console.log('✅ Database connection successful');
    
    // List existing tables
    console.log('📋 Checking existing tables...');
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('📊 Found existing tables:', tablesResult.rows.map(r => r.table_name).join(', '));
      
      // Drop all tables
      console.log('🗑️  Dropping existing tables...');
      for (const row of tablesResult.rows) {
        const tableName = row.table_name;
        if (tableName !== 'migrations') { // Keep migrations table
          console.log(`   Dropping table: ${tableName}`);
          await query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
        }
      }
      
      console.log('✅ All tables dropped successfully');
    } else {
      console.log('📋 No existing tables found');
    }
    
    // Clean migrations table
    console.log('🧹 Cleaning migrations table...');
    await query('DELETE FROM migrations WHERE filename LIKE \'001_%\';');
    
    console.log('🎉 Database cleanup completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
