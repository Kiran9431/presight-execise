# Stage 1: Build server
FROM node:22-alpine AS server-builder
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY lerna.json ./

# Copy workspace package files
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install all dependencies
RUN npm install

# Copy server source
COPY server/ ./server/

# Build server
WORKDIR /app/server
RUN npm run build

# Stage 2: Build client
FROM node:22-alpine AS client-builder
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY lerna.json ./

# Copy workspace package files
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install all dependencies
RUN npm install

# Copy client source
COPY client/ ./client/

# Build client
WORKDIR /app/client
RUN npm run build

# Stage 3: Production
FROM node:22-alpine
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY lerna.json ./

# Copy server package file
COPY server/package*.json ./server/

# Install only production dependencies
WORKDIR /app/server
RUN npm install --only=production

# Copy built server
COPY --from=server-builder /app/server/dist ./dist

# Copy built client
COPY --from=client-builder /app/client/dist ../client/dist

# Copy seed script source (needed for seeding)
COPY server/src/database ./src/database
COPY server/src/types ./src/types

WORKDIR /app/server

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/server/data/database.db

# Create data directory
RUN mkdir -p /app/server/data

# Start script: seed database if needed, then start server
CMD ["sh", "-c", "npm run seed && npm run start"]
