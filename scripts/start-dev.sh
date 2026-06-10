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

: "${DATABASE_URL:=sqlite:////tmp/quicksplit-local.db}"
: "${UPLOAD_DIR:=/tmp/quicksplit-uploads}"
: "${DATASET_DIR:=/tmp/quicksplit-dataset}"
: "${REDIS_URL:=redis://localhost:6379/0}"
export DATABASE_URL UPLOAD_DIR DATASET_DIR REDIS_URL

python manage.py migrate
python manage.py runserver 0.0.0.0:9000 &
BACKEND_PID=$!
cd ..

# Start Celery worker
CELERY_PID=""
if command -v redis-cli &> /dev/null && redis-cli -u "$REDIS_URL" ping &> /dev/null; then
    echo "⚙️  Starting Celery worker..."
    cd backend
    source venv/bin/activate
    celery -A quicksplit worker --loglevel=info &
    CELERY_PID=$!
    cd ..
else
    echo "⚠️  Redis unavailable. Skipping Celery worker; API will still run."
fi

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "❌ Node modules not found. Installing..."
    npm install
fi
export VITE_API_URL="${VITE_API_URL:-http://localhost:9000/api/v1}"
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ All services started!"
echo "   Backend: http://localhost:9000"
echo "   Frontend: http://localhost:3000"
echo "   API Docs: http://localhost:9000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; if [ -n \"$CELERY_PID\" ]; then kill $CELERY_PID; fi; exit" INT
wait
