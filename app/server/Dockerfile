FROM node:24-slim

RUN apt-get update \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/shared
COPY shared/package.json shared/package-lock.json ./
RUN npm ci
COPY shared/ ./
RUN npm run build

WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/ ./

EXPOSE 3000

CMD ["npm", "run", "dev:docker"]
