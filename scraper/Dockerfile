FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY src/ ./src/
COPY config/ ./config/

EXPOSE 3001

# Run both the scheduler and the webhook server
CMD ["node", "src/scheduler.js"]
