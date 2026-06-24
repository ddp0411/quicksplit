# QuickSplit — Project Guide (CLAUDE.md)

QuickSplit is a Splitwise-style expense-splitting app for India. It scans receipts (OCR),
splits bills with paisa-accurate rounding, tracks balances/settlements across friends and
groups, generates **UPI payment links + QR codes**, and includes an AI finance assistant.

This is a **monorepo with three deployable apps that share one backend API**:

| App | Path | Stack | Port | Status |
|-----|------|-------|------|--------|
| Backend API | `backend/` | Django 5 + DRF + SimpleJWT | `9000` | ✅ Complete |
| Web frontend | `frontend/` | React 18 + Vite 5 + Tailwind | `3000` | ✅ ~Complete |
| Mobile app | `mobile/` | React Native 0.81 + Expo SDK 54 | Metro `8081` | ✅ v1, active dev |

The web and mobile apps are intentionally **feature-paired** (~100% parity) and share the
same design system. Both talk to the same Django API at `/api/v1`.

> Each app has its own `CLAUDE.md` with stack-specific detail:
> [`backend/CLAUDE.md`](backend/CLAUDE.md) · [`frontend/CLAUDE.md`](frontend/CLAUDE.md) · [`mobile/CLAUDE.md`](mobile/CLAUDE.md)

---

## Repo layout

```
backend/        Django REST API (the single source of truth for data)
frontend/       React + Vite web app (browser OCR via Tesseract.js)
mobile/         React Native + Expo app (the focus of current work)
docs/           system-design, db architecture, supabase setup, OpenAPI dump, handoff notes
scripts/        setup + start-dev shell scripts
dataset/        OCR training/validation images + entries
UI Images/      ~44 reference screenshots of the intended UI
UI_REFERENCE.md 3200-line pixel-level design spec for every screen/component
docker-compose.yml  full stack: postgres + redis + backend + celery + frontend
```

## How to run

```bash
# Backend (terminal 1)
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:9000     # API at http://localhost:9000

# Web frontend (terminal 2)
cd frontend && npm install && npm run dev      # http://localhost:3000

# Mobile (terminal 3)
cd mobile && npm install && npx expo start      # press i / a, or scan QR
```

- Everything at once: `./scripts/start-dev.sh`
- Full stack in Docker: `docker-compose up --build`
- API docs (Swagger): `http://localhost:9000/docs` · Django admin: `http://localhost:9000/admin/`
- Credentials, admin login, and DB details live in `DEVLINKS.md` (gitignored secrets).

## Verify

```bash
cd backend && ./venv/bin/python -m pytest tests -q   # backend test suite
npm --prefix frontend run build                       # TS typecheck + Vite build
cd mobile && npx tsc --noEmit                          # mobile typecheck
```

---

## Cross-cutting conventions

**Design system (V2 "moodboard" rebrand — this is current):**
- Primary: forest green `#1B4332` · Accent: orange `#FF6B35`
- Light: bg `#FFFDF9`, card `#FFFFFF`, border `#E7E5E4`, text `#111827`
- Dark: bg `#0F1F17`, primary `#22C55E`, card `#1A2E22`, border `#2D4A38`, text `#F9FAFB`
- Semantic: success `#16A34A`, error `#EF4444`, warning `#F59E0B`
- Fonts: **Playfair Display** (headings/amounts), **Inter** (body)
- The same tokens exist in `frontend/tailwind.config.js` + CSS vars and `mobile/src/theme/useTheme.ts`. Keep web and mobile in sync.

**Money & balances:**
- Currency is **INR**; amounts are `Decimal(12,2)` server-side, formatted as `₹` in the UI.
- Balance convention everywhere: **positive = others owe you, negative = you owe them.**
- Equal splits distribute the paisa remainder deterministically (no lost/created money).

**Auth:** JWT (SimpleJWT). Mobile stores the token in AsyncStorage (Zustand persist); web in
localStorage. Both send `Authorization: Bearer <token>` and log out on a `401`.

**State/data fetching (web + mobile):** Zustand for client state, TanStack React Query for
server state (5-min stale time, 1 retry).

---

## Current state

- **Backend:** all models, ~29 endpoints, JWT, multi-provider AI chat, UPI/QR, debt
  simplification, Docker — done. pytest suite passes.
- **Web:** Phases 1–8 complete (auth, nav, friends, groups, expense/settle, AI finance hub).
  Phase 9 "polish" not started; one missing component (`QRSheet`).
- **Mobile:** v1 complete at ~100% web parity. **Active uncommitted work** = a navigation
  redesign (see below).

### In progress (uncommitted) — navigation redesign
4 modified files: `mobile/src/navigation/RootNavigator.tsx`, `screens/HomeScreen.tsx`,
`screens/FriendsScreen.tsx`, `screens/GroupsScreen.tsx`. The center "+" action sheet is being
moved **out of individual screens into a shared center-tab action sheet** in `RootNavigator`
(HomeScreen's local FAB/modal is deleted), and tab icons switch from emoji to minimalist
glyphs (⌂ ♙ ◇ ✦ ○). **Finish and commit this before starting other work.**

### Known backend bugs (deferred, documented in `project_status.md`)
- Settlement does not clear `ExpenseShare.is_settled`.
- `GroupBalanceView` lacks a group-membership check.
- An expense with zero participants is currently allowed.

---

## ⚠️ Known doc drift (don't trust these blindly)

Several older `.md` files predate the current code. **This CLAUDE.md and the actual source are
authoritative.** When they conflict, trust the code.

- `project_status.md` / `Quicksplit UI and features guide.md` describe the **old** teal
  `#0F9D94` + Urbanist design. The app was rebranded to forest-green/orange + Playfair/Inter.
  Their *phase tracking* is still useful; their *design tokens* are stale.
- `mobile/AGENTS.md` says to read **Expo v56** docs, but `mobile/package.json` pins
  **Expo SDK 54** (`^54.0.35`). Use the SDK 54 docs unless/until the package is upgraded.

## Roadmap (next up)

1. **Finish the mobile navigation redesign** (the 4 uncommitted files), then verify on
   device/simulator and commit.
2. Fix the three known backend bugs above (with regression tests).
3. Phase 9 polish: `QRSheet`, page/screen transitions, skeleton audit, pull-to-refresh,
   richer empty states.
4. Deployment (to be planned separately): hosting, prod env, build pipelines.
