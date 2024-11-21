'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    static associate(models) {
      Chat.belongsToMany(models.User, { through: models.Statistics, foreignKey: 'chatId' });
    }
  }
  Chat.init(
    {
      telegramId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
      },
      chatType: DataTypes.STRING(20),
      chatTitle: DataTypes.STRING(100),
    },
    {
      sequelize,
      modelName: 'Chat',
    }
  );
  return Chat;
};
