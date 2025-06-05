#!/bin/sh

echo "⏳ Waiting for MySQL..."
./wait-for-it.sh mysql:3306 --timeout=30 --strict -- echo "✅ MySQL is up"

echo "🚀 Running Prisma Migrate Deploy..."
npx prisma migrate deploy

echo "🔧 Starting app..."
node dist/server.js
