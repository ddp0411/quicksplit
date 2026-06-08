# QuickSplit — Developer Links & Credentials

> Save this file. All local dev URLs, login credentials, and database tables in one place.

---

## Django Admin Panel

| Field | Value |
|-------|-------|
| URL | http://127.0.0.1:8000/admin/ |
| Username | `admin` |
| Password | `admin123` |
| Email | `admin@quicksplit.com` |

Start the backend first, then open the URL above in a browser.

---

## Backend (Django REST API)

| Field | Value |
|-------|-------|
| Base URL | `http://127.0.0.1:8000/api/v1/` |
| Auth endpoint | `http://127.0.0.1:8000/api/v1/auth/login/` |
| Swagger / Browse | `http://127.0.0.1:8000/api/v1/` (DRF browsable API) |

**Start backend:**
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

---

## Frontend (React Web)

| Field | Value |
|-------|-------|
| URL | http://localhost:5173 |
| Framework | Vite + React 18 |

**Start frontend:**
```bash
cd frontend
npm run dev
```

---

## Mobile (React Native / Expo)

| Field | Value |
|-------|-------|
| Dev server | `exp://192.168.x.x:8081` (shown in terminal after `npx expo start`) |
| Framework | Expo SDK 56 + React Native |

**Start mobile:**
```bash
cd mobile
npx expo start
```

Scan QR code with Expo Go app on your phone.

---

## Database (PostgreSQL)

| Field | Value |
|-------|-------|
| Database name | `quicksplit` |
| Host | `localhost` |
| User | `devanshupatil` (your macOS username) |
| Connection string | `postgresql://devanshupatil@localhost/quicksplit` |

**Connect with psql:**
```bash
psql quicksplit
```

---

## Database Tables (Django Admin sections)

The following tables are registered and visible in the Django admin panel at `/admin/`:

| Admin Section | Model | What it stores |
|---------------|-------|----------------|
| **API › Users** | `User` | All registered users (email, name, UPI ID, avatar color) |
| **API › Split Groups** | `SplitGroup` | Groups (name, category, creator, members inline) |
| **API › Group Members** | `GroupMember` | Who is in which group + their role (admin/member) |
| **API › Expenses** | `Expense` | Every expense (amount, category, paid by, split type, date) |
| **API › Expense Shares** | `ExpenseShare` | Per-user share for each expense (amount\_owed, settled flag) |
| **API › Settlements** | `Settlement` | Payment records between users (amount, UPI ID, method) |
| **API › Comments** | `Comment` | Comments on expenses |
| **API › Friendships** | `Friendship` | Friend requests (pending/accepted/blocked) |
| **API › Group Messages** | `GroupMessage` | Group chat messages |
| **API › Splits** | `Split` | OCR scan → split sessions |
| **API › Participants** | `Participant` | Per-person amounts within a Split session |
| **API › Dataset Entries** | `DatasetEntry` | OCR training data (receipt images + verified totals) |

---

## AI API Keys — where to put them

File: `backend/.env`

```env
# AI Chat — Groq is free, Gemini is free (pick at least one)
# Priority order: Groq → Gemini → Anthropic → OpenAI

GROQ_API_KEY=gsk_...        # free — console.groq.com
GEMINI_API_KEY=AIza...      # free — aistudio.google.com  ← must start with AIza
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

> **Note:** Google AI Studio now issues keys with the `AQ.` prefix (newer format). Both `AIza...` and `AQ....` keys from `aistudio.google.com` are valid.

---

## Current Registered App Users

| Username / Email | Role | Notes |
|-----------------|------|-------|
| `admin` | Superuser | Django admin login |
| `devanshupatil1712@gmail.com` | Regular user | App test account |

---

## Key API Endpoints

| Endpoint | Method | What it does |
|----------|--------|--------------|
| `/api/v1/auth/register/` | POST | Create account |
| `/api/v1/auth/login/` | POST | Get JWT token |
| `/api/v1/auth/me/` | GET/PATCH | Current user profile |
| `/api/v1/groups/` | GET/POST | List / create groups |
| `/api/v1/groups/import/` | POST | Import Splitwise CSV |
| `/api/v1/groups/<id>/` | GET/PATCH/DELETE | Group detail |
| `/api/v1/groups/<id>/balances/` | GET | Who owes who |
| `/api/v1/groups/<id>/chat/` | GET/POST | Group chat |
| `/api/v1/expenses/` | GET/POST | List / create expenses |
| `/api/v1/expenses/<id>/` | GET/DELETE | Expense detail |
| `/api/v1/friends/` | GET | Friends list |
| `/api/v1/friends/request/` | POST | Send friend request |
| `/api/v1/settlements/` | POST | Record a payment |
| `/api/v1/ai-chat/` | POST | AI assistant (uses real expense data) |
| `/api/v1/splits/scan/` | POST | OCR receipt scan |
| `/api/v1/splits/history/` | GET | Past OCR scans |
| `/api/v1/balances/overall/` | GET | Net balance summary |
| `/api/v1/activity/` | GET | Activity feed |
