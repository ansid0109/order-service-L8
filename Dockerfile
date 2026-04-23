FROM node:18.20.4-alpine AS builder

WORKDIR /app
ARG APP_VERSION=0.1.0
COPY package*.json ./

RUN npm install --production

COPY . .
EXPOSE 3000
ENV APP_VERSION=$APP_VERSION

CMD [ "npm", "start" ]