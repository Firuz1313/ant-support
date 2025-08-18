import pkg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES Modules helper
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загрузка переменных окружения
dotenv.config();

const { Pool, Client } = pkg;

// Configuration with fallbacks for local development
const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      maxUses: 7500,
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || "ant_support",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "password",
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
      max: 20,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      maxUses: 7500,
    };

console.log("🔧 PostgreSQL Configuration:");
console.log(`📊 Host: ${dbConfig.host}:${dbConfig.port}`);
console.log(`📊 Database: ${dbConfig.database}`);
console.log(`📊 User: ${dbConfig.user}`);
console.log(`📊 SSL: ${dbConfig.ssl ? "enabled" : "disabled"}`);

// Создание pool соединений
const pool = new Pool(dbConfig);

// Обработка событий pool
pool.on("connect", (client) => {
  console.log("📊 PostgreSQL connected successfully");
});

pool.on("error", (err, client) => {
  console.error("📊 PostgreSQL pool error:", err.message);
});

// Функция проверки подключения к базе данных
export async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      "SELECT NOW() as current_time, version() as postgres_version",
    );

    console.log("✅ PostgreSQL connection successful");
    console.log(`🕐 Server time: ${result.rows[0].current_time}`);
    console.log(
      `📋 PostgreSQL version: ${result.rows[0].postgres_version.split(" ")[0]}`,
    );

    return {
      success: true,
      serverTime: result.rows[0].current_time,
      version: result.rows[0].postgres_version,
    };
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error.message);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Функция выполнения запроса
export async function query(text, params = []) {
  const start = Date.now();
  let client;

  try {
    client = await pool.connect();

    if (process.env.DEBUG_SQL === "true") {
      console.log("🔍 SQL Query:", text);
      console.log("🔍 Parameters:", params);
    }

    const result = await client.query(text, params);
    const duration = Date.now() - start;

    if (process.env.DEBUG_SQL === "true") {
      console.log(`⏱️  Query completed in ${duration}ms`);
      console.log(`📊 Rows affected: ${result.rowCount}`);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`❌ SQL Error after ${duration}ms:`, error.message);
    console.error("🔍 Query:", text);
    console.error("🔍 Parameters:", params);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Функция выполнения транзакции
export async function transaction(callback) {
  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    try {
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Функция создания базы данных (если не существует)
export async function createDatabase() {
  if (process.env.DATABASE_URL) {
    // For cloud databases (like Neon), database already exists
    console.log("📊 Using existing cloud database");
    return true;
  }

  const adminConfig = {
    ...dbConfig,
    database: "postgres", // подключаемся к системной БД для создания новой
  };

  let client;

  try {
    client = new Client(adminConfig);
    await client.connect();

    // Проверяем, существует ли база данных
    const checkResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbConfig.database],
    );

    if (checkResult.rows.length === 0) {
      console.log(`📊 Creating database: ${dbConfig.database}`);
      await client.query(`CREATE DATABASE "${dbConfig.database}"`);
      console.log("✅ Database created successfully");
    } else {
      console.log(`📊 Database ${dbConfig.database} already exists`);
    }
  } catch (error) {
    console.error("❌ Error creating database:", error.message);
    throw error;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

// Функция выполнения миграций
export async function runMigrations() {
  try {
    console.log("🔄 Running database migrations...");

    // Создаем таблицу для отслеживания миграций
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Получаем список выполненных миграций
    const executedResult = await query(
      "SELECT filename FROM migrations ORDER BY id",
    );
    const executedMigrations = new Set(
      executedResult.rows.map((row) => row.filename),
    );

    // Читаем файлы миграций
    const migrationsDir = path.join(__dirname, "migrations");

    // Проверяем существование папки миграций
    if (!fs.existsSync(migrationsDir)) {
      console.log("📁 Migrations directory not found, creating empty");
      return;
    }

    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".js"))
      .sort();

    console.log(`📁 Found ${migrationFiles.length} migration files`);

    for (const filename of migrationFiles) {
      if (executedMigrations.has(filename)) {
        console.log(`⏭️  Migration ${filename} already executed, skipping`);
        continue;
      }

      console.log(`🔄 Executing migration: ${filename}`);

      const migrationPath = path.join(migrationsDir, filename);
      const migration = await import(migrationPath);

      await transaction(async (client) => {
        // Execute the migration
        await migration.default(client);

        // Record in migrations table
        await client.query("INSERT INTO migrations (filename) VALUES ($1)", [
          filename,
        ]);
      });

      console.log(`✅ Migration ${filename} executed successfully`);
    }

    console.log("🎉 All migrations executed successfully");
  } catch (error) {
    console.error("❌ Error executing migrations:", error.message);
    throw error;
  }
}

// Функция получения статистики базы данных
export async function getDatabaseStats() {
  try {
    const stats = await query(`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_rows,
        n_dead_tup as dead_rows
      FROM pg_stat_user_tables 
      ORDER BY n_live_tup DESC
    `);

    const dbSize = await query(
      `
      SELECT pg_size_pretty(pg_database_size($1)) as size
    `,
      [dbConfig.database],
    );

    return {
      tables: stats.rows,
      databaseSize: dbSize.rows[0].size,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Error getting database stats:", error.message);
    throw error;
  }
}

// Функция безопасного закрытия всех соединений
export async function closePool() {
  try {
    console.log("🔄 Closing PostgreSQL connection pool...");
    await pool.end();
    console.log("✅ Connection pool closed");
  } catch (error) {
    console.error("❌ Error closing pool:", error.message);
  }
}

// Экспорт pool для прямого использования в случае необходимости
export { pool };

export default {
  query,
  transaction,
  testConnection,
  createDatabase,
  runMigrations,
  getDatabaseStats,
  closePool,
  pool,
};
