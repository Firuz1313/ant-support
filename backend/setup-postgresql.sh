#!/bin/bash

# PostgreSQL Setup Script for ANT Support Backend
# Этот скрипт поможет настроить PostgreSQL для работы с бэкендом

set -e

echo "🔧 ANT Support Backend - PostgreSQL Setup"
echo "========================================="

# Проверяем наличие psql
if ! command -v psql &> /dev/null; then
    echo "❌ ERROR: PostgreSQL client (psql) не найден"
    echo "Установите PostgreSQL:"
    echo "  Ubuntu/Debian: sudo apt install postgresql postgresql-client"
    echo "  macOS: brew install postgresql"
    echo "  Windows: скачайте с https://www.postgresql.org/download/"
    exit 1
fi

# Читаем переменные из .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "❌ ERROR: .env файл не найден"
    echo "Создайте .env файл с параметрами подключения к PostgreSQL"
    exit 1
fi

# Проверяем обязательные переменные
REQUIRED_VARS=("DB_HOST" "DB_PORT" "DB_NAME" "DB_USER" "DB_PASSWORD")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ ERROR: Переменная $var не определена в .env"
        exit 1
    fi
done

echo "📊 Конфигурация PostgreSQL:"
echo "   Host: $DB_HOST:$DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Функция для выполнения SQL команд
run_sql() {
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "$1"
}

# Проверяем подключение к PostgreSQL
echo "🔄 Проверка подключения к PostgreSQL..."
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1;" &> /dev/null; then
    echo "❌ ERROR: Не удается подключиться к PostgreSQL"
    echo "Проверьте:"
    echo "  - PostgreSQL сервис запущен"
    echo "  - Параметры подключения в .env файле"
    echo "  - Права пользователя $DB_USER"
    exit 1
fi

echo "✅ Подключение к PostgreSQL успешно"

# Создаем базу данных если не существует
echo "🔄 Создание базы данных $DB_NAME..."
DB_EXISTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';" 2>/dev/null || echo "")

if [ -z "$DB_EXISTS" ]; then
    echo "📊 Создаем базу данных $DB_NAME..."
    run_sql "CREATE DATABASE \"$DB_NAME\";"
    echo "✅ База данных $DB_NAME создана"
else
    echo "📊 База данных $DB_NAME уже существует"
fi

# Проверяем подключение к созданной базе
echo "🔄 Проверка подключения к базе данных $DB_NAME..."
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
    echo "❌ ERROR: Не удается подключиться к базе да��ных $DB_NAME"
    exit 1
fi

echo "✅ Подключение к базе данных $DB_NAME успешно"

# Запускаем миграции
echo "🔄 Запуск миграций..."
if npm run db:migrate; then
    echo "✅ Миграции выполнены успешно"
else
    echo "❌ ERROR: Ошибка выполнения миграций"
    exit 1
fi

# Проверяем health check
echo "🔄 Запуск сервера для проверки..."
timeout 30s npm start &
SERVER_PID=$!

sleep 5

# Проверяем health endpoints
echo "🔄 Проверка health endpoints..."
if curl -f http://localhost:3000/health &> /dev/null; then
    echo "✅ /health endpoint работает"
else
    echo "❌ ERROR: /health endpoint недоступен"
fi

if curl -f http://localhost:3000/health/db &> /dev/null; then
    echo "✅ /health/db endpoint работает"
else
    echo "❌ ERROR: /health/db endpoint недоступен"
fi

# Останавливаем сервер
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

echo ""
echo "🎉 PostgreSQL setup completed successfully!"
echo ""
echo "Теперь вы можете:"
echo "  - Запустить сервер: npm start"
echo "  - Заполнить тестовыми данными: npm run db:seed"
echo "  - Проверить health: curl http://localhost:3000/health/db"
echo ""
echo "✅ Система готова к работе в FAIL-FAST режиме"
