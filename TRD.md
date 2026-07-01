# QuickSplit — Technical Requirements Document (TRD)

**Version:** 1.0
**Last updated:** 2026-07-01
**Owner:** Devanshu Patil
**Status:** Backend complete · Web ~complete (Phase 9 polish pending) · Mobile v1 (active development)

---

## 1. Overview

QuickSplit is a Splitwise-style expense-splitting application built for the Indian market. It
scans receipts (OCR), splits bills with paisa-accurate rounding, tracks balances and settlements
across friends and groups, generates **UPI payment links + QR codes**, and provides an AI finance
assistant.

The system is a **monorepo of three deployable clients sharing one backend API**. The Django REST
API is the single source of truth; the web and mobile apps are intentionally feature-paired
(~100% parity) thin clients that talk to the same `/api/v1` surface.

| App | Path | Stack | Port | Status |
|-----|------|-------|------|--------|
| Backend API | `backend/` | Django 5 + DRF + SimpleJWT | `9000` | ✅ Complete |
| Web frontend | `frontend/` | React 18 + Vite 5 + Tailwind 3 | `3000` | ✅ ~Complete |
| Mobile app | `mobile/` | React Native 0.81 + Expo SDK 54 | Metro `8081` | ✅ v1, active dev |
| Landing site | `landing/` | Static HTML/CSS | — | ✅ Marketing/legal pages |

---

## 2. Architecture at a glance

```
                    ┌──────────────────────────────┐
   Web (React SPA)  │                              │
   ───────────────► │                              │
                    │   Django REST Framework API   │──► PostgreSQL / Supabase (prod)
   Mobile (Expo)    │        /api/v1  (JWT)         │──► SQLite (dev)
   ───────────────► │                              │
                    │   Redis + Celery (scaffold)   │──► Redis (broker/result)
   Landing (static) └──────────────────────────────┘
                              │
                              └──► AI providers: Groq → Gemini → Anthropic → OpenAI
```

- **Auth:** JWT (SimpleJWT). Every client sends `Authorization: Bearer <token>` and logs out on `401`.
- **State model (web + mobile):** Zustand for client state, TanStack React Query for server state
  (5-min stale time, 1 retry).
- **OCR:** runs **client-side** (Tesseract.js in browser / Expo camera pipeline on mobile). The
  server-side `OCRService.process_image()` is a stub that validates and stores the upload.
- **Money:** currency is **INR**; amounts are `Decimal(12,2)` server-side, formatted as `₹`. Balance
  convention everywhere: **positive = others owe you, negative = you owe them.**

---

## 3. Backend — Django REST API (`backend/`)

The single source of truth for all data.

### 3.1 Core framework & language
| Component | Technology | Version |
|-----------|-----------|---------|
| Language | Python | 3.12 (Docker) / 3.11+ |
| Web framework | Django | `5.0.14` |
| API framework | Django REST Framework | `3.15.2` |
| Auth | `djangorestframework-simplejwt` | `5.3.1` (+ `PyJWT 2.13`) |
| API schema / docs | `drf-spectacular` | `0.27.2` (Swagger at `/docs/`) |
| CORS | `django-cors-headers` | `4.3.1` |
| Static files | `whitenoise` | `6.8.2` |
| WSGI server (prod) | `gunicorn` | `23.0.0` |

### 3.2 Data layer
| Component | Technology | Notes |
|-----------|-----------|-------|
| Dev database | **SQLite** | `db.sqlite3` |
| Prod database | **PostgreSQL / Supabase** | via `DATABASE_URL`; note dev also points at shared Supabase Postgres |
| DB config helper | `dj-database-url` | `2.1.0` |
| Postgres drivers | `psycopg` `3.1.18`, `psycopg2-binary` `2.9.12`, `asyncpg` `0.29.0` | |
| ORM extras | `SQLAlchemy 2.0.23`, `alembic 1.12.1` | present in deps (secondary/legacy tooling) |

### 3.3 Async / background processing
| Component | Technology | Version | Status |
|-----------|-----------|---------|--------|
| Task queue | `celery` | `5.3.6` | Configured (broker/result set), **no tasks defined yet — scaffolding only** |
| Broker / result backend | `redis` | `5.0.1` | `CELERY_BROKER_URL` / `CELERY_RESULT_BACKEND` |

### 3.4 Domain-specific libraries
| Purpose | Library | Version |
|---------|---------|---------|
| Image handling | `Pillow` | `10.2.0` |
| OCR (server stub) | `pytesseract` | `0.3.10` |
| UPI QR generation | `qrcode` | `7.4.2` (+ `pypng`) |
| Crypto/JWT | `cryptography`, `python-jose`, `rsa`, `ecdsa` | — |

### 3.5 AI providers (multi-provider chat)
`AIChatView` tries providers **in order until a key is set**: **Groq → Gemini → Anthropic → OpenAI.**

| Provider | SDK | Version | Notes |
|----------|-----|---------|-------|
| Anthropic | `anthropic` | `0.107.0` | model id `claude-haiku-4-5-20251001` |
| OpenAI / Groq | `openai` | `2.41.0` | Groq via OpenAI-compatible endpoint |
| Google Gemini | (HTTP via `httpx`) | — | **keys must start with `AIza`** |

Context is built from the user's recent expenses; output capped at ~300 tokens.

### 3.6 Testing
| Component | Technology | Version |
|-----------|-----------|---------|
| Test runner | `pytest` | `8.0.0` |
| Django integration | `pytest-django` | `4.8.0` (`--reuse-db`) |
| Async tests | `pytest-asyncio` | `0.21.1` |

Run: `./venv/bin/python -m pytest tests -q`

### 3.7 Data model (`api/models.py`, 11 models)
- **User** — extends `AbstractUser`; **UUID PK**, unique `email`, `phone_number`, `name`,
  `avatar_color`, `upi_id`. Login by email *or* phone.
- **Friendship** — requester/addressee + `status` (pending/accepted/blocked), unique pair.
- **SplitGroup** / **GroupMember** — categories (home/trip/couple/work/other); member `role`
  (admin/member); soft-delete via `is_active`.
- **Expense** / **ExpenseShare** — `paid_by`, `split_type` (equal/exact/percentage/shares),
  category, currency (INR); one `ExpenseShare` per participant with `amount_owed` + `is_settled`.
- **Settlement** — recorded payment `from_user → to_user`, optional `upi_transaction_id`.
- **Comment** (on expenses) / **GroupMessage** (group chat).
- **Split** / **Participant** — original OCR→UPI bill-split flow (separate from Expense/group system).
- **DatasetEntry** — OCR training data (image-hash dedupe, `is_verified ∈ {-1,0,1}`).

### 3.8 API surface
All under `/api/v1`, all `IsAuthenticated` except auth/docs (~29 `APIView` classes). Groups:
`auth/{register,login,me}` · `ocr/{upload,validate}` · `splits/*` · `dataset/{submit,stats}` ·
`friends/*` + `users/search` · `groups/*` (+ `members`, `balances`, `chat`, `import`) ·
`expenses/*` (+ `comments`) · `balances/` · `settlements/` · `activity/` · `ai/chat/`.

Business logic lives in `api/services.py`: `FileService`, `OCRService`, `BalanceService`,
`ShareCalculationService`, `UPIService`, `QRService`. Debt simplification is greedy/min-transaction
in `BalanceService._simplify_debts()`. All multi-step writes use `transaction.atomic()`.

### 3.9 Key config / env vars
`SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `DATABASE_URL` (+ `DATABASE_POOL_MODE`, `DATABASE_SSL`),
`CORS_ORIGINS`, `ACCESS_TOKEN_EXPIRE_MINUTES` (default 60 min in settings; project convention
targets 7 days), `UPLOAD_DIR`, `DATASET_DIR`, `MAX_UPLOAD_SIZE`, `REDIS_URL`, `CELERY_*`, and AI keys
`GROQ_API_KEY` / `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`.

---

## 4. Web frontend (`frontend/`)

React 18 + TypeScript + Vite SPA. Feature-paired with mobile.

### 4.1 Core
| Component | Technology | Version |
|-----------|-----------|---------|
| Library | React | `18.3.1` |
| Language | TypeScript | `5.3.3` |
| Build tool | Vite | `5.0.11` (`@vitejs/plugin-react`) |
| Routing | `react-router-dom` | `6.20` (~38 routes/pages) |

### 4.2 State, data & forms
| Concern | Technology | Version |
|---------|-----------|---------|
| Client state | **Zustand** (persisted) | `4.5` |
| Server state | **TanStack React Query** | `5.17` (5-min stale, 1 retry) |
| HTTP | `axios` | `1.6.5` |
| Forms | `react-hook-form` + `zod` | `7.50` / `3.22` (`@hookform/resolvers`) |

### 4.3 UI, styling & media
| Concern | Technology | Version |
|---------|-----------|---------|
| Styling | **Tailwind CSS** `3.4` + CSS variables (dark mode) | + `postcss`, `autoprefixer` |
| Component primitives | `@headlessui/react` `2.0`, `@heroicons/react` `2.1` | |
| Animation | `framer-motion` | `11.0` |
| Utilities | `clsx` | `2.1` |
| **Browser OCR** | `tesseract.js` | `5.0.4` |
| QR generate / scan | `qrcode.react` `3.1` / `jsqr` `1.4` | |
| Camera | `react-webcam` | `7.2` |

### 4.4 Tooling
ESLint `8.56` (`@typescript-eslint` `6.19`, `--max-warnings 0`). Build/verify: `npm run build`
(tsc typecheck + Vite build). API base URL from `VITE_API_URL`.

### 4.5 Status
Phases 1–8 complete (design system, auth/onboarding, nav + action sheet, account/settings, friends,
groups, expense/settle, AI finance hub). **Phase 9 polish not started**; `QRSheet` component still
missing. Google/Apple OAuth buttons are UI-only.

---

## 5. Mobile app (`mobile/`)

React Native + Expo. ~100% web parity. **Focus of current active development.**

> **Version note:** `mobile/AGENTS.md` references Expo v56 docs, but `package.json` pins
> **Expo SDK 54**. Treat SDK 54 as authoritative.

### 5.1 Core
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Expo SDK | `54.0.35` |
| Runtime | React Native | `0.81.5` |
| Library | React | `19.1.0` |
| Language | TypeScript | `5.9` |

### 5.2 Navigation & state
| Concern | Technology | Version |
|---------|-----------|---------|
| Navigation | `@react-navigation/native` v7 (bottom-tabs + native-stack) | `7.2` / `7.16` |
| Client state | **Zustand** persisted via `@react-native-async-storage/async-storage` | `5.0` / `2.2` |
| Server state | **TanStack React Query** | `5.101` |
| HTTP | `axios` | `1.17` |
| Forms | `react-hook-form` + `zod` | `7.77` / `4.4` |

### 5.3 UI, media & animation
| Concern | Technology | Version |
|---------|-----------|---------|
| Styling | **NativeWind** `4.2` (Tailwind) + JS theme (`src/theme/useTheme.ts`) | |
| Fonts | Inter, Playfair Display, Plus Jakarta Sans (`@expo-google-fonts`) | |
| Camera / OCR | `expo-camera` `17.0`, `expo-image-picker` `17.0`, `expo-document-picker` `14.0` | |
| QR | `react-native-qrcode-svg` `6.3` + `react-native-svg` `15.12` | |
| Animation / gesture | `react-native-reanimated` `4.1`, `react-native-gesture-handler` `2.28`, `react-native-worklets` `0.5` | |
| Visual FX | `expo-blur`, `expo-linear-gradient` | |
| Deep linking | `expo-linking` | `8.0` |

### 5.4 Build & config
| Concern | Detail |
|---------|--------|
| API base URL | `EXPO_PUBLIC_API_URL` (inlined at build via `eas.json`); dev fallbacks for Android emulator `10.0.2.2:9000`, iOS sim `localhost:9000`, physical device = LAN IP |
| Build profiles | `eas.json`: `development` / `preview` (internal) / `production` (prod URLs are placeholders until backend deployed) |
| Bundle ID | `com.quicksplit.app` (`app.json`) |
| Verify | `npx tsc --noEmit` |

### 5.5 Status
Core flows fully implemented (Home, Friends, Groups, AddExpense, ExpenseDetail, SettleUp,
CreateGroup, GroupDetail, AddFriend, Login/Register, AIChat, EditProfile). `RemainingScreens.tsx`
holds stubs (SubscriptionTracker, SpendingInsights, ProUpgrade, Referral, Scan, Review, OCRHistory,
various Settings). Navigation redesign to centralized tab-bar action sheet is done.

---

## 6. Landing site (`landing/`)

Static marketing + legal site (`index.html`, `privacy.html`, `support.html`, `styles.css`).
Deployed via **Netlify** (`netlify.toml`) or **Vercel** (`vercel.json`).

---

## 7. Design system (V2 "moodboard" rebrand — current)

Shared across web (`tailwind.config.js` + CSS vars) and mobile (`mobile/src/theme/useTheme.ts`);
keep in sync.

- **Primary:** forest green `#1B4332` · **Accent:** orange `#FF6B35`
- **Light:** bg `#FFFDF9`, card `#FFFFFF`, border `#E7E5E4`, text `#111827`
- **Dark:** bg `#0F1F17`, primary `#22C55E`, card `#1A2E22`, border `#2D4A38`, text `#F9FAFB`
- **Semantic:** success `#16A34A`, error `#EF4444`, warning `#F59E0B`
- **Fonts:** Playfair Display (headings/amounts), Inter (body)

> The repo has undergone multiple rebrand explorations (Atlantic Blue, Stitch "Ocean Breeze" on
> mobile). The V2 forest-green/orange tokens above are the documented current cross-cutting system;
> confirm against live theme files when styling.

---

## 8. Infrastructure & DevOps

| Concern | Technology |
|---------|-----------|
| Containerization | Docker + `docker-compose.yml` (full stack) |
| Compose services | `postgres:16-alpine`, `redis:7.2-alpine`, `backend`, `celery_worker`, `celery_beat`, `frontend` |
| Backend prod process | `gunicorn` (`Procfile`: migrate → collectstatic → gunicorn, 3 workers, 120s timeout) |
| Target hosting | Railway (backend) + Supabase (Postgres), per launch strategy |
| API docs | Swagger UI at `:9000/docs`, OpenAPI dump in `docs/api-docs-openapi.json` |

### 8.1 Local development
```bash
# Backend
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && python manage.py migrate
python manage.py runserver 127.0.0.1:9000        # API at http://localhost:9000

# Web
cd frontend && npm install && npm run dev          # http://localhost:3000

# Mobile
cd mobile && npm install && npx expo start          # press i / a, or scan QR

# Everything: ./scripts/start-dev.sh   |   Full Docker stack: docker-compose up --build
```

### 8.2 Verification commands
| App | Command |
|-----|---------|
| Backend | `cd backend && ./venv/bin/python -m pytest tests -q` |
| Web | `npm --prefix frontend run build` (tsc + Vite) |
| Mobile | `cd mobile && npx tsc --noEmit` |

---

## 9. Cross-cutting technical requirements

- **Currency & precision:** INR only; server amounts `Decimal(12,2)`, UI `₹`. Equal splits
  distribute the paisa remainder deterministically (no money lost or created).
- **Balance convention:** positive = others owe you; negative = you owe them (enforced everywhere).
- **Auth lifecycle:** JWT stored in localStorage (web) / AsyncStorage via Zustand persist (mobile);
  `Bearer` on every request; `401` → logout.
- **Feature parity:** web `frontend/src/pages` ↔ mobile `mobile/src/screens` mirror each other;
  changes must be applied to both.
- **Data fetching:** React Query — query keys per resource, mutate + invalidate; 5-min stale, 1 retry.

---

## 10. Known technical debt / open items

- **Backend (documented in `project_status.md`; per memory, several already fixed with tests —
  verify against code):** Settlement not clearing `ExpenseShare.is_settled`; `GroupBalanceView`
  missing group-membership check; expense allowed with zero participants.
- **Celery:** broker/result configured but **no tasks defined** — scaffolding only.
- **Web:** Phase 9 polish (QRSheet, transitions, skeleton audit, pull-to-refresh, empty states).
- **Mobile:** several account/premium/analytics/OCR screens are stubs; on-device visual QA pending.
- **OAuth:** Google/Apple buttons are UI-only on both clients.
- **Doc drift:** older `.md` files reference stale teal/Urbanist design and prior phase tracking —
  trust the code and per-app `CLAUDE.md` files when they conflict.

---

*Generated from source: `requirements.txt`, `frontend/package.json`, `mobile/package.json`,
`docker-compose.yml`, `Procfile`, `settings.py`, and the per-app `CLAUDE.md` files.*
