// migrations/XXXXXXXXXXXXXX-update-daily-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Удаляем поле 'id' из таблицы 'Daily'
    await queryInterface.removeColumn('Dailies', 'id');

    // Добавляем составной первичный ключ
    await queryInterface.changeColumn('Dailies', 'chatId', {
      type: Sequelize.BIGINT,
      allowNull: false,
      primaryKey: true,
    });

    await queryInterface.changeColumn('Dailies', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    });

    // Убеждаемся, что 'userId' настроен правильно
    await queryInterface.changeColumn('Dailies', 'userId', {
      type: Sequelize.BIGINT,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Добавляем поле 'id' обратно
    await queryInterface.addColumn('Dailies', 'id', {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    });

    // Убираем первичные ключи с 'chatId' и 'role'
    await queryInterface.changeColumn('Dailies', 'chatId', {
      type: Sequelize.BIGINT,
      allowNull: false,
      primaryKey: false,
    });

    await queryInterface.changeColumn('Dailies', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: false,
    });
  },
};
