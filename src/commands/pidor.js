const models = require("../../models");

const handleFagCommand = async (chatId, user, bot) => {
  try {
    // Проверяем, выбран ли пидор дня сегодня
    const dailyFag = await models.Daily.findOne({
      where: { chatId, role: "fag" },
    });

    if (dailyFag) {
      const lastUpdate = new Date(dailyFag.updatedAt);
      const isSameDay = lastUpdate.toDateString() === new Date().toDateString();

      if (isSameDay) {
        // Уже выбран сегодня
        const user = await models.User.findOne({
          where: { telegramId: dailyFag.userId },
        });
        const message = `Сегодня 🌈ПИДОР дня - ${user.firstName} ${
          user.username ? `(@${user.username})` : ""
        })`;
        await bot.sendMessage(chatId, message);
        return;
      }
    }

    // Получаем список зарегистрированных пользователей
    let stats = await models.Statistics.findAll({
      where: {
        chatId: chatId,
        role: "fag",
        isActive: true, // Учитываем только активных пользователей
      },
    });

    if (stats.length === 0) {
      await bot.sendMessage(
        chatId,
        "В этом чате пока нет пользователей для выбора."
      );
      return;
    }

    // Исключаем "красавчика дня" из списка кандидатов, если он уже выбран сегодня
    const dailyKrasava = await models.Daily.findOne({
      where: { chatId, role: "krasava" },
    });

    let krasavaSelectedToday = false;
    let krasavaUserId = null;

    if (dailyKrasava) {
      const lastUpdate = new Date(dailyKrasava.updatedAt);
      const isSameDay = lastUpdate.toDateString() === new Date().toDateString();

      if (isSameDay) {
        krasavaSelectedToday = true;
        krasavaUserId = dailyKrasava.userId;
      }
    }

    if (krasavaSelectedToday) {
      stats = stats.filter((el) => el.userId !== krasavaUserId);
    }

    // Выбираем случайного пользователя
    let faggotOfTheDay = stats[Math.floor(Math.random() * stats.length)];

    // Проверяем, есть ли уже запись в Statistics для данного пользователя, чата и роли "fag"
    let fagStat = await models.Statistics.findOne({
      where: {
        userId: faggotOfTheDay.userId,
        chatId,
        role: "fag",
      },
    });

    if (!fagStat) {
      // Создаем новую запись Statistics для роли "fag"
      fagStat = await models.Statistics.create({
        userId: faggotOfTheDay.userId,
        chatId,
        role: "fag",
        score: 1,
      });
    } else {
      // Увеличиваем счетчик
      await fagStat.increment({ score: 1 });
    }

    // Обновляем или создаем запись в таблице Daily
    await models.Daily.upsert({
      userId: faggotOfTheDay.userId,
      chatId,
      role: "fag",
      updatedAt: new Date(),
    });

    // Отправляем сообщение в чат
    const user2 = await models.User.findOne({
      where: { telegramId: faggotOfTheDay.userId },
    });

    const pidorMessages = [
      "ХУЙ 🚀",
      "ПИЗДА 🥟",
      "ВЫБИРАЕМ 🎲",
      "ПИДОРА 🌈",
      "ДНЯ 🌞",
      `Сегодня 🌈ПИДОР дня - ${user2.firstName} (@${user2.username || ""})`,
    ];

    const sendMessagesWithDelay = async () => {
      for (const message of pidorMessages) {
        await bot.sendMessage(chatId, message);
        // Задержка перед отправкой следующего сообщения
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1.5 секунды
      }
    };

    sendMessagesWithDelay();
  } catch (error) {
    console.error("Ошибка при обработке /pidor:", error);
    await bot.sendMessage(chatId, "Произошла ошибка при выборе пидора дня.");
  }
};

module.exports = { handleFagCommand };
