// migrations/XXXXXXXXXXXXXX-add-unique-constraint-to-dailies.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Добавляем уникальное ограничение на поля 'chatId' и 'role'
    await queryInterface.addConstraint('Dailies', {
      fields: ['chatId', 'role'],
      type: 'unique',
      name: 'unique_chatId_role_in_dailies'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Удаляем уникальное ограничение
    await queryInterface.removeConstraint('Dailies', 'unique_chatId_role_in_dailies');
  }
};
