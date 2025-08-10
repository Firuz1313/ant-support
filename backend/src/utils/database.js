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

// Strict .env validation - все ключи обязательны
function validateRequiredEnvVars() {
  const required = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_SSL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ FATAL: Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('❌ Server cannot start without PostgreSQL configuration');
    process.exit(1);
  }
}

// Validate environment on module load
validateRequiredEnvVars();

// Конфигурация подключения к PostgreSQL - ТОЛЬКО real DB, никаких fallback
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,

  // Настройки pool соединений
  max: 20, // максимальное количество соединений в pool
  min: 5, // минимальное количество соединений
  idleTimeoutMillis: 30000, // время простоя перед закрытием соединения
  connectionTimeoutMillis: 5000, // таймаут подключения
  maxUses: 7500, // максимальное количество использований соединения
};

console.log("🔧 PostgreSQL Configuration (STRICT MODE - NO FALLBACKS):");
console.log(`📊 Host: ${dbConfig.host}:${dbConfig.port}`);
console.log(`📊 Database: ${dbConfig.database}`);
console.log(`📊 User: ${dbConfig.user}`);
console.log(`📊 SSL: ${dbConfig.ssl ? "enabled" : "disabled"}`);
console.log(`📊 Pool: ${dbConfig.min}-${dbConfig.max} connections`);
console.log(`📊 FAIL-FAST MODE: Server will terminate if DB unavailable`);

// Создание pool соединений
const pool = new Pool(dbConfig);

// Обработка событий pool
pool.on("connect", (client) => {
  console.log(`📊 DB connected: host=${dbConfig.host} db=${dbConfig.database} pool=active`);
});

pool.on("error", (err, client) => {
  console.error("📊 FATAL PostgreSQL pool error:", err.message);
  console.error("📊 Server will terminate due to database failure");
  process.exit(1); // FAIL-FAST при ошибках pool
});

pool.on("acquire", (client) => {
  if (process.env.DEBUG_SQL === "true") {
    console.log("📊 Клиент получен из pool");
  }
});

pool.on("release", (client) => {
  if (process.env.DEBUG_SQL === "true") {
    console.log("📊 Клиент возвращен в pool");
  }
});

// Функция проверки подключения к базе данных с fail-fast
export async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      "SELECT NOW() as current_time, version() as postgres_version",
    );

    console.log("✅ Подключение к PostgreSQL успешно");
    console.log(`🕐 Время сервера: ${result.rows[0].current_time}`);
    console.log(
      `📋 Версия PostgreSQL: ${result.rows[0].postgres_version.split(" ")[0]}`,
    );

    return {
      success: true,
      serverTime: result.rows[0].current_time,
      version: result.rows[0].postgres_version,
    };
  } catch (error) {
    console.error("❌ FATAL: PostgreSQL connection failed:", error.message);
    throw error; // FAIL-FAST: пробрасываем ошибку дальше
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Функция выполнения запроса БЕЗ FALLBACK - fail-fast при ошибках
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
    console.error(`❌ FATAL SQL Error after ${duration}ms:`, error.message);
    console.error("🔍 Query:", text);
    console.error("🔍 Parameters:", params);
    
    // FAIL-FAST: Никаких fallback, сразу пробрасываем ошибку
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
      console.log(`📊 Создание базы данных: ${dbConfig.database}`);
      await client.query(`CREATE DATABASE "${dbConfig.database}"`);
      console.log("✅ База данных создана успешно");
    } else {
      console.log(`📊 База данных ${dbConfig.database} уже существует`);
    }
  } catch (error) {
    console.error("❌ FATAL: Ошибка создания базы данных:", error.message);
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
    console.log("🔄 Запуск миграций базы данных...");

    // Создаем таблицу для отслеживания миграций
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // По��учаем список выполненных миграций
    const executedResult = await query(
      "SELECT filename FROM migrations ORDER BY id",
    );
    const executedMigrations = new Set(
      executedResult.rows.map((row) => row.filename),
    );

    // Читаем файлы миграций
    const migrationsDir = path.join(__dirname, "../../migrations");
    
    // Проверяем существование папки миграций
    if (!fs.existsSync(migrationsDir)) {
      console.log("📁 Папка миграций не найдена, создаём пустую");
      return;
    }
    
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    console.log(`📁 Найдено ${migrationFiles.length} файлов миграций`);

    for (const filename of migrationFiles) {
      if (executedMigrations.has(filename)) {
        console.log(`⏭️  Миграция ${filename} уже выполнена, пропускаем`);
        continue;
      }

      console.log(`🔄 Выполнение миграции: ${filename}`);

      const migrationPath = path.join(migrationsDir, filename);
      const migrationSQL = fs.readFileSync(migrationPath, "utf8");

      await transaction(async (client) => {
        // Выполняем миграцию
        await client.query(migrationSQL);

        // Записываем в таблицу миграций
        await client.query("INSERT INTO migrations (filename) VALUES ($1)", [
          filename,
        ]);
      });

      console.log(`✅ Миграция ${filename} выполнена успешно`);
    }

    console.log("🎉 Все миграции выполнены успешно");
  } catch (error) {
    console.error("❌ FATAL: Ошибка выполнения миграций:", error.message);
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
    console.error("❌ FATAL: Ошибка получения статистики БД:", error.message);
    throw error;
  }
}

// Функция безопасного закрытия всех соединений
export async function closePool() {
  try {
    console.log("🔄 Закрытие пула соединений PostgreSQL...");
    await pool.end();
    console.log("✅ Пул соединений закрыт");
  } catch (error) {
    console.error("❌ Ошибка закрытия пула:", error.message);
  }
}

// Fail-fast initialization test
export async function initializeDatabase() {
  try {
    console.log("🔄 Initializing database connection...");
    await testConnection();
    console.log("✅ Database initialization successful");
  } catch (error) {
    console.error("❌ FATAL: Database initialization failed");
    console.error("❌ Server cannot start without database connection");
    process.exit(1);
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
  initializeDatabase,
  pool,
};
