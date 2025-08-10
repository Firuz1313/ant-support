import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Загрузка переменных окружения в первую очередь
dotenv.config();

// СТРОГАЯ ВАЛИДАЦИЯ .env НА СТАРТЕ - все ключи обязательны
function validateEnvironment() {
  const required = [
    'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_SSL'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ FATAL: Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('❌ Server cannot start without complete PostgreSQL configuration');
    process.exit(1);
  }
  
  console.log('✅ Environment validation passed');
}

// Валидируем окружение перед любыми другими операциями
validateEnvironment();

// ES Modules helper для __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Импорт главного роутера API
import apiRoutes from "./routes/index.js";

// Импорт middleware
import errorHandler from "./middleware/errorHandler.js";
import requestLogger from "./middleware/requestLogger.js";
import validateRequest from "./middleware/validateRequest.js";

// Импорт базы данных для fail-fast инициализации
import { initializeDatabase, testConnection } from "./utils/database.js";

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Trust proxy headers for cloud environments (Fly.io, Docker, etc.)
app.set("trust proxy", true);

// Настройка CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:8080",
    ];

    // В облачной среде разрешаем все origins
    if (
      NODE_ENV === "development" ||
      !origin ||
      origin.includes("fly.dev") ||
      origin.includes("builder.codes") ||
      origin.includes("projects.builder.my") ||
      origin.includes("localhost") ||
      allowedOrigins.indexOf(origin) !== -1
    ) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));

// Безопасность
if (process.env.HELMET_ENABLED !== "false") {
  app.use(
    helmet({
      contentSecurityPolicy: false, // Отключаем для разработки
      crossOriginEmbedderPolicy: false,
    }),
  );
}

// Сжатие
if (process.env.COMPRESSION_ENABLED !== "false") {
  app.use(compression());
}

// Rate limiting - more generous for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 минут
  max:
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) ||
    (NODE_ENV === "development" ? 1000 : 100), // 1000 запросов в dev, 100 в prod
  message: {
    error: "Слишком много запросов с этого IP, попробуйте позже.",
    retryAfter: Math.ceil(
      (parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000,
    ),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Логирование
if (NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Парсинг JSON и URL-encoded данных
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Статические файлы
app.use("/media", express.static(path.join(__dirname, "../uploads")));

// Кастомный middleware для логирования запросов
app.use(requestLogger);

// Дополнительное логирование для отладки
app.use((req, res, next) => {
  console.log(`���� [${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(`🔍 Headers:`, JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`🔍 Body:`, JSON.stringify(req.body, null, 2));
  }
  next();
});

// Health check endpoints
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || "1.0.0",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Database health check - строгий тест с SELECT 1
app.get("/health/db", async (req, res) => {
  const startTime = Date.now();

  try {
    // Выполняем SELECT 1 для проверки соединения
    const { query } = await import("./utils/database.js");
    await query("SELECT 1 as test");
    
    const latencyMs = Date.now() - startTime;

    res.json({
      status: "ok",
      latencyMs,
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        test: "SELECT 1 successful"
      }
    });
  } catch (error) {
    const latencyMs = Date.now() - startTime;

    // В fail-fast режиме возвращаем ошибку, но не падаем
    res.status(503).json({
      status: "fail",
      latencyMs,
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error.message,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME
      }
    });
  }
});

// API routes
app.use("/api", apiRoutes);

// 404 handler для API роутов
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint не найден",
    message: `Маршрут ${req.method} ${req.path} не существует`,
    availableEndpoints: "/api/v1",
  });
});

// Обработка ошибок
app.use(errorHandler);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("📄 Получен сигнал SIGTERM. Изящное завершение работы...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("📄 Получен сигнал SIGINT. Изящное завершение работы...");
  process.exit(0);
});

// FAIL-FAST инициализация базы данных перед запуском сервера
async function startServer() {
  try {
    console.log("🔄 Starting server with FAIL-FAST PostgreSQL validation...");
    
    // Обязательная проверка подключения к БД перед стартом
    await initializeDatabase();
    
    // Запуск сервера только после успешного подключения к БД
    app.listen(PORT, "0.0.0.0", () => {
      console.log("🚀 ANT Support API Server started successfully!");
      console.log(`📍 Server running on 0.0.0.0:${PORT}`);
      console.log(`🌐 API available at: http://0.0.0.0:${PORT}/api/v1`);
      console.log(`🌐 API also available at: http://127.0.0.1:${PORT}/api/v1`);
      console.log(`🏥 Health check: http://127.0.0.1:${PORT}/health`);
      console.log(`🏥 DB Health check: http://127.0.0.1:${PORT}/health/db`);
      console.log(`📝 Environment: ${NODE_ENV}`);
      console.log(`📊 Database: PostgreSQL ONLY (no fallbacks)`);

      if (NODE_ENV === "development") {
        console.log(
          "🔧 Development mode - CORS enabled for localhost and cloud environments",
        );
        console.log("📁 Static files served from: /media");
        console.log(
          "🔄 Vite proxy should forward /api/* requests from port 8080 to port 3000",
        );
      }
    });
    
  } catch (error) {
    console.error("❌ FATAL: Server startup failed due to database error");
    console.error("❌ Error:", error.message);
    console.error("❌ Ensure PostgreSQL is running and properly configured");
    process.exit(1); // FAIL-FAST: прекращаем работу при ошибке БД
  }
}

// Запуск сервера с проверкой БД
startServer();

export default app;
