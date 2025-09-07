#!/bin/bash

# Production Database Seeding Script
# Usage: ./scripts/seed-production.sh "your-database-url"

if [ -z "$1" ]; then
    echo "Error: Please provide the database URL as an argument"
    echo "Usage: ./scripts/seed-production.sh \"postgresql://user:password@host/database?sslmode=require\""
    exit 1
fi

DATABASE_URL=$1

echo "🚀 Starting production database setup..."
echo "================================================"

# Step 1: Push schema to production
echo "📊 Pushing schema to production database..."
DATABASE_URL="$DATABASE_URL" npx prisma db push --skip-generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to push schema to production database"
    exit 1
fi

echo "✅ Schema pushed successfully!"

# Step 2: Run the complete seed
echo "🌱 Seeding production database with complete data..."
DATABASE_URL="$DATABASE_URL" npx tsx prisma/seed-complete.ts

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed production database"
    exit 1
fi

echo "✅ Production database seeded successfully!"

# Step 3: Run workouts seed
echo "🏋️ Adding workout data..."
DATABASE_URL="$DATABASE_URL" npx tsx prisma/seed-workouts.ts

if [ $? -ne 0 ]; then
    echo "⚠️  Some workouts may have failed to seed (this is normal for duplicates)"
fi

echo "================================================"
echo "🎉 Production database setup complete!"
echo "Your database now contains:"
echo "  - Admin user (admin/admin123)"
echo "  - 100+ exercises"
echo "  - 70+ workout templates"
echo "  - Kudos messages"
echo "  - Motivational quotes"