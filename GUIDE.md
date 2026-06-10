# QuickSplit — Developer Onboarding Guide

Everything a new developer needs to run the full QuickSplit stack locally.

---

## Prerequisites

Install all of these before starting:

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.11+ | `brew install python@3.11` (Mac) or `sudo apt install python3.11` |
| Node.js | 18+ | https://nodejs.org or `brew install node` |
| PostgreSQL | 14+ | `brew install postgresql@14` (Mac) or `sudo apt install postgresql` |
| Tesseract OCR | 5.x | `brew install tesseract` (Mac) or `sudo apt install tesseract-ocr` |
| Expo Go app | latest | Install on your iOS/Android phone from the App Store / Play Store |

Optional (for background tasks):
- **Redis** — `brew install redis` (Mac) or `sudo apt install redis-server`

---

## Project Structure

```
quicksplit test/
├── backend/       Django REST API (port 9000)
├── frontend/      React web app (port 5173)
├── mobile/        React Native / Expo mobile app
├── API_KEYS.md    Where to get API keys
└── GUIDE.md       This file
```

---

## 1. Clone & First-Time Setup

```bash
git clone <repo-url>
cd "quicksplit test"
```

---

## 2. Backend (Django API)

```bash
cd backend

# Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate          # Mac/Linux
# venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and fill in your values (see API_KEYS.md)
# Minimum required: DATABASE_URL and optionally GROQ_API_KEY for AI chat

# Create the PostgreSQL database
createdb quicksplit
# If that fails, try: psql -c "CREATE DATABASE quicksplit;"

# Run database migrations
python manage.py migrate

# (Optional) Create an admin user
python manage.py createsuperuser

# Start the development server
python manage.py runserver 0.0.0.0:9000
```

Backend is now running at **http://localhost:9000**

API docs (Swagger UI): http://localhost:9000/api/schema/swagger-ui/

---

## 3. Web Frontend (React + Vite)

Open a new terminal tab:

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Web app is now running at **http://localhost:5173**

The web app talks to the backend at `localhost:9000` by default.

---

## 4. Mobile App (React Native + Expo)

Open another terminal tab:

```bash
cd mobile

# Install dependencies
npm install

# Start Expo (choose your target)
npx expo start          # Shows QR code — scan with Expo Go app on your phone
npx expo start --ios    # Open iOS Simulator (requires Xcode on Mac)
npx expo start --android # Open Android emulator (requires Android Studio)
```

Scan the QR code with the **Expo Go** app on your phone to run the app instantly. The mobile app connects to the backend; make sure your backend is running and your phone is on the same Wi-Fi network.

> **Physical device on different network?** Use tunnel mode: `npx expo start --tunnel` (requires `npm install -g @expo/ngrok`)

---

## 5. Running Tests

```bash
cd backend
source venv/bin/activate   # if not already active
pytest
```

Expected: all tests pass (currently 10/10).

---

## 6. API Keys

AI chat requires at least one API key. **Groq is free** and is the recommended starting point.

See [API_KEYS.md](./API_KEYS.md) for full instructions on getting each key and where to put it.

**Minimum setup for AI features:**
```env
# backend/.env
GROQ_API_KEY=gsk_your_key_here
```

---

## 7. Common Issues

### PostgreSQL connection error
```
django.db.utils.OperationalError: connection refused
```
Start PostgreSQL:
```bash
brew services start postgresql@14    # Mac
sudo service postgresql start        # Linux
```

### Tesseract not found (OCR upload fails)
```
pytesseract.pytesseract.TesseractNotFoundError
```
Install Tesseract and make sure it's on your PATH:
```bash
brew install tesseract               # Mac
sudo apt install tesseract-ocr       # Linux
```

### Pillow install fails
If `pip install -r requirements.txt` fails on Pillow:
```bash
pip install --upgrade pip setuptools wheel
pip install Pillow --no-cache-dir
```
See `FIX-PILLOW.md` in the project root for more details.

### Expo "Network request failed" on physical device
Your phone can't reach `localhost:9000`. Either:
1. Use tunnel mode: `npx expo start --tunnel`
2. Or update the API base URL in `mobile/src/config/api.ts` to your machine's local IP address (e.g., `192.168.1.x`)

### Port already in use
```bash
# Find and kill the process on port 9000
lsof -ti:9000 | xargs kill -9
```

### Module not found after adding a new package
```bash
cd mobile && npx expo install <package-name>   # always use expo install, not npm install, for Expo packages
```

---

## 8. Environment Summary

| Service | URL | Command |
|---------|-----|---------|
| Backend API | http://localhost:9000 | `python manage.py runserver 0.0.0.0:9000` (in `backend/`) |
| Web Frontend | http://localhost:5173 | `npm run dev` (in `frontend/`) |
| Mobile App | Expo Go (QR scan) | `npx expo start` (in `mobile/`) |
| API Docs | http://localhost:9000/api/schema/swagger-ui/ | — |
| Django Admin | http://localhost:9000/admin/ | — |

---

## 9. Tech Stack Reference

| Layer | Technology |
|-------|-----------|
| Backend | Django 5 + Django REST Framework + SimpleJWT |
| Database | PostgreSQL (SQLite fallback) |
| OCR | Tesseract via pytesseract + Pillow |
| AI Chat | Groq (primary) → Anthropic → OpenAI |
| Web | React + Vite + Tailwind CSS |
| Mobile | React Native + Expo SDK 56 |
| State (mobile) | Zustand + TanStack Query |
| Navigation | React Navigation v6 |
