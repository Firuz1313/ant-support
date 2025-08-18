import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const { Client } = pkg;

async function initializeDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Connecting to Neon database...');
    await client.connect();
    console.log('✅ Connected to Neon database');

    console.log('🔄 Reading database schema...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'database-init.sql'), 'utf8');

    console.log('🔄 Executing database initialization...');
    await client.query(schemaSQL);
    console.log('✅ Database schema created successfully');

    // Check what was created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('📊 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Check sample data
    const devicesResult = await client.query('SELECT COUNT(*) as count FROM devices');
    const problemsResult = await client.query('SELECT COUNT(*) as count FROM problems');
    const stepsResult = await client.query('SELECT COUNT(*) as count FROM diagnostic_steps');

    console.log('📊 Sample data:');
    console.log(`  - Devices: ${devicesResult.rows[0].count}`);
    console.log(`  - Problems: ${problemsResult.rows[0].count}`);
    console.log(`  - Steps: ${stepsResult.rows[0].count}`);

    console.log('🎉 Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

// Run initialization
initializeDatabase()
  .then(() => {
    console.log('✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  });
