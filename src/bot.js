// src/bot.js
const TelegramApi = require("node-telegram-bot-api");
const express = require("express");
const models = require("../models");
const token = process.env.BOT_TOKEN;

// Опциональный прокси для выхода к api.telegram.org. Нужен при хостинге в РФ,
// где Telegram заблокирован. Формат TELEGRAM_PROXY:
//   socks5://[user:pass@]host:port  или  http://[user:pass@]host:port
const buildProxyAgent = () => {
  const proxy = process.env.TELEGRAM_PROXY;
  if (!proxy) return undefined;
  if (proxy.startsWith("socks")) {
    const { SocksProxyAgent } = require("socks-proxy-agent");
    return new SocksProxyAgent(proxy);
  }
  const { HttpsProxyAgent } = require("https-proxy-agent");
  return new HttpsProxyAgent(proxy);
};

const proxyAgent = buildProxyAgent();
if (proxyAgent) {
  // Логируем без утечки логина/пароля
  console.log(
    "Telegram через прокси:",
    process.env.TELEGRAM_PROXY.replace(/\/\/[^@]+@/, "//***@")
  );
}

const bot = new TelegramApi(token, {
  polling: true,
  ...(proxyAgent ? { request: { agent: proxyAgent } } : {}),
});

const { handleFagCommand } = require("./commands/pidor");
const { handleRegCommand } = require("./commands/reg");
const { handleKrasavaCommand } = require("./commands/krasava");
const { handleStatsCommand } = require("./commands/stats");
const { handleDeleteCommand } = require("./commands/delete");

// Устанавливаем команды бота
bot.setMyCommands([
  { command: "/reg", description: "Жми, если не ссыкло" },
  { command: "/delete", description: "Жми, если ссыкло" },
  { command: "/pidor", description: "Выбрать пидора дня" },
  { command: "/krasava", description: "Выбрать красавчика дня" },
  { command: "/stats", description: "Посмотреть статистику" },
]);

// Проверяем подключение к БД с ретраями: на старте контейнера/ВМ база может
// быть ещё не готова, не падаем сразу, а ждём.
const connectToDatabase = async (retries = 10, delayMs = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await models.sequelize.authenticate();
      console.log("БД подключена");
      return;
    } catch (error) {
      console.error(
        `Не удалось подключиться к БД (попытка ${attempt}/${retries}): ${error.message}`
      );
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

// Функция для запуска бота
const start = async () => {
  await connectToDatabase();

  // Имя бота нужно получить один раз при старте, а не на каждое сообщение
  const me = await bot.getMe();
  const botUsername = me.username;

  // Таблица команд: имя -> обработчик. Каждый обработчик получает контекст сообщения.
  const commands = {
    "/reg": ({ chatId, user, chatType, chatTitle }) =>
      handleRegCommand(chatId, user, chatType, chatTitle, bot),
    "/stats": ({ chatId }) => handleStatsCommand(chatId, bot),
    "/pidor": ({ chatId, user }) => handleFagCommand(chatId, user, bot),
    "/krasava": ({ chatId, user }) => handleKrasavaCommand(chatId, user, bot),
    "/delete": ({ chatId, user }) => handleDeleteCommand(chatId, user, bot),
  };

  bot.on("message", async (msg) => {
    const text = msg.text;
    // Игнорируем нетекстовые сообщения (фото, стикеры, сервисные события)
    if (!text) return;

    // Поддерживаем как "/pidor", так и "/pidor@botusername" в группах
    const command = text.split("@")[0];
    const handler = commands[command];
    if (!handler) return;

    // Если указан адресат команды, он должен совпадать с именем нашего бота
    const mention = text.includes("@") ? text.split("@")[1] : null;
    if (mention && mention !== botUsername) return;

    try {
      // Для групп есть chat.title, для личных чатов — нет, берём имя собеседника
      const chatTitle =
        msg.chat.title ||
        [msg.from.first_name, msg.from.last_name].filter(Boolean).join(" ") ||
        msg.from.username ||
        "";

      await handler({
        chatId: msg.chat.id,
        user: msg.from,
        chatType: msg.chat.type,
        chatTitle,
      });
    } catch (error) {
      console.error(`Ошибка при обработке команды ${command}:`, error);
    }
  });

  bot.on("polling_error", (error) => {
    console.error("Polling error:", error);
  });
};

const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.send("OK");
});

app.listen(PORT, () => {
  console.log(`PORT = ${PORT}`);
});

// Корректная остановка: останавливаем polling (иначе Telegram вернёт 409
// conflict при следующем запуске) и закрываем соединение с БД.
const stop = async () => {
  console.log("Останавливаю бота...");
  try {
    await bot.stopPolling();
  } catch (error) {
    console.error("Ошибка при остановке polling:", error.message);
  }
  try {
    await models.sequelize.close();
  } catch (error) {
    console.error("Ошибка при закрытии соединения с БД:", error.message);
  }
};

module.exports = { start, stop };
