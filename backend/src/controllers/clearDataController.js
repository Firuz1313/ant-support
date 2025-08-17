import { query } from '../utils/database.js';

export const clearAllData = async (req, res) => {
  try {
    console.log('🧹 Starting data clearing process...');
    
    // Temporarily disable foreign key checks
    await query('SET session_replication_role = replica;');
    
    // Clear in order of dependencies (using TRUNCATE for speed)
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
    
    const results = [];
    for (const clearQuery of clearQueries) {
      try {
        console.log(`   Executing: ${clearQuery}`);
        await query(clearQuery);
        const tableName = clearQuery.match(/TRUNCATE TABLE (\w+)/)[1];
        results.push(`${tableName}: cleared`);
        console.log(`   ✅ Table ${tableName} cleared`);
      } catch (error) {
        console.log(`   ⚠️ Table may not exist: ${error.message}`);
        results.push(`Table may not exist: ${error.message}`);
      }
    }
    
    // Re-enable foreign key checks
    await query('SET session_replication_role = DEFAULT;');
    
    // Verify tables are empty
    const tablesToCheck = ['devices', 'problems', 'diagnostic_steps', 'diagnostic_sessions', 'tv_interfaces', 'tv_interface_marks'];
    const rowCounts = {};
    
    for (const tableName of tablesToCheck) {
      try {
        const result = await query(`SELECT COUNT(*) as count FROM ${tableName}`);
        rowCounts[tableName] = parseInt(result.rows[0].count);
      } catch (error) {
        rowCounts[tableName] = 'N/A';
      }
    }
    
    console.log('🎉 Database clearing completed successfully!');
    
    res.json({
      success: true,
      data: {
        clearedTables: results,
        rowCounts: rowCounts,
        isEmpty: Object.values(rowCounts).every(count => count === 0 || count === 'N/A')
      },
      message: 'All data cleared from database successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Data clearing failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear database data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

export default { clearAllData };
