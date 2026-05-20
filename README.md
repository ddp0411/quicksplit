# QuickSplit

QuickSplit scans receipts, detects the bill total, splits the amount with paisa-accurate rounding, and generates UPI payment links plus QR codes for each participant.

## Features

- Frontend OCR with Tesseract.js and Canvas preprocessing
- Camera capture and receipt image upload
- Backend OCR validation with keyword total detection and largest-number fallback
- Equal split calculations with deterministic paisa remainder distribution
- UPI deep links and QR codes for Indian UPI apps
- JWT authentication with passlib password hashing
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
- FastAPI, Pydantic v2
- Async SQLAlchemy with PostgreSQL
- Redis, Celery
- JWT, passlib bcrypt
- Pytest and httpx

## Local Setup

Backend:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
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

Backend defaults are in `backend/app/core/config.py`. Override them with a backend `.env` file:

```env
SECRET_KEY=change-this-in-production
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/quicksplit
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
UPLOAD_DIR=./uploads
DATASET_DIR=./dataset
```

Frontend:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Verification

```bash
./backend/venv/bin/python -m pytest backend/tests -q
npm --prefix frontend run build
```

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
