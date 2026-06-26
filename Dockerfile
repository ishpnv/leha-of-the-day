FROM node:20-alpine

WORKDIR /app

# На ВМ часто нет глобального IPv6, а у registry.npmjs.org и api.telegram.org
# есть AAAA-записи. Node по умолчанию ходит по IPv6 и зависает. Форсируем IPv4 —
# это нужно и при npm install, и при работе бота (polling к Telegram).
ENV NODE_OPTIONS=--dns-result-order=ipv4first

# Ставим зависимости с публичного реестра npm.
# package-lock.json может быть сгенерён с внутренним реестром (npm.yandex-team.ru),
# недоступным с публичной ВМ, поэтому форсируем registry.npmjs.org и не используем
# npm ci (он жёстко берёт URL из lock-файла). Слой кешируется, пока package.json
# не меняется.
COPY package.json ./
RUN npm config set registry https://registry.npmjs.org/ \
 && npm install --omit=dev --no-audit --no-fund

# Затем исходники
COPY . .

# npm start = прогон миграций + запуск бота
CMD ["npm", "start"]
