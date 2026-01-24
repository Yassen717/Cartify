#!/bin/sh

echo "🚀 Starting backend deployment..."

echo "📦 Running database migrations..."
npx prisma migrate deploy

echo "🗂️ Generating Prisma client..."
npx prisma generate

echo "🌟 Starting server..."
node dist/server.js