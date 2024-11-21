// src/commands/stats.js
const models = require("../../models");

const handleStatsCommand = async (chatId, bot) => {
  try {
    // Получаем статистику для "Красавчика дня"
    const krasavaStats = await models.Statistics.findAll({
      where: {
        chatId: chatId,
        role: "krasava",
      },
      include: [
        {
          model: models.User,
          attributes: ["firstName", "username"],
        },
      ],
      order: [["score", "DESC"]],
    });

    // Получаем статистику для "Пидора дня"
    const fagStats = await models.Statistics.findAll({
      where: {
        chatId: chatId,
        role: "fag",
      },
      include: [
        {
          model: models.User,
          attributes: ["firstName", "username"],
        },
      ],
      order: [["score", "DESC"]],
    });

    let message = "";

    // Формируем сообщение для "Красавчика дня"
    message += "Результаты 🌈ПИДОР Дня\n";
    // Формируем сообщение для "Пидора дня"
    if (fagStats.length > 0) {
      fagStats.forEach((stat, index) => {
        const user = stat.User;
        const username = user.username ? `(@${user.username})` : "";
        message += `${index + 1}) ${user.firstName} ${username} - ${stat.score} раз(а)\n`;
      });
    } else {
      message += "Нет данных.\n";
    }

    message += "\n🎉 Результаты Красавчик Дня\n";
    if (krasavaStats.length > 0) {
      krasavaStats.forEach((stat, index) => {
        const user = stat.User;
        const username = user.username ? `(@${user.username})` : "";
        message += `${index + 1}) ${user.firstName} ${username} - ${stat.score} раз(а)\n`;
      });
    } else {
      message += "Нет данных.\n";
    }


    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error("Ошибка при обработке /stats:", error);
    await bot.sendMessage(
      chatId,
      "Произошла ошибка при получении статистики."
    );
  }
};

module.exports = { handleStatsCommand };
