# leha-of-the-day

Telegram-бот «Пидор / Красавчик дня» для групповых чатов. Раз в день выбирает
случайного участника на каждую роль и ведёт статистику побед.

## Стек

- Node.js + [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) (long polling)
- PostgreSQL + Sequelize (ORM + миграции)
- Express — простой healthcheck-эндпоинт `GET /` (нужен для хостингов вроде Render)

## Команды бота

| Команда     | Что делает                              |
| ----------- | --------------------------------------- |
| `/reg`      | Зарегистрироваться в игре               |
| `/delete`   | Выйти из игры (деактивировать профиль)   |
| `/pidor`    | Выбрать пидора дня                       |
| `/krasava`  | Выбрать красавчика дня (после пидора)    |
| `/stats`    | Посмотреть статистику чата               |

## Запуск локально

1. Установить зависимости:
   ```bash
   npm install
   ```
2. Поднять PostgreSQL и создать БД (значения по умолчанию см. в [.env.example](.env.example)).
3. Скопировать `.env.example` в `.env` и заполнить `BOT_TOKEN` и параметры БД:
   ```bash
   cp .env.example .env
   ```
4. Применить миграции:
   ```bash
   npx sequelize-cli db:migrate
   ```
5. Запустить в режиме разработки (с автоперезапуском):
   ```bash
   npm run dev
   ```

## Запуск в production

```bash
npm start
```

Скрипт `start` сначала прогоняет миграции (`sequelize-cli db:migrate`), затем
запускает бота. Переменные окружения берутся из окружения процесса.

> ⚠️ Перед первым применением миграции `…-add-unique-constraint-to-telegramid`
> на проде с данными убедитесь, что нет дублей `telegramId`:
> ```sql
> SELECT "telegramId", count(*) FROM "Users" GROUP BY 1 HAVING count(*) > 1;
> SELECT "telegramId", count(*) FROM "Chats" GROUP BY 1 HAVING count(*) > 1;
> ```

## Переменные окружения

См. [.env.example](.env.example).

## Структура

```
index.js              — точка входа
src/bot.js            — инициализация бота и роутинг команд
src/commands/         — обработчики команд
src/lib/              — общие утилиты (блокировка по чату, работа с датами)
models/               — модели Sequelize
migrations/           — миграции БД
config/config.js      — конфигурация подключения к БД по окружениям
```
