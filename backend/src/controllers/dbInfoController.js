import { query } from '../utils/database.js';

export const getDatabaseInfo = async (req, res) => {
  try {
    console.log('🔍 Getting database structure info...');
    
    // Get all tables
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    // Get foreign keys
    const fksResult = await query(`
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
    
    // Get row counts for main tables
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
    
    res.json({
      success: true,
      data: {
        tables: tablesResult.rows.map(r => r.table_name),
        foreignKeys: fksResult.rows,
        rowCounts: rowCounts,
        isEmpty: Object.values(rowCounts).every(count => count === 0 || count === 'N/A')
      },
      message: 'Database structure information retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error getting database info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve database information',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

export default { getDatabaseInfo };
