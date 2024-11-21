'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Statistics', {
      fields: ['userId', 'chatId', 'role'],
      type: 'unique',
      name: 'unique_user_chat_role'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Statistics', 'unique_user_chat_role');
  }
};
