# QuickStart Guide

## Fastest Way to Get Started

### 1. Install Prerequisites

Make sure you have:
- Node.js 18+ (`node --version`)
- Python 3.11+ (`python3 --version`)
- PostgreSQL running
- Redis running

### 2. Run Setup Script

```bash
./scripts/setup.sh
```

### 3. Start Services

**Option A: Use the startup script**
```bash
./scripts/start-dev.sh
```

**Option B: Manual start (5 terminals)**

Terminal 1 - Backend:
```bash
cd backend && source venv/bin/activate && python manage.py migrate && python manage.py runserver 127.0.0.1:9000
```

Terminal 2 - Celery:
```bash
cd backend && source venv/bin/activate && celery -A quicksplit worker --loglevel=info
```

Terminal 3 - Frontend:
```bash
cd frontend && npm run dev
```

### 4. Access the App

- Frontend: http://localhost:3000
- API Docs: http://localhost:9000/docs

### 5. Test It Out

1. Go to http://localhost:3000
2. Click "Start Scanning" or navigate to /scan
3. Upload a receipt image
4. Review extracted items
5. Create a split bill

## Common Issues

**"npm: command not found"**
- Install Node.js from https://nodejs.org/

**"Database connection failed"**
- Make sure PostgreSQL is running: `pg_isready`
- Check your DATABASE_URL in `backend/.env`

**"Redis connection failed"**
- Start Redis: `redis-server`
- Or install: `brew install redis` (macOS)

**"Tesseract not found"**
- Install Tesseract: `brew install tesseract` (macOS)
- Or: `sudo apt-get install tesseract-ocr` (Linux)

For more details, see [SETUP.md](./SETUP.md)
