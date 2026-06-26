const models = require("../../models");
const { withChatLock } = require("../lib/chat-lock");
const { isToday } = require("../lib/date");

const handleFagCommand = async (chatId, user, bot) => {
  try {
    // Критическая секция под блокировкой по чату: проверяем, не выбран ли
    // пидор уже сегодня, и если нет — атомарно выбираем и фиксируем.
    const result = await withChatLock(chatId, async (transaction) => {
      const dailyFag = await models.Daily.findOne({
        where: { chatId, role: "fag" },
        transaction,
      });

      if (dailyFag && isToday(dailyFag.updatedAt)) {
        return { status: "already", userId: dailyFag.userId };
      }

      // Активные кандидаты на роль "fag"
      let stats = await models.Statistics.findAll({
        where: { chatId, role: "fag", isActive: true },
        transaction,
      });

      if (stats.length === 0) {
        return { status: "empty" };
      }

      // Исключаем красавчика дня, если он уже выбран сегодня
      const dailyKrasava = await models.Daily.findOne({
        where: { chatId, role: "krasava" },
        transaction,
      });

      if (dailyKrasava && isToday(dailyKrasava.updatedAt)) {
        stats = stats.filter((el) => el.userId !== dailyKrasava.userId);
      }

      if (stats.length === 0) {
        return { status: "empty_after_filter" };
      }

      // Выбираем случайного кандидата и увеличиваем его счётчик
      const chosen = stats[Math.floor(Math.random() * stats.length)];
      await chosen.increment({ score: 1 }, { transaction });

      // Фиксируем выбор дня
      await models.Daily.upsert(
        { userId: chosen.userId, chatId, role: "fag", updatedAt: new Date() },
        { transaction }
      );

      return { status: "chosen", userId: chosen.userId };
    });

    // --- Дальше работа с Telegram, уже вне транзакции и блокировки ---

    if (result.status === "empty") {
      await bot.sendMessage(
        chatId,
        "В этом чате пока нет пользователей для выбора."
      );
      return;
    }

    if (result.status === "empty_after_filter") {
      await bot.sendMessage(
        chatId,
        "Некого выбрать: единственный активный игрок уже красавчик дня."
      );
      return;
    }

    const dbUser = await models.User.findOne({
      where: { telegramId: result.userId },
    });
    const username = dbUser.username ? `(@${dbUser.username})` : "";

    if (result.status === "already") {
      await bot.sendMessage(
        chatId,
        `Сегодня 🌈ПИДОР дня - ${dbUser.firstName} ${username}`
      );
      return;
    }

    const pidorMessages = [
      "ХУЙ 🚀",
      "ПИЗДА 🥟",
      "ВЫБИРАЕМ 🎲",
      "ПИДОРА 🌈",
      "ДНЯ 🌞",
      `Сегодня 🌈ПИДОР дня - ${dbUser.firstName} ${username}`,
    ];

    for (const message of pidorMessages) {
      await bot.sendMessage(chatId, message);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error("Ошибка при обработке /pidor:", error);
    await bot.sendMessage(chatId, "Произошла ошибка при выборе пидора дня.");
  }
};

module.exports = { handleFagCommand };
