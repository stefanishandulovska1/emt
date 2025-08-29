FROM node:18-alpine as build

WORKDIR /app

# Копирај package files
COPY package*.json ./

# Инсталирај dependencies
RUN npm ci

# Копирај го изворниот код
COPY . .

# Build ја апликацијата
RUN npm run build

# Production stage
FROM nginx:alpine

# Копирај ги built файловите
COPY --from=build /app/build /usr/share/nginx/html

# Копирај nginx конфигурација
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]



