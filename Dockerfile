FROM node:20-alpine

WORKDIR /app

# Сначала зависимости — слой кешируется, пока package*.json не меняется
COPY package*.json ./
RUN npm ci --omit=dev

# Затем исходники
COPY . .

# npm start = прогон миграций + запуск бота
CMD ["npm", "start"]
