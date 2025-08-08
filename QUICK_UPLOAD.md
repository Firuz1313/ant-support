# Быстрая загрузка проекта на GitHub

## Быстрые команды (после установки Git):

```bash
# 1. Настройка Git
git config --global user.name "Firuz1313"
git config --global user.email "your-email@example.com"

# 2. Инициализация и загрузка
git init
git add .
git commit -m "Initial commit: Complete ant-support project"
git remote add origin https://github.com/Firuz1313/ant-support.git
git branch -M main
git push -u origin main
```

## Что будет загружено:

✅ **Backend** - Node.js/Express сервер с API
✅ **Frontend** - React/TypeScript приложение  
✅ **Database** - SQLite с миграциями
✅ **Documentation** - README и инструкции
✅ **Configuration** - Все конфигурационные файлы

## Структура проекта:
- `backend/` - Серверная часть
- `frontend/` - Клиентская часть  
- `README.md` - Документация
- `.gitignore` - Исключения Git
- `netlify.toml` - Конфигурация деплоя

## После загрузки:
1. Проверьте: https://github.com/Firuz1313/ant-support
2. Убедитесь, что все файлы загружены
3. README.md должен отображаться на главной странице

## Если Git не установлен:
1. Скачайте с: https://git-scm.com/download/win
2. Установите и перезапустите PowerShell
3. Выполните команды выше 