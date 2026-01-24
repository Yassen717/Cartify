FROM node:20-alpine

RUN apk add --no-cache python3 make g++ libc6-compat openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . ./

# Make start script executable
RUN chmod +x start.sh

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

ENV NODE_ENV=production

EXPOSE 8000

CMD ["./start.sh"]