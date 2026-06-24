# Web Frontend — QuickSplit (CLAUDE.md)

React 18 + TypeScript + Vite SPA. Browser client for the QuickSplit API. Feature-paired with
the mobile app (`../mobile`) — keep the two in sync. See root [`../CLAUDE.md`](../CLAUDE.md) for
shared conventions and the design system.

## Stack
- React `18.3`, TypeScript `5.3`, Vite `5`
- Routing: `react-router-dom` v6 (~38 routes/pages)
- Client state: **Zustand** `4` (persisted) · Server state: **TanStack React Query** `5`
- HTTP: `axios` · Forms: `react-hook-form` + `zod`
- Styling: **Tailwind** `3` + CSS variables (dark mode) · UI: `@headlessui/react`, `@heroicons/react`
- Animation: `framer-motion` · **Browser OCR: `tesseract.js`** · QR: `qrcode.react` · scan: `jsqr`, `react-webcam`

## Run / build
```bash
npm install
npm run dev                 # http://localhost:3000 (Vite)
npm run build               # tsc typecheck + production build  ← use this to verify
npm run lint                # eslint, --max-warnings 0
```
API base URL comes from `VITE_API_URL` (e.g. `http://localhost:9000/api/v1`); see `.env.example`.

## Layout (`src/`)
```
pages/         ~38 screens (auth, friends, groups, expenses, settle, personal/AI, account, OCR)
components/    layout/ (Navbar, BottomNav) · ui/ (Button, Badge, Toast, FilterSheet,
               ActionSheet, ConfirmDialog, Skeleton*, SettingsRow, …) · ocr/ · payments/
state/         Zustand stores (user/auth, theme, notifications)
routes/        AppRoutes.tsx — central route table
styles/        index.css — Tailwind layers + dark-mode CSS variables
app/           ThemeProvider, providers
utils/         theme.ts (applyTheme), helpers
```

## Conventions
- **Design tokens** live in `tailwind.config.js` (extended `primary`/`accent` scales) and CSS
  variables in `src/styles/index.css` (`--bg`, `--card`, `--border`, `--text`, `--text-muted`).
  Dark mode toggles the `dark` class on `<html>` via `ThemeProvider` + `applyTheme()`.
  Current palette: forest green `#1B4332` + orange `#FF6B35`, Playfair Display + Inter.
- **Auth:** JWT stored in localStorage (Zustand persist); axios attaches `Bearer`, logs out on 401.
- **Data:** React Query (5-min stale, 1 retry). Prefer query keys per resource; mutate + invalidate.
- **OCR is client-side** (Tesseract.js + canvas preprocessing). The backend only validates/stores.
- Mobile mirrors these screens — when you add/rename a feature here, mirror it in `../mobile`.

## Status / gaps
- Phases 1–8 complete (design system, auth/onboarding, nav + action sheet, account/settings,
  friends, groups, expense/settle, AI finance hub).
- **Phase 9 polish not started**; the `QRSheet` component (`src/components/ui/QRSheet.tsx`) is
  still missing and blocks the Account-tab QR row.
- Google/Apple OAuth buttons are UI-only (non-functional), same as mobile.

> ⚠️ `../project_status.md` still references the old teal `#0F9D94` + Urbanist design and old
> file names — its design tokens are stale (the app was rebranded). Trust the code + root
> CLAUDE.md. Its phase tracking is still a useful reference.
