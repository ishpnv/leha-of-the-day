'use strict';

// Модели объявляют User.telegramId / Chat.telegramId как unique (и логический
// первичный ключ для ассоциаций), но в БД этих ограничений не было.
// Добавляем NOT NULL + unique, чтобы схема соответствовала моделям и не было
// риска дублей при гонке в findOrCreate.
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'telegramId', {
      type: Sequelize.BIGINT,
      allowNull: false,
    });
    await queryInterface.addConstraint('Users', {
      fields: ['telegramId'],
      type: 'unique',
      name: 'unique_users_telegramId',
    });

    await queryInterface.changeColumn('Chats', 'telegramId', {
      type: Sequelize.BIGINT,
      allowNull: false,
    });
    await queryInterface.addConstraint('Chats', {
      fields: ['telegramId'],
      type: 'unique',
      name: 'unique_chats_telegramId',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Users', 'unique_users_telegramId');
    await queryInterface.changeColumn('Users', 'telegramId', {
      type: Sequelize.BIGINT,
      allowNull: true,
    });

    await queryInterface.removeConstraint('Chats', 'unique_chats_telegramId');
    await queryInterface.changeColumn('Chats', 'telegramId', {
      type: Sequelize.BIGINT,
      allowNull: true,
    });
  },
};
