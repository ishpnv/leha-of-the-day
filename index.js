require('dotenv').config();
const bot = require('./src/bot');

bot.start().catch((error) => {
  console.error("Не удалось запустить бота:", error);
  process.exit(1);
});

// Глобальные перехватчики: логируем, но не роняем процесс молча.
process.on("unhandledRejection", (reason) => {
  console.error("Необработанный rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Необработанное исключение:", error);
  // Выходим с ошибкой — процесс-менеджер (systemd/Docker) перезапустит бота.
  process.exit(1);
});

// Корректное завершение по сигналам остановки (рестарт деплоя, docker stop).
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await bot.stop();
    process.exit(0);
  });
}
