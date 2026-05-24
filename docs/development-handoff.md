# QuickSplit Development Handoff

This file captures the current project state so the next development session can resume quickly.

## Current Stack

Frontend:
- React 18 + TypeScript + Vite
- Tailwind CSS
- Zustand
- TanStack Query
- Tesseract.js browser OCR
- UPI QR/payment UI

Backend:
- Django 5 + Django REST Framework
- Django ORM
- JWT auth
- PostgreSQL/Supabase-ready database config
- Redis/Celery optional for local development

The user explicitly switched the backend to Django. The active backend is now in `backend/quicksplit` and `backend/api`; the old FastAPI/Alembic backend files were removed.

## Important Backend APIs

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/ocr/validate`
- `POST /api/v1/ocr/upload`
- `POST /api/v1/splits/create`
- `GET /api/v1/splits/history`
- `GET /api/v1/splits/{split_id}`
- `POST /api/v1/splits/{split_id}/participants/{participant_id}/paid`
- `POST /api/v1/dataset/submit`
- `GET /api/v1/dataset/stats`

## Why Registration Was Failing

The frontend was opened at `http://127.0.0.1:3000`, but the backend CORS settings only allowed `http://localhost:3000`.

Fixed in:
- `backend/quicksplit/settings.py`

The backend now allows both `localhost` and `127.0.0.1` for ports `3000` and `5173`.

## Supabase Setup

QuickSplit uses Django REST auth and Django ORM models. For Supabase, the backend only needs the Postgres connection string.

Use Supabase Dashboard -> Project -> Connect -> Session pooler.

Backend env example:

```env
SECRET_KEY=replace-with-generated-secret
DATABASE_URL=postgresql://postgres.PROJECT_REF:DB_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?sslmode=require
DATABASE_POOL_MODE=session
DATABASE_SSL=true
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Generate a secret:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

More details are in `docs/supabase-setup.md`.

## How To Run Locally

Option A: one script

```bash
./scripts/start-dev.sh
```

Option B: separate terminals

Terminal 1:

```bash
cd backend
source venv/bin/activate
DATABASE_URL=sqlite:////tmp/quicksplit-local.db \
UPLOAD_DIR=/tmp/quicksplit-uploads \
DATASET_DIR=/tmp/quicksplit-dataset \
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

Terminal 2:

```bash
cd frontend
VITE_API_URL=http://localhost:8000/api/v1 npm run dev -- --host 127.0.0.1 --port 3000
```

Open:
- Frontend: `http://127.0.0.1:3000`
- Backend docs: `http://127.0.0.1:8000/docs`

## How To Stop Running Servers

If running in terminals, press `Ctrl+C` in each terminal.

If a port is stuck:

```bash
lsof -ti :3000 | xargs kill
lsof -ti :8000 | xargs kill
```

## Verification Commands

```bash
cd backend
source venv/bin/activate
python -m pytest tests -q
```

```bash
cd frontend
npm run build
```

Current known good state:
- Backend tests: 10 passing
- Frontend build: passing

## Backend Direction

Backend direction: continue with Django REST Framework. Keep the frontend API contracts stable unless there is a deliberate frontend migration.
