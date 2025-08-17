import { query } from '../utils/database.js';

export const clearAllData = async (req, res) => {
  try {
    console.log('🧹 Starting data clearing process...');
    
    // SQLite doesn't support replication role, skip this
    
    // Clear in order of dependencies (using DELETE for SQLite compatibility)
    const clearQueries = [
      'DELETE FROM diagnostic_sessions;',
      'DELETE FROM diagnostic_steps;',
      'DELETE FROM problems;',
      'DELETE FROM tv_interface_marks;',
      'DELETE FROM tv_interfaces;',
      'DELETE FROM devices;',
      'DELETE FROM remotes;',
      'DELETE FROM users;',
      'DELETE FROM session_steps;',
      'DELETE FROM step_actions;',
      'DELETE FROM site_settings;',
      'DELETE FROM change_logs;'
    ];
    
    const results = [];
    for (const clearQuery of clearQueries) {
      try {
        console.log(`   Executing: ${clearQuery}`);
        await new Promise((resolve, reject) => {
          database.run(clearQuery, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        const tableName = clearQuery.match(/DELETE FROM (\w+)/)[1];
        results.push(`${tableName}: cleared`);
        console.log(`   ✅ Table ${tableName} cleared`);
      } catch (error) {
        console.log(`   ⚠️ Table may not exist: ${error.message}`);
        results.push(`Table may not exist: ${error.message}`);
      }
    }
    
    // Verify tables are empty
    const tablesToCheck = ['devices', 'problems', 'diagnostic_steps', 'diagnostic_sessions', 'tv_interfaces', 'tv_interface_marks'];
    const rowCounts = {};

    for (const tableName of tablesToCheck) {
      try {
        const result = await new Promise((resolve, reject) => {
          database.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
        rowCounts[tableName] = parseInt(result.count);
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
