FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++ libc6-compat openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS production

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY --from=builder /app/dist ./dist
COPY start.sh ./
RUN chmod +x start.sh

ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

CMD ["./start.sh"]
