import { query, testConnection } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

async function clearAllData() {
  try {
    console.log('🧹 Starting data clearing process...');
    
    // Test connection first
    console.log('📡 Testing database connection...');
    const connectionResult = await testConnection();
    
    if (!connectionResult.success) {
      console.error('❌ Database connection failed:', connectionResult.error);
      process.exit(1);
    }
    
    console.log('✅ Database connection successful');
    
    // Clear data from all tables in correct order (respecting foreign keys)
    console.log('🗑️ Clearing all data from tables...');

    // First disable foreign key checks temporarily
    await query('SET session_replication_role = replica;');

    // Clear in order of dependencies (child tables first)
    const clearQueries = [
      'TRUNCATE TABLE diagnostic_sessions RESTART IDENTITY CASCADE;',
      'TRUNCATE TABLE diagnostic_steps RESTART IDENTITY CASCADE;',
      'TRUNCATE TABLE problems RESTART IDENTITY CASCADE;',
      'TRUNCATE TABLE tv_interface_marks RESTART IDENTITY CASCADE;',
      'TRUNCATE TABLE tv_interfaces RESTART IDENTITY CASCADE;',
      'TRUNCATE TABLE devices RESTART IDENTITY CASCADE;',
      'TRUNCATE TABLE remotes RESTART IDENTITY CASCADE;',
      'TRUNCATE TABLE users RESTART IDENTITY CASCADE;',
      'TRUNCATE TABLE session_steps RESTART IDENTITY CASCADE;',
      'TRUNCATE TABLE step_actions RESTART IDENTITY CASCADE;',
      'TRUNCATE TABLE site_settings RESTART IDENTITY CASCADE;',
      'TRUNCATE TABLE change_logs RESTART IDENTITY CASCADE;'
    ];
    
    for (const clearQuery of clearQueries) {
      console.log(`   Executing: ${clearQuery}`);
      const result = await query(clearQuery);
      console.log(`   ✅ Cleared ${result.rowCount || 0} rows`);
    }
    
    // Reset auto-increment sequences
    console.log('🔄 Resetting auto-increment sequences...');
    const resetQueries = [
      'ALTER SEQUENCE devices_id_seq RESTART WITH 1;',
      'ALTER SEQUENCE problems_id_seq RESTART WITH 1;',
      'ALTER SEQUENCE diagnostic_steps_id_seq RESTART WITH 1;',
      'ALTER SEQUENCE diagnostic_sessions_id_seq RESTART WITH 1;',
      'ALTER SEQUENCE tv_interfaces_id_seq RESTART WITH 1;',
      'ALTER SEQUENCE tv_interface_marks_id_seq RESTART WITH 1;'
    ];
    
    for (const resetQuery of resetQueries) {
      try {
        console.log(`   Executing: ${resetQuery}`);
        await query(resetQuery);
        console.log(`   ✅ Sequence reset`);
      } catch (error) {
        console.log(`   ⚠️ Sequence may not exist: ${error.message}`);
      }
    }
    
    console.log('🎉 Database clearing completed successfully!');
    console.log('📋 All tables are now empty and ready for clean CRUD operations');
    
  } catch (error) {
    console.error('❌ Data clearing failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  clearAllData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default clearAllData;
