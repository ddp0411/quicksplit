# QuickSplit

QuickSplit scans receipts, detects the bill total, splits the amount with paisa-accurate rounding, and generates UPI payment links plus QR codes for each participant.

## Features

- Frontend OCR with Tesseract.js and Canvas preprocessing
- Camera capture and receipt image upload
- Backend OCR validation with keyword total detection and largest-number fallback
- Equal split calculations with deterministic paisa remainder distribution
- UPI deep links and QR codes for Indian UPI apps
- JWT authentication with Django password hashing
- Dataset collection for raw images, OCR text, normalized totals, metadata, and annotations
- Celery tasks for OCR post-processing, dataset normalization, export, and cleanup
- Redis-backed caching for OCR validation, split calculations, and sessions
- PWA manifest for installable mobile use on Android and iOS browsers

## Tech Stack

Frontend:
- React 18, TypeScript, Vite
- Zustand, React Query, React Router
- Tailwind CSS, Headless UI
- Tesseract.js, qrcode.react

Backend:
- Django 5, Django REST Framework
- SimpleJWT authentication
- PostgreSQL/Supabase via Django ORM
- Redis and Celery hooks
- Pytest and pytest-django

## Local Setup

Backend:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Full stack with Docker:

```bash
docker-compose up --build
```

The API runs at `http://localhost:8000`, and the frontend runs at `http://localhost:3000`.

## Environment

Backend defaults are in `backend/quicksplit/settings.py`. Override them with a backend `.env` file:

```env
SECRET_KEY=change-this-in-production
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quicksplit
DATABASE_POOL_MODE=session
DATABASE_SSL=false
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
UPLOAD_DIR=./uploads
DATASET_DIR=./dataset
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Frontend:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Verification

```bash
cd backend && ./venv/bin/python -m pytest tests -q
npm --prefix frontend run build
```

## Run And Stop

Start both servers:

```bash
./scripts/start-dev.sh
```

Or run separately:

```bash
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 3000
```

Stop servers with `Ctrl+C` in each terminal. If a port is stuck:

```bash
lsof -ti :3000 | xargs kill
lsof -ti :8000 | xargs kill
```

Development notes for future sessions are in [`docs/development-handoff.md`](./docs/development-handoff.md).

## Main API Routes

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/ocr/upload`
- `POST /api/v1/ocr/validate`
- `POST /api/v1/splits/create`
- `GET /api/v1/splits/history`
- `GET /api/v1/splits/{split_id}`
- `POST /api/v1/splits/{split_id}/participants/{participant_id}/paid`
- `POST /api/v1/dataset/submit`
- `GET /api/v1/dataset/stats`

Swagger UI is available at `http://localhost:8000/docs` when the backend is running.

## Supabase Postgres

QuickSplit can use Supabase as the Postgres database through `DATABASE_URL`.
Use the Supabase **Session pooler** connection string for local/dev IPv4-friendly
connections, keep the credentials only in `backend/.env`, and see
[`docs/supabase-setup.md`](./docs/supabase-setup.md) for exact steps.
