# Инструкции по загрузке проекта на GitHub

## Шаг 1: Установка Git

### Для Windows:
1. Скачайте Git с официального сайта: https://git-scm.com/download/win
2. Установите Git, следуя инструкциям установщика
3. Перезапустите PowerShell или командную строку

### Альтернативные способы установки:
```powershell
# Через Chocolatey (если установлен)
choco install git

# Через winget (если доступен)
winget install Git.Git
```

## Шаг 2: Настройка Git

После установки Git выполните следующие команды:

```bash
# Настройка имени пользователя
git config --global user.name "Firuz1313"

# Настройка email (замените на ваш email)
git config --global user.email "your-email@example.com"

# Проверка настроек
git config --list
```

## Шаг 3: Инициализация репозитория

В папке проекта выполните:

```bash
# Инициализация Git репозитория
git init

# Добавление всех файлов в staging area
git add .

# Создание первого коммита
git commit -m "Initial commit: Complete ant-support project"

# Добавление удаленного репозитория
git remote add origin https://github.com/Firuz1313/ant-support.git

# Переименование основной ветки в main
git branch -M main

# Отправка кода на GitHub
git push -u origin main
```

## Шаг 4: Альтернативный способ через GitHub CLI

Если у вас установлен GitHub CLI:

```bash
# Установка GitHub CLI (если не установлен)
winget install GitHub.cli

# Авторизация в GitHub
gh auth login

# Создание репозитория и загрузка кода
gh repo create ant-support --public --source=. --remote=origin --push
```

## Шаг 5: Проверка загрузки

После загрузки проверьте:
1. Перейдите на https://github.com/Firuz1313/ant-support
2. Убедитесь, что все файлы загружены
3. Проверьте, что README.md отображается корректно

## Возможные проблемы и решения

### Проблема: "git is not recognized"
**Решение:** Перезапустите PowerShell после установки Git

### Проблема: "Authentication failed"
**Решение:** 
1. Используйте Personal Access Token вместо пароля
2. Или настройте SSH ключи

### Проблема: "Repository not found"
**Решение:** 
1. Убедитесь, что репозиторий создан на GitHub
2. Проверьте правильность URL репозитория

## Структура проекта для загрузки

Проект содержит следующие основные компоненты:

```
ant-support/
├── backend/                 # Backend сервер
│   ├── src/
│   │   ├── controllers/    # Контроллеры API
│   │   ├── models/         # Модели данных
│   │   ├── routes/         # Маршруты API
│   │   └── utils/          # Утилиты
│   ├── migrations/         # Миграции базы данных
│   └── package.json
├── frontend/               # Frontend приложение
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── pages/          # Страницы приложения
│   │   ├── api/            # API клиент
│   │   └── types/          # TypeScript типы
│   └── package.json
├── README.md               # Документация проекта
├── .gitignore             # Исключения Git
└── netlify.toml           # Конфигурация деплоя
```

## Дополнительные команды

### Обновление кода на GitHub:
```bash
git add .
git commit -m "Update: описание изменений"
git push origin main
```

### Проверка статуса:
```bash
git status
git log --oneline
```

### Создание новой ветки:
```bash
git checkout -b feature/new-feature
git push -u origin feature/new-feature
```

## Контакты для поддержки

Если возникнут проблемы с загрузкой, создайте issue в репозитории:
https://github.com/Firuz1313/ant-support/issues 