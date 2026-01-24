# Build stage
FROM node:20-alpine AS builder

# Install build dependencies for native modules (bcrypt, sharp)
RUN apk add --no-cache python3 make g++ libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install runtime dependencies for sharp
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy Prisma schema (needed for client)
COPY prisma ./prisma

# Generate Prisma client in production
RUN npx prisma generate

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy uploads folder structure
RUN mkdir -p uploads/products uploads/reviews uploads/categories

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/server.js"]
