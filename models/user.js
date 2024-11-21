'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(models.Chat, { through: models.Statistics, foreignKey: 'userId' });
    }
  }
  User.init(
    {
      telegramId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
        primaryKey: true
      },
      username: DataTypes.STRING(50),
      firstName: DataTypes.STRING(100),
      lastName: DataTypes.STRING(100),
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
