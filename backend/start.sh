#!/bin/sh
set -e

echo "🚀 Starting backend deployment..."

echo "📦 Running database migrations..."
npx prisma migrate deploy

echo "🌟 Starting server..."
node dist/server.js