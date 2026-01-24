FROM node:20-alpine

RUN apk add --no-cache python3 make g++ libc6-compat openssl

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

# Make start script executable
RUN chmod +x start.sh

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

ENV NODE_ENV=production

EXPOSE 8000

CMD ["./start.sh"]