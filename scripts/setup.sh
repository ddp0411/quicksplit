#!/bin/bash

# QuickSplit Setup Script

echo "🚀 Setting up QuickSplit..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+"
    exit 1
fi

# Check for PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. You'll need it for the database."
    echo "   Install from: https://www.postgresql.org/download/"
fi

# Check for Redis
if ! command -v redis-server &> /dev/null; then
    echo "⚠️  Redis is not installed. You'll need it for Celery."
    echo "   Install from: https://redis.io/download"
fi

echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "📦 Setting up Python virtual environment..."
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

echo "📦 Installing backend dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start PostgreSQL and Redis"
echo "2. Run database migrations: cd backend && alembic upgrade head"
echo "3. Start backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "4. Start Celery worker: cd backend && celery -A app.core.celery_app worker --loglevel=info"
echo "5. Start frontend: cd frontend && npm run dev"

