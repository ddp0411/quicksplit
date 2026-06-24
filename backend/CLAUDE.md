# Backend — QuickSplit API (CLAUDE.md)

Django 5 + Django REST Framework. This is the **single source of truth** for all data; the web
and mobile apps are thin clients over this API. See the root [`../CLAUDE.md`](../CLAUDE.md) for
project-wide conventions.

## Stack
- Django `5.0.14`, DRF `3.15.2`, `djangorestframework-simplejwt` (JWT auth)
- DB: **SQLite** in dev (`db.sqlite3`), **PostgreSQL/Supabase** in prod via `DATABASE_URL`
- `drf-spectacular` for OpenAPI (`/api/schema/`, Swagger at `/docs/`)
- Redis + Celery configured (broker/result backends set) but **no tasks defined yet** — scaffolding only
- `Pillow` + `pytesseract` for image handling; `qrcode` for UPI QR; multi-provider AI SDKs
- Python 3.11+. Full pin list in `requirements.txt`.

## Run / test
```bash
source venv/bin/activate
python manage.py migrate
python manage.py runserver 127.0.0.1:9000     # default port for this project is 9000, not 8000
./venv/bin/python -m pytest tests -q            # pytest.ini uses --reuse-db
```

## Layout
```
quicksplit/settings.py   config: DB, CORS, JWT lifetime, AI keys, upload/dataset dirs
quicksplit/urls.py       root urls; api app mounted under /api/v1, plus /, /health, /docs, /admin
quicksplit/celery.py     celery app (no tasks registered yet)
api/models.py            11 models (below)
api/views.py             ~29 APIView classes (~1100 lines) — all endpoints
api/serializers.py       DRF serializers
api/services.py          business logic: FileService, OCRService, BalanceService,
                         ShareCalculationService, UPIService, QRService
api/urls.py              endpoint → view mapping (read this for the exact route list)
api/admin.py             10 models registered with custom admin
tests/                   pytest suite (auth, split, ocr, dataset, cors) + conftest fixtures
```

## Data model (`api/models.py`)
- **User** — extends `AbstractUser`; **UUID PK**, unique `email`, `phone_number`, `name`,
  `avatar_color`, `upi_id`. Login works by email *or* phone.
- **Friendship** — requester/addressee + `status` (pending/accepted/blocked), unique pair.
- **SplitGroup** / **GroupMember** — groups with categories (home/trip/couple/work/other);
  members have `role` (admin/member); soft-delete via `is_active`.
- **Expense** / **ExpenseShare** — expense has `paid_by`, `split_type`
  (equal/exact/percentage/shares), category, currency (INR); one ExpenseShare per participant
  with `amount_owed` + `is_settled`.
- **Settlement** — recorded payment from_user → to_user, optional `upi_transaction_id`.
- **Comment** (on expenses) / **GroupMessage** (group chat).
- **Split** / **Participant** — the original OCR→UPI bill-split flow (separate from the
  Expense/group system).
- **DatasetEntry** — OCR training data (image hash dedupe, `is_verified` ∈ {-1,0,1}).

## API surface (all under `/api/v1`, all `IsAuthenticated` except auth/docs)
Read `api/urls.py` for the authoritative list. Groups:
`auth/{register,login,me}` · `ocr/{upload,validate}` · `splits/*` · `dataset/{submit,stats}` ·
`friends/*` + `users/search` · `groups/*` (+ `members`, `balances`, `chat`, `import`) ·
`expenses/*` (+ `comments`) · `balances/` · `settlements/` · `activity/` · `ai/chat/`.

## Conventions & gotchas
- **JWT:** access token lifetime is `ACCESS_TOKEN_EXPIRE_MINUTES` (default **7 days**). Header
  is `Authorization: Bearer <token>`.
- **Balances:** positive = the other party owes the user; negative = the user owes. Debt
  simplification (greedy, min-transaction) lives in `BalanceService._simplify_debts()`.
- **OCR:** server-side `OCRService.process_image()` is intentionally a **stub** — real OCR runs
  in the browser/app (Tesseract). The endpoint validates + stores the upload and returns a
  shaped response.
- **AI chat (`AIChatView`)** tries providers in order **Groq → Gemini → Anthropic → OpenAI**,
  using whichever key is set. Anthropic model id is `claude-haiku-4-5-20251001`. Builds context
  from the user's recent expenses; caps output ~300 tokens. (Gemini keys must start with `AIza`.)
- **CORS:** dev origins (`localhost:3000/5173`) are allowlisted; override via `CORS_ORIGINS`.
- All multi-step writes use `transaction.atomic()`.

## ⚠️ Known bugs to fix (see root roadmap)
1. Recording a Settlement does **not** flip the related `ExpenseShare.is_settled`.
2. `GroupBalanceView` does not verify the caller is a group member.
3. An Expense can be created with **zero participants**.
Add regression tests under `tests/` when fixing.

## Config / env
Settings read from `backend/.env` (see `.env.example`). Key vars: `SECRET_KEY`, `DEBUG`,
`ALLOWED_HOSTS`, `DATABASE_URL` (+ `DATABASE_POOL_MODE`/`DATABASE_SSL`), `CORS_ORIGINS`,
`ACCESS_TOKEN_EXPIRE_MINUTES`, `UPLOAD_DIR`, `DATASET_DIR`, `MAX_UPLOAD_SIZE`, `REDIS_URL`,
`CELERY_*`, and AI keys `GROQ_API_KEY` / `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`.
