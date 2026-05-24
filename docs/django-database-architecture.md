# QuickSplit — Django & Database Architecture

## 1. Database Schema

All models live in the `api` Django app (`backend/api/models.py`).

---

### Users (`api_user`)

Extends Django's `AbstractUser`. Email is the login identifier; `username` is
auto-set to the email value.

| Column         | Type           | Notes                              |
|----------------|----------------|------------------------------------|
| id             | UUID PK        | `uuid4`, not editable              |
| email          | VARCHAR(254)   | UNIQUE, lowercased on save         |
| name           | VARCHAR(100)   | Display name                       |
| username       | VARCHAR(150)   | Mirrored from email                |
| password       | VARCHAR(128)   | PBKDF2/Argon2 via Django auth      |
| is_active      | BOOLEAN        | Default `true`                     |
| is_staff       | BOOLEAN        | Admin access flag                  |
| created_at     | TIMESTAMPTZ    | auto_now_add                       |
| updated_at     | TIMESTAMPTZ    | auto_now                           |

---

### Splits (`api_split`)

One split per bill. Stores the confirmed total and split method.

| Column         | Type           | Notes                              |
|----------------|----------------|------------------------------------|
| id             | UUID PK        | `uuid4`                            |
| user_id        | UUID FK        | → `api_user.id` CASCADE            |
| total_amount   | DECIMAL(12,2)  | Full bill amount in INR            |
| split_type     | VARCHAR(20)    | `equal` / `custom` / `percentage` |
| metadata       | JSONB          | OCR text, image hash, notes        |
| created_at     | TIMESTAMPTZ    | Indexed, ordered DESC              |
| updated_at     | TIMESTAMPTZ    | auto_now                           |

---

### Participants (`api_participant`)

One row per person in a split.

| Column         | Type           | Notes                              |
|----------------|----------------|------------------------------------|
| id             | UUID PK        | `uuid4`                            |
| split_id       | UUID FK        | → `api_split.id` CASCADE           |
| name           | VARCHAR(100)   | Display name                       |
| upi_id         | VARCHAR(100)   | Optional UPI handle (VPA)          |
| amount         | DECIMAL(12,2)  | Share in INR (paisa-accurate)      |
| payment_status | VARCHAR(20)    | `pending` / `paid` / `failed`     |
| paid_at        | TIMESTAMPTZ    | Set when marked paid               |
| created_at     | TIMESTAMPTZ    | auto_now_add                       |

---

### Dataset Entries (`api_datasetentry`)

Receipt images + OCR text collected for AI training.

| Column         | Type           | Notes                              |
|----------------|----------------|------------------------------------|
| id             | UUID PK        | `uuid4`                            |
| user_id        | UUID FK NULL   | → `api_user.id` SET NULL           |
| image_path     | VARCHAR(500)   | Absolute path on disk              |
| image_hash     | VARCHAR(128)   | SHA-256 hex; UNIQUE + indexed      |
| ocr_text       | TEXT           | Raw Tesseract.js output            |
| detected_total | DECIMAL(12,2)  | Frontend-detected amount           |
| actual_total   | DECIMAL(12,2)  | User-confirmed ground truth        |
| confidence     | FLOAT          | OCR + validation blended score     |
| metadata       | JSONB          | Device, locale, source, etc.       |
| annotations    | JSONB          | Bounding boxes, labels (future)    |
| is_verified    | INTEGER        | 0=unverified, 1=verified, -1=bad   |
| created_at     | TIMESTAMPTZ    | Indexed, ordered DESC              |

---

### Entity-Relationship Diagram

```
User ─────────────┬──────────────────────────┐
  │               │                          │
  │ 1:N           │ 1:N                      │ 1:N (nullable)
  ▼               ▼                          ▼
Split          DatasetEntry
  │
  │ 1:N
  ▼
Participant
```

---

## 2. Django Project Architecture

```
backend/
├── manage.py                  # Entry point
├── requirements.txt
├── Dockerfile
├── pytest.ini
│
├── quicksplit/                # Django project package
│   ├── __init__.py
│   ├── settings.py            # All config via env vars
│   ├── urls.py                # Root URL router
│   ├── wsgi.py
│   ├── asgi.py
│   └── celery.py              # Celery app definition
│
└── api/                       # Single Django app
    ├── __init__.py
    ├── apps.py
    ├── models.py              # ORM models (User, Split, Participant, DatasetEntry)
    ├── serializers.py         # DRF serializers (request validation + response shape)
    ├── views.py               # APIView classes (one class per endpoint group)
    ├── services.py            # Business logic (OCR, UPI, QR, split math, file handling)
    ├── urls.py                # App-level URL patterns under /api/v1/
    └── migrations/
        └── 0001_initial.py
```

---

## 3. Django Settings Architecture (`quicksplit/settings.py`)

All configuration is driven by environment variables with sane development defaults.
`python-dotenv` loads `backend/.env` automatically.

| Setting Group      | Key Variables                                       |
|--------------------|-----------------------------------------------------|
| Security           | `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`              |
| Database           | `DATABASE_URL` (dj-database-url), `DATABASE_SSL`    |
| Auth               | `AUTH_USER_MODEL = "api.User"`                      |
| JWT                | `ACCESS_TOKEN_EXPIRE_MINUTES` (default 7 days)      |
| CORS               | `CORS_ORIGINS` (comma-separated list)               |
| File storage       | `UPLOAD_DIR`, `DATASET_DIR`, `MAX_UPLOAD_SIZE`      |
| Celery / Redis     | `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`        |

`dj-database-url` parses `DATABASE_URL` so the same settings work with:
- **SQLite** for local no-dependency dev
- **PostgreSQL** / Supabase for staging and production

---

## 4. Request Lifecycle

```
Browser / curl
     │
     │  HTTP(S)
     ▼
Django WSGI / ASGI (manage.py runserver or gunicorn)
     │
     │  CORS check  ←  django-cors-headers middleware
     │
     ▼
quicksplit/urls.py
     │
     ├── /api/v1/*  →  api/urls.py
     │                      │
     │                      ├── auth/*      RegisterView / LoginView / MeView
     │                      ├── ocr/*       OCRUploadView / OCRValidateView
     │                      ├── splits/*    SplitCreateView / SplitHistoryView / ...
     │                      └── dataset/*   DatasetSubmitView / DatasetStatsView
     │
     ├── /docs/      →  drf-spectacular Swagger UI
     └── /admin/     →  Django admin
```

Each `APIView`:
1. Validates the request body with a DRF `Serializer`
2. Calls a `Service` class in `services.py` for all business logic
3. Returns a `Response` shaped by a response serializer

---

## 5. Authentication Flow

```
POST /api/v1/auth/register
  → RegisterSerializer validates email + password
  → user.set_password() hashes with PBKDF2-SHA256 (Django default)
  → RefreshToken.for_user(user) issues JWT pair
  → Returns { access_token, token_type, user }

POST /api/v1/auth/login
  → LoginSerializer calls authenticate(email, password)
  → Returns same shape

All protected endpoints:
  → JWTAuthentication reads "Authorization: Bearer <token>"
  → request.user is set to the User instance
```

JWT access tokens default to **7 days** (overridable via `ACCESS_TOKEN_EXPIRE_MINUTES`).

---

## 6. OCR Flow

```
Browser (Tesseract.js)
  → Canvas preprocessing (grayscale + threshold)
  → Tesseract.js extracts text + confidence
  → detectBillTotal() keyword search → amount

POST /api/v1/ocr/validate  (authenticated)
  → OCRService.validate_ocr_text(text, detected_total)
  → Backend re-runs keyword detection on OCR text
  → Compares frontend vs backend total
  → Adjusts confidence score
  → Returns { is_valid, confidence, suggested_total, strategy }
```

OCR does **not** require server-side Tesseract — the browser does all image
processing. The backend is only a validator and confidence booster.

---

## 7. Split Calculation (Paisa-Accurate)

```python
# SplitService.calculate_equal_split
total_paisa = int(Decimal(total_amount) * 100)   # avoid float rounding
base_paisa  = total_paisa // num_participants
remainder   = total_paisa - base_paisa * num_participants

amounts = [
    Decimal(base_paisa + (1 if i < remainder else 0)) / 100
    for i in range(num_participants)
]
# First `remainder` participants get 1 extra paisa — deterministic, fair
```

Example: ₹546 ÷ 4 = ₹136.50 each (no rounding needed).
Example: ₹100 ÷ 3 = ₹33.34, ₹33.33, ₹33.33 (1 paisa remainder to first person).

---

## 8. UPI Payment Generation

```python
# UPIService.generate_upi_link
"upi://pay?pa={upi_id}&pn={name}&am={amount:.2f}&cu=INR&tn={note}"

# QRService.generate_qr_base64
# qrcode library → PIL Image → resize to 300×300 → base64 PNG data URI
```

The QR code is generated server-side and returned as a `data:image/png;base64,...`
string so the browser can render it without any additional requests.

---

## 9. Celery Background Tasks (`quicksplit/celery.py` + `api/`)

| Task                       | Trigger              | Purpose                            |
|----------------------------|----------------------|------------------------------------|
| `process_ocr_background`   | After OCR upload     | Placeholder for enhanced OCR model |
| `process_dataset_entry`    | After dataset submit | Normalize OCR text, prepare labels |
| `export_dataset_coco`      | Manual / scheduled   | Export to COCO-style JSON          |
| `cleanup_old_uploads`      | Celery Beat, daily   | Remove stale uploaded images       |
| `cleanup_temp_files`       | Celery Beat, hourly  | Remove tmp processing files        |

Redis serves as both the Celery broker (queue) and result backend.
For local development without Redis, Celery tasks are skipped gracefully.

---

## 10. Dataset Storage Layout

```
backend/
├── uploads/              # Raw receipt uploads (deduplicated by SHA-256)
│   └── {sha256}.jpg
│
└── dataset/
    ├── raw/
    │   └── images/       # Dataset receipt images
    │       └── {sha256}.jpg
    ├── processed/        # Normalized versions (future)
    └── annotations/      # COCO-style JSON exports
```

Each `DatasetEntry` row stores the absolute path and SHA-256 hash to prevent
duplicate submissions.

---

## 11. Running Locally (No Docker)

```bash
# Terminal 1 — Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# SQLite for zero-dependency local dev
DATABASE_URL=sqlite:////tmp/quicksplit-local.db \
UPLOAD_DIR=/tmp/quicksplit-uploads \
DATASET_DIR=/tmp/quicksplit-dataset \
python manage.py migrate
python manage.py runserver 127.0.0.1:8000

# Terminal 2 — Frontend
cd frontend
npm install
VITE_API_URL=http://localhost:8000/api/v1 npm run dev -- --host 127.0.0.1 --port 3000
```

Swagger UI: http://127.0.0.1:8000/docs

---

## 12. Running with Docker Compose

```bash
docker-compose up --build
```

Services started:
- `postgres` — PostgreSQL 16 on port 5432
- `redis` — Redis 7.2 on port 6379
- `backend` — Django on port 8000 (migrates then serves)
- `celery_worker` — Celery worker
- `celery_beat` — Celery beat scheduler
- `frontend` — Vite dev server on port 3000

---

## 13. Key Design Decisions

| Decision | Rationale |
|---|---|
| Single Django app (`api/`) | Simple enough to not need sub-apps; easy to navigate |
| UUID primary keys | Avoids sequential ID enumeration attacks |
| `AbstractUser` extension | Keeps Django auth, admin, and SimpleJWT working |
| Email as username | Users think in email; username is set automatically |
| Paisa integer math | Eliminates float rounding errors entirely |
| Browser-side OCR | No GPU/Tesseract server needed; privacy-friendly |
| QR generated server-side | Single base64 string in API response, no extra round trips |
| SQLite for local dev | Zero infrastructure needed for first run |
| dj-database-url | One `DATABASE_URL` env var for all DB backends |
