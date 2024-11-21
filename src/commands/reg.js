// src/commands/reg.js
const models = require("../../models");

const handleRegCommand = async (chatId, user, chatType, bot) => {
  try {
    // Находим или создаём пользователя
    const [dbUser] = await models.User.findOrCreate({
      where: { telegramId: user.id },
      defaults: {
        username: user.username || "",
        firstName: user.first_name || "",
        lastName: user.last_name || "",
      },
    });

    // Находим или создаём чат
    await models.Chat.findOrCreate({
      where: { telegramId: chatId },
      defaults: {
        chatType: chatType,
        chatTitle: user.first_name,
      },
    });

    // Находим статистику пользователя в этом чате
    const [statFag, createdFag] = await models.Statistics.findOrCreate({
      where: {
        userId: user.id,
        chatId,
        role: "fag",
      },
      defaults: {
        score: 0,
        isActive: true,
      },
    });

    const [statKrasava, createdKrasava] = await models.Statistics.findOrCreate({
      where: {
        userId: user.id,
        chatId,
        role: "krasava",
      },
      defaults: {
        score: 0,
        isActive: true,
      },
    });

    // Если пользователь уже есть, но неактивен, активируем его
    if (!createdFag && !statFag.isActive) {
      await statFag.update({ isActive: true });
    }

    if (!createdKrasava && !statKrasava.isActive) {
      await statKrasava.update({ isActive: true });
    }

    await bot.sendMessage(chatId, `Привет, ${user.first_name}! Ты в игре.`);
  } catch (error) {
    console.error("Ошибка при обработке /reg:", error);
    await bot.sendMessage(
      chatId,
      "Произошла ошибка при обработке команды /reg."
    );
  }
};

module.exports = { handleRegCommand };
