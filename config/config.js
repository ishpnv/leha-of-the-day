require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'telegram_user',
    password: process.env.DB_PASSWORD || 'telegram_pass',
    database: process.env.DB_NAME || 'telegram_db',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
  },
  test: {
    username: process.env.DB_USER || 'telegram_user',
    password: process.env.DB_PASSWORD || 'telegram_pass',
    database: process.env.DB_NAME_TEST || 'telegram_db_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    // SSL включаем только если DB_SSL=true (нужно для managed-баз).
    // Для локального Postgres в Docker на ВМ SSL не нужен — оставьте DB_SSL пустым.
    ...(process.env.DB_SSL === 'true'
      ? {
          dialectOptions: {
            ssl: {
              require: true,
              // У managed-баз бывает самоподписанный сертификат — тогда оставьте
              // DB_SSL_REJECT_UNAUTHORIZED пустым. Если есть валидный CA — true.
              rejectUnauthorized:
                process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
            },
          },
        }
      : {}),
  },
};
