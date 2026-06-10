# Installation Instructions

## Prerequisites Status

Based on the system check:

- ✅ **Python 3.14.2** - Installed
- ❌ **PostgreSQL** - Needs installation
- ❌ **Redis** - Needs installation  
- ❌ **Node.js** - Needs installation
- ✅ **Homebrew** - Installed

## Quick Installation

Run the automated installation script:

```bash
chmod +x scripts/install-and-setup.sh
./scripts/install-and-setup.sh
```

This script will:
1. Install PostgreSQL, create database, and start service
2. Install Redis and start service
3. Install Node.js
4. Install Tesseract OCR
5. Set up Python virtual environment
6. Install all frontend and backend dependencies

## Manual Installation

If you prefer to install manually or the script fails:

### 1. Install PostgreSQL

```bash
brew install postgresql@15
brew services start postgresql@15
createdb quicksplit
```

Verify:
```bash
pg_isready
psql -l | grep quicksplit
```

### 2. Install Redis

```bash
brew install redis
brew services start redis
```

Verify:
```bash
redis-cli ping
# Should return: PONG
```

### 3. Install Node.js

```bash
brew install node
```

Verify:
```bash
node --version
npm --version
```

### 4. Install Tesseract OCR (Optional but Recommended)

```bash
brew install tesseract
```

### 5. Set Up Project Dependencies

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..
```

## Verify Installation

Run this to check everything:

```bash
# Check all services
python3 --version
node --version
psql --version
redis-cli ping
tesseract --version

# Check services are running
pg_isready
redis-cli ping
```

## Troubleshooting

### Permission Issues

If you get permission errors with Homebrew:

```bash
sudo chown -R $(whoami) /opt/homebrew/Cellar
sudo chown -R $(whoami) /opt/homebrew/Library
```

### PostgreSQL Not Starting

```bash
# Check status
brew services list

# Restart
brew services restart postgresql@15

# Or start manually
pg_ctl -D /opt/homebrew/var/postgresql@15 start
```

### Redis Not Starting

```bash
# Restart
brew services restart redis

# Or start manually
redis-server /opt/homebrew/etc/redis.conf
```

### Database Creation Fails

If `createdb` fails, try:

```bash
# Connect as postgres user
psql postgres

# Then run:
CREATE DATABASE quicksplit;
\q
```

Or specify a user:

```bash
createdb -U your_username quicksplit
```

Update `backend/.env` with the correct user:

```env
DATABASE_URL=postgresql://your_username@localhost/quicksplit
```

## Next Steps

Once installation is complete:

1. **Start the application:**
   ```bash
   ./scripts/start-dev.sh
   ```

2. **Or start services manually:**
   - Backend: `cd backend && source venv/bin/activate && python manage.py migrate && python manage.py runserver 127.0.0.1:9000`
   - Celery: `cd backend && source venv/bin/activate && celery -A quicksplit worker --loglevel=info`
   - Frontend: `cd frontend && npm run dev`

3. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:9000
   - API Docs: http://localhost:9000/docs
