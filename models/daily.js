'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Daily extends Model {
    static associate(models) {
      // define association here
    }
  }
  Daily.init(
    {
      chatId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Daily',
      timestamps: true,
    }
  );
  return Daily;
};