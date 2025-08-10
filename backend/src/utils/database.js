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

// Конфигурация подключения к PostgreSQL - только real DB
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,

  // Настройки pool соединений
  max: 20, // максимальное количество соединений в pool
  min: 5, // минимальное количество соединений
  idleTimeoutMillis: 30000, // время простоя перед закрытием соединения
  connectionTimeoutMillis: 5000, // таймаут подключения
  maxUses: 7500, // максимальное количество использований соединения
};

console.log("🔧 PostgreSQL Configuration:");
console.log(`📊 Host: ${dbConfig.host}:${dbConfig.port}`);
console.log(`📊 Database: ${dbConfig.database}`);
console.log(`📊 User: ${dbConfig.user}`);
console.log(`📊 SSL: ${dbConfig.ssl ? "enabled" : "disabled"}`);
console.log(`📊 Pool: ${dbConfig.min}-${dbConfig.max} connections`);
console.log(`📊 PostgreSQL only mode - no mock database`);

// Создание pool соединений
const pool = new Pool(dbConfig);

// Обработка событий pool
pool.on("connect", (client) => {
  console.log("📊 Новое подключение к PostgreSQL установлено");
});

pool.on("error", (err, client) => {
  console.error("📊 Ошибка подключения к PostgreSQL:", err.message);
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

// Функция проверки подключения к базе данных
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
    console.error("❌ Ошибка подключения к PostgreSQL:", error.message);
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

// Функция выполнения запроса с логированием
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
    console.error("❌ Ошибка создания базы данных:", error.message);
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

    // Получаем список выполненных миграций
    const executedResult = await query(
      "SELECT filename FROM migrations ORDER BY id",
    );
    const executedMigrations = new Set(
      executedResult.rows.map((row) => row.filename),
    );

    // Читаем файлы миграций
    const migrationsDir = path.join(__dirname, "../../migrations");
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

      console.log(`🔄 Выполнение мигр��ции: ${filename}`);

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
    console.error("❌ Ошибка выполнения миграций:", error.message);
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
    console.error("❌ Ошибка получения статистики БД:", error.message);
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
