# =============================================================================
# Telegram 排版机器人镜像
# 基础: Node.js 22 Alpine
# 额外: git (拉取 Typeseter 依赖), vim/curl (调试)
# =============================================================================
FROM node:22-alpine

WORKDIR /app

# git: 用于 npm 安装 github 依赖; vim/curl: 调试工具
RUN apk add --no-cache git vim curl

# 先复制 package.json,利用 Docker 层缓存
COPY package.json ./

# 安装 grammy, socks-proxy-agent, typeseter
RUN npm install

# 再复制源码
COPY . .

CMD npx tsx main.ts
