const models = require("../../models");

// Сериализует критическую секцию по чату через advisory-блокировку Postgres.
// Блокировка берётся на время транзакции и снимается автоматически при
// commit/rollback. Это защищает от гонки, когда два одновременных /pidor
// (или /pidor и /krasava) в одном чате выбирают разных людей дня.
//
// Ключ блокировки — chatId (BIGINT). Один и тот же ключ для обеих ролей,
// поэтому выборы пидора и красавчика в одном чате не пересекаются.
const withChatLock = (chatId, fn) =>
  models.sequelize.transaction(async (transaction) => {
    await models.sequelize.query("SELECT pg_advisory_xact_lock(:key)", {
      replacements: { key: chatId },
      transaction,
    });
    return fn(transaction);
  });

module.exports = { withChatLock };
