const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        process: "readonly",
        console: "readonly",
        module: "writable",
        exports: "writable",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        Promise: "readonly",
        Intl: "readonly",
      },
    },
    rules: {
      // Параметры sequelize-cli (Sequelize, models) часто не используются —
      // не репортим неиспользуемые аргументы функций, только локальные переменные.
      "no-unused-vars": ["warn", { args: "none" }],
      "no-console": "off",
    },
  },
];
