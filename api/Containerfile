FROM node:20-bullseye

WORKDIR /app

COPY package*.json yarn.lock* ./
RUN yarn install --production

COPY . .

# Expose Fastify API port
EXPOSE 8080

CMD ["node", "index.js"]
