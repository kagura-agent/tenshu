FROM node:22-slim AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci

# Copy source
COPY shared/ shared/
COPY server/ server/
COPY client/ client/

# Build client (static files)
RUN npm run build -w client

# Build server
RUN npm run build -w server

# Production stage
FROM node:22-slim
WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci --omit=dev

COPY shared/ shared/
COPY --from=base /app/server/dist/ server/dist/
COPY --from=base /app/client/dist/ client/dist/

ENV NODE_ENV=production
ENV TENSHU_PORT=3001
EXPOSE 3001

CMD ["node", "server/dist/index.js"]
