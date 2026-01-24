# Build stage
FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++ libc6-compat openssl

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy backend source code
COPY backend/ ./

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy package files and install production dependencies only
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy Prisma schema and generate client
COPY backend/prisma ./prisma
RUN npx prisma generate

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy start script
COPY backend/start.sh ./
RUN chmod +x start.sh

ENV NODE_ENV=production

EXPOSE 8000

CMD ["./start.sh"]