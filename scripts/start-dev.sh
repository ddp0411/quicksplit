#!/bin/bash

# QuickSplit Development Startup Script

echo "🚀 Starting QuickSplit development environment..."

# Start PostgreSQL (if using local installation)
# Uncomment if you have PostgreSQL installed locally
# pg_ctl -D /usr/local/var/postgres start

# Start Redis (if using local installation)
# Uncomment if you have Redis installed locally
# redis-server --daemonize yes

# Start backend
echo "🔧 Starting backend server..."
cd backend
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Creating..."
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip setuptools wheel
    echo "Installing system dependencies for Pillow..."
    if command -v brew &> /dev/null && [[ "$OSTYPE" == "darwin"* ]]; then
        brew install libjpeg zlib libpng libtiff freetype 2>/dev/null || true
    fi
    echo "Installing Python packages..."
    pip install -r requirements.txt || {
        echo "⚠️  Some packages failed. Trying alternative installation..."
        pip install --upgrade pip setuptools wheel
        pip install --only-binary :all: Pillow 2>/dev/null || pip install Pillow
        pip install -r requirements.txt
    }
else
    source venv/bin/activate
fi
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Start Celery worker
echo "⚙️  Starting Celery worker..."
cd backend
source venv/bin/activate
celery -A app.core.celery_app worker --loglevel=info &
CELERY_PID=$!
cd ..

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "❌ Node modules not found. Installing..."
    npm install
fi
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ All services started!"
echo "   Backend: http://localhost:8000"
echo "   Frontend: http://localhost:3000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $CELERY_PID $FRONTEND_PID; exit" INT
wait

