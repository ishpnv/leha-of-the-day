// Таймзона, в которой считается граница "дня" для выбора пидора/красавчика.
// По умолчанию Москва, переопределяется переменной окружения BOT_TZ.
const TZ = process.env.BOT_TZ || "Europe/Moscow";

// Ключ дня в формате YYYY-MM-DD в заданной таймзоне (а не в локальной TZ сервера).
const dayKey = (date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));

const isToday = (date) => dayKey(date) === dayKey(new Date());

module.exports = { isToday, dayKey, TZ };
