const models = require("../../models");
const { withChatLock } = require("../lib/chat-lock");
const { isToday } = require("../lib/date");

const handleKrasavaCommand = async (chatId, user, bot) => {
  try {
    // Критическая секция под блокировкой по чату
    const result = await withChatLock(chatId, async (transaction) => {
      // Красавчика можно выбирать только после пидора дня
      const dailyFag = await models.Daily.findOne({
        where: { chatId, role: "fag" },
        transaction,
      });
      const fagSelectedToday = dailyFag && isToday(dailyFag.updatedAt);

      const dailyKrasava = await models.Daily.findOne({
        where: { chatId, role: "krasava" },
        transaction,
      });

      if (dailyKrasava && isToday(dailyKrasava.updatedAt)) {
        return { status: "already", userId: dailyKrasava.userId };
      }

      // Активные кандидаты на роль "krasava"
      let stats = await models.Statistics.findAll({
        where: { chatId, role: "krasava", isActive: true },
        transaction,
      });

      if (stats.length === 0) {
        return { status: "empty" };
      }

      if (!fagSelectedToday) {
        return { status: "no_fag" };
      }

      // Исключаем пидора дня из кандидатов
      stats = stats.filter((el) => el.userId !== dailyFag.userId);

      if (stats.length === 0) {
        return { status: "empty_after_filter" };
      }

      // Выбираем случайного кандидата и увеличиваем его счётчик
      const chosen = stats[Math.floor(Math.random() * stats.length)];
      await chosen.increment({ score: 1 }, { transaction });

      // Фиксируем выбор дня
      await models.Daily.upsert(
        { userId: chosen.userId, chatId, role: "krasava", updatedAt: new Date() },
        { transaction }
      );

      return { status: "chosen", userId: chosen.userId };
    });

    // --- Дальше работа с Telegram, уже вне транзакции и блокировки ---

    if (result.status === "empty") {
      await bot.sendMessage(chatId, "Пока никто не зарегистрировался.");
      return;
    }

    if (result.status === "no_fag") {
      await bot.sendMessage(chatId, "Сначала выбери пидора дня, ссыкло ебаное");
      return;
    }

    if (result.status === "empty_after_filter") {
      await bot.sendMessage(
        chatId,
        "Некого выбрать: единственный активный игрок уже пидор дня."
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
        `Сегодня 🎉красавчик дня - ${dbUser.firstName} ${username}`
      );
      return;
    }

    const krasavaMessages = [
      "*МУЗЫКА ИЗ ПОЛЕ ЧУДЕС* 🎹",
      "КРУТИТЕ БАРАБАН 🛞",
      "СЕКТОР КРАСАВЧИК НА БАРАБАНЕ 👨",
      "ПРИЗ - ААААААВТОМОБИЛЬ 🏎️",
      `Сегодня 🎉красавчик дня - ${dbUser.firstName} ${username}`,
    ];

    for (const message of krasavaMessages) {
      await bot.sendMessage(chatId, message);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error("Ошибка при обработке /krasava:", error);
    await bot.sendMessage(
      chatId,
      "Произошла ошибка при выборе пользователя дня."
    );
  }
};

module.exports = { handleKrasavaCommand };
