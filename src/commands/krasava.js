const models = require("../../models");

const handleKrasavaCommand = async (chatId, user, bot) => {
  try {
    // Проверяем, выбран ли пидор дня сегодня
    const dailyFag = await models.Daily.findOne({
      where: { chatId, role: "fag" },
    });

    let fagSelectedToday = false;

    if (dailyFag) {
      const lastUpdate = new Date(dailyFag.updatedAt);
      const isSameDay = lastUpdate.toDateString() === new Date().toDateString();

      if (isSameDay) {
        fagSelectedToday = true;
      }
    }

    // Проверяем, выбран ли уже красавчик дня сегодня
    const dailyKrasava = await models.Daily.findOne({
      where: { chatId, role: "krasava" },
    });

    if (dailyKrasava) {
      const lastUpdate = new Date(dailyKrasava.updatedAt);
      const isSameDay = lastUpdate.toDateString() === new Date().toDateString();

      if (isSameDay) {
        const user = await models.User.findOne({
          where: { telegramId: dailyKrasava.userId },
        });
        const message = `Сегодня 🎉красавчик дня - ${user.firstName} (@${
          user.username || ""
        })`;
        await bot.sendMessage(chatId, message);
        return;
      }
    }

    // Получаем список зарегистрированных пользователей
    let stats = await models.Statistics.findAll({
      where: {
        chatId: chatId,
        role: "krasava",
        isActive: true, // Учитываем только активных пользователей
      },
    });

    if (stats.length === 0) {
      await bot.sendMessage(chatId, "Пока никто не зарегистрировался.");
      return;
    }

    if (!fagSelectedToday) {
      const message = "Сначала выбери пидора дня, ссыкло ебаное";
      await bot.sendMessage(chatId, message);
      return;
    }

    // Исключаем пидора дня из списка кандидатов
    stats = stats.filter((el) => el.userId !== dailyFag.userId);

    // Выбираем случайного пользователя
    let krasavaOfTheDay = stats[Math.floor(Math.random() * stats.length)];

    // Проверяем, есть ли уже запись в Statistics для данного пользователя, чата и роли "krasava"
    let krasavaStat = await models.Statistics.findOne({
      where: {
        userId: krasavaOfTheDay.userId,
        chatId,
        role: "krasava",
      },
    });

    if (!krasavaStat) {
      // Создаем новую запись Statistics для роли "krasava"
      krasavaStat = await models.Statistics.create({
        userId: krasavaOfTheDay.userId,
        chatId,
        role: "krasava",
        score: 1,
      });
    } else {
      // Увеличиваем счетчик
      await krasavaStat.increment({ score: 1 });
    }

    // Обновляем или создаем запись в таблице Daily
    await models.Daily.upsert({
      userId: krasavaOfTheDay.userId,
      chatId,
      role: "krasava",
      updatedAt: new Date(),
    });

    // Отправляем сообщение в чат
    const user2 = await models.User.findOne({
      where: { telegramId: krasavaOfTheDay.userId },
    });

    const krasavaMessages = [
      "*МУЗЫКА ИЗ ПОЛЕ ЧУДЕС* 🎹",
      "КРУТИТЕ БАРАБАН 🛞",
      "СЕКТОР КРАСАВЧИК НА БАРАБАНЕ 👨",
      "ПРИЗ - ААААААВТОМОБИЛЬ 🏎️",
      `Сегодня 🎉красавчик дня - ${user2.firstName} (@${
        user2.username || ""
      })`,
    ];

    const sendMessagesWithDelay = async () => {
      for (const message of krasavaMessages) {
        await bot.sendMessage(chatId, message);
        // Задержка перед отправкой следующего сообщения
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1.5 секунды
      }
    };

    sendMessagesWithDelay();
  } catch (error) {
    console.error("Ошибка при обработке /krasava:", error);
    await bot.sendMessage(
      chatId,
      "Произошла ошибка при выборе пользователя дня."
    );
  }
};

module.exports = { handleKrasavaCommand };
