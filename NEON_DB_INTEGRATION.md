# Интеграция с Neon Database

В проекте Email Bot в качестве основной базы данных используется **Neon Database** (Serverless PostgreSQL). Ниже приведено руководство по настройке и описанию архитектуры взаимодействия с БД.

## 1. Настройка подключения

Подключение к базе данных настраивается через переменную окружения `DATABASE_URL` в файле `.env`.

### Пример конфигурации (на основе server/env_temp.txt):
```env
DATABASE_URL="postgresql://neondb_owner:ВАШ_ПАРОЛЬ@ep-shiny-boat-a9b5yzc7-pooler.gwc.azure.neon.tech/neondb?sslmode=require"
```
*Примечание: В файле `env_temp.txt` пароль заменен на `PASSWORD_REMOVED` в целях безопасности. При настройке используйте реальный пароль из консоли Neon.*

### Конфигурация в коде ([server/db.js](file:///k:/email_bot/server/db.js)):
Используется стандартный драйвер `pg` с пулом соединений (`Pool`). Обязательным требованием Neon является использование SSL:
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true // Для безопасного соединения с Neon
  }
});
```

## 2. Сервисы взаимодействия с БД (server/services)

Все бизнес-логика работы с данными вынесена в папку `server/services`. Основные сервисы:

- **[ContactService](file:///k:/email_bot/server/services/contacts.js)**:
  - `getAll()`: Получение всех контактов, отсортированных по дате создания.
  - `create()`: Создание одного контакта.
  - `bulkCreate()`: Массовый импорт контактов. Использует конструкцию `INSERT ... ON CONFLICT (email) DO UPDATE` для обновления существующих записей, что оптимизирует производительность при импорте CSV.
  - `delete()`: Удаление контакта по UUID.

- **[InboxService](file:///k:/email_bot/server/services/inbox.js)**:
  - `getDrafts()`: Получение всех сообщений со статусом `draft` с объединением (`JOIN`) таблицы контактов.
  - `getHistory(contactId)`: Получение истории переписки с конкретным контактом.
  - `simulateIncoming()`: Многошаговый процесс: сохранение входящего сообщения, получение истории, генерация черновика ответа через AI и сохранение черновика в БД.
  - `approveDraft()`: Обновление статуса сообщения на `sent` и роли на `assistant`.
  - `rejectDraft()`: Удаление черновика.

- **[TemplateService](file:///k:/email_bot/server/services/templates.js)**:
  - Реализует стандартные CRUD операции для шаблонов писем (таблица `templates`).

- **[CampaignService](file:///k:/email_bot/server/services/campaigns.js)**:
  - `sendCampaign()`: Выполняет рассылку. Для каждого контакта создает запись в `messages` и обновляет `last_contacted` в `contacts`.

## 3. Вспомогательные средства и инициализация

### Инициализация БД
Для создания структуры таблиц используется скрипт **[server/init-db.js](file:///k:/email_bot/server/init-db.js)**, который выполняет SQL-команды из **[server/schema.sql](file:///k:/email_bot/server/schema.sql)**.

### Схема данных (Schema)
Основные таблицы:
1. `contacts`: Хранение информации о клиентах (компания, email, статус).
2. `messages`: История сообщений и черновики (связь с `contacts.id`).
3. `templates`: Шаблоны писем.

Используется расширение `uuid-ossp` для генерации UUID первичных ключей.

### Middleware и валидация
- **[Validation Middleware](file:///k:/email_bot/server/middleware/validation.js)**: Проверяет входящие данные перед запросом к БД.
- **[Zod Schemas](file:///k:/email_bot/server/schemas/index.js)**: Описывают структуру данных (например, `contactSchema`), гарантируя корректность типов (email, UUID и др.).

## 4. Примеры использования в маршрутах (server/routes)

Маршруты используют сервисы и оборачиваются в `asyncHandler` для централизованной обработки ошибок.

Пример из **[server/routes/contacts.js](file:///k:/email_bot/server/routes/contacts.js)**:
```javascript
router.get('/', asyncHandler(async (req, res) => {
  const contacts = await ContactService.getAll();
  res.json(contacts);
}));
```

## 5. Параметры конфигурации .env

Для работы с базой данных в `.env` файле должны быть установлены:
- `DATABASE_URL`: Полная строка подключения к Neon (с паролем и параметрами SSL).
- `PORT`: Порт сервера (по умолчанию 3001).

## 6. Особенности работы с Neon (PostgreSQL)

1. **UUID**: Все первичные ключи имеют тип `UUID`. Это упрощает интеграцию и исключает перебор ID.
2. **Типы данных**: Используется `TIMESTAMP WITH TIME ZONE` для корректной работы со временем в распределенных системах.
3. **CamelCase**: Поскольку PostgreSQL использует snake_case для колонок, сервисы выполняют маппинг данных в camelCase (`company_name` -> `companyName`) для удобства фронтенда.
4. **Производительность**: Созданы индексы для часто используемых полей (`status`, `created_at`, `contact_id`) для ускорения выборок.
