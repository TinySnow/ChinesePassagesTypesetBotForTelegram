FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache git vim curl

COPY package.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "build"]

CMD ["npm", "dist/main.js"]
