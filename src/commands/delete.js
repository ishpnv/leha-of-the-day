// src/commands/delete.js
const models = require("../../models");

const handleDeleteCommand = async (chatId, user, bot) => {
  try {
    // Находим статистику пользователя в этом чате
    const stats = await models.Statistics.findAll({
      where: {
        userId: user.id,
        chatId,
      },
    });

    if (stats.length === 0) {
      await bot.sendMessage(
        chatId,
        `${user.first_name}, ты не зарегистрирован в игре.`
      );
      return;
    }

    // Деактивируем пользователя для всех ролей в этом чате
    await models.Statistics.update(
      { isActive: false },
      {
        where: {
          userId: user.id,
          chatId,
        },
      }
    );

    await bot.sendMessage(
      chatId,
      `${user.first_name}, ты ссыкло!`
    );
  } catch (error) {
    console.error("Ошибка при обработке /delete:", error);
    await bot.sendMessage(
      chatId,
      "Произошла ошибка при обработке команды /delete."
    );
  }
};

module.exports = { handleDeleteCommand };
