// src/bot.js
const TelegramApi = require("node-telegram-bot-api");
const { Sequelize, Op } = require("sequelize");
const token = process.env.BOT_TOKEN;
const bot = new TelegramApi(token, { polling: true });
const models = require("../models");

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

// Функция для запуска бота
const start = () => {
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const user = msg.from;
    const text = msg.text;
    const chatType = msg.chat.type;
    const botName = await bot.getMe();


    // const isBotCommand =  text?.includes('/');

    // // Если сообщение не является командой, игнорируем его
    // if (!isBotCommand) {
    //   return;
    // }

    // const now = new Date();
    // const currentHour = now.getHours();
    // // Проверяем, находится ли время между 0:00 и 12:00
    // if (currentHour >= 0 && currentHour < 19) {
    //   // Отправляем предупреждение и не выполняем команду
    //   await bot.sendMessage(
    //     chatId,
    //     `${user.first_name}, нельзя использовать команды бота с 0:00 до 12:00. Лови банхаммер)))`
    //   );

    //   await bot.restrictChatMember(chatId, user.id, {
    //     permissions: {
    //       can_send_messages: false,
    //       can_send_media_messages: false,
    //       can_send_polls: false,
    //       can_send_other_messages: false,
    //     },
    //   });
    //   return;
    // }

    if (text === "/reg" || text === `/reg@${botName.username}`) {
      await handleRegCommand(chatId, user, chatType, bot);
    } else if (text === "/stats" || text === `/stats@${botName.username}`) {
      await handleStatsCommand(chatId, bot);
    } else if (text === "/pidor" || text === `/pidor@${botName.username}`) {
      await handleFagCommand(chatId, user, bot);
    } else if (text === "/krasava" || text === `/krasava@${botName.username}`) {
      await handleKrasavaCommand(chatId, user, bot);
    } else if (text === "/delete" || text === `/delete@${botName.username}`) {
      await handleDeleteCommand(chatId, user, bot);
    } else {
      return;
    }
  });

  bot.on("polling_error", (error) => {
    console.error("Polling error:", error);
  });
};

module.exports = { start };
