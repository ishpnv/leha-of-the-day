// migrations/XXXXXXXXXXXXXX-add-isActive-to-statistics.js
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Statistics", "isActive", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Statistics", "isActive");
  },
};
