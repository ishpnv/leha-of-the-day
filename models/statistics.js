'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Statistics extends Model {
    static associate(models) {
      Statistics.belongsTo(models.User, { foreignKey: 'userId' });
      Statistics.belongsTo(models.Chat, { foreignKey: 'chatId' });
    }
  }
  Statistics.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique:true,
        allowNull: false,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'telegramId',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      chatId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'Chats',
          key: 'telegramId',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // По умолчанию пользователь активен
      },
    },
    {
      sequelize,
      modelName: 'Statistics',
      tableName: 'Statistics',
      timestamps: true,
    }
  );
  return Statistics;
};
