FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache git vim curl

COPY package.json ./

RUN npm install

COPY . .

# 容器启动时只需要跑服务
CMD ["npx", "tsx", "main.ts"]