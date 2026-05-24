# QuickSplit Setup Guide

## Prerequisites

Before setting up QuickSplit, ensure you have the following installed:

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **Python 3.11+** - [Download](https://www.python.org/downloads/)
3. **PostgreSQL 15+** - [Download](https://www.postgresql.org/download/)
4. **Redis** - [Download](https://redis.io/download)
5. **Tesseract OCR** (for OCR functionality)
   - macOS: `brew install tesseract`
   - Ubuntu: `sudo apt-get install tesseract-ocr`
   - Windows: [Download installer](https://github.com/UB-Mannheim/tesseract/wiki)

## Quick Setup (Using Scripts)

### Option 1: Automated Setup Script

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Option 2: Manual Setup

#### 1. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

#### 2. Set Up Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..
```

#### 3. Set Up Database

Create a PostgreSQL database:

```bash
createdb quicksplit
# Or using psql:
# psql -U postgres
# CREATE DATABASE quicksplit;
```

#### 4. Configure Environment Variables

Create `.env` file in `backend/` directory:

```env
DATABASE_URL=postgresql://your_user:your_password@localhost/quicksplit
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

Create `.env` file in `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

#### 5. Run Database Migrations

```bash
cd backend
source venv/bin/activate
python manage.py migrate
```

If migrations don't exist yet, create initial migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

## Running the Application

### Start All Services

You can use the provided script:

```bash
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

Or start each service manually:

#### Terminal 1: Start PostgreSQL
```bash
# Usually starts automatically, or:
pg_ctl -D /usr/local/var/postgres start
```

#### Terminal 2: Start Redis
```bash
redis-server
```

#### Terminal 3: Start Backend
```bash
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

#### Terminal 4: Start Celery Worker
```bash
cd backend
source venv/bin/activate
celery -A quicksplit worker --loglevel=info
```

#### Terminal 5: Start Frontend
```bash
cd frontend
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:3000 (or http://localhost:5173)
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

## Using Docker Compose (Alternative)

If you have Docker installed:

```bash
docker-compose up --build
```

This will start all services including PostgreSQL and Redis.

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `pg_isready`
- Check database credentials in `.env` file
- Verify database exists: `psql -l | grep quicksplit`

### Redis Connection Issues
- Ensure Redis is running: `redis-cli ping` (should return PONG)
- Check Redis is listening on port 6379

### OCR Issues
- Verify Tesseract is installed: `tesseract --version`
- Check Tesseract language data is installed

### Port Already in Use
- Change ports in configuration files if 3000, 8000, 5432, or 6379 are in use

## Next Steps

1. Register a new user at http://localhost:3000/login
2. Upload a receipt image to test OCR
3. Create a split bill and add participants
4. Generate payment QR codes

## Development Tips

- Django development server auto-reloads on file changes
- Frontend hot-reloads automatically
- Check backend logs for API requests
- Use `/docs` endpoint for interactive API testing
