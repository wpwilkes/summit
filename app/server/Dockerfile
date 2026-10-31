FROM node:24-slim

# Install OpenSSL for Prisma.
RUN apt-get update && apt-get install -y openssl

# Build shared package.
WORKDIR /app/shared
COPY shared/package.json shared/package-lock.json ./
RUN npm ci
COPY shared/ ./
RUN npm run build

# Build & start the server.
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/ ./
EXPOSE 3000
CMD ["npm", "run", "dev:docker"]
