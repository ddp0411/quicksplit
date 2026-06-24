# QuickSplit — Project Reference

> Single consolidated reference for **what QuickSplit is, what's built, and what's left.**
> Absorbs the content of the retired docs (`features_checklist.md`,
> `web_mobile_feature_comparison.md`, `project_status.md`, `Quicksplit UI and features guide.md`).
> For *how to work in the code*, see the `CLAUDE.md` files (root + `backend/` + `frontend/` + `mobile/`).
> Last consolidated: 2026-06-23.

---

## 1. What it is

QuickSplit is a Splitwise-style **expense-splitting app for India**: scan receipts (OCR), split
bills with paisa-accurate rounding, track balances/settlements across friends and groups,
generate **UPI payment links + QR codes**, and get AI-powered finance insights.

Three deployable apps over one shared API:

| App | Path | Stack | Port |
|-----|------|-------|------|
| Backend API | `backend/` | Django 5 + DRF + SimpleJWT (JWT), SQLite dev / Postgres(Supabase) prod | `9000` |
| Web frontend | `frontend/` | React 18 + Vite 5 + Tailwind 3 + Zustand + React Query | `3000` |
| Mobile app | `mobile/` | React Native 0.81 + Expo SDK 54 + React Navigation 7 + NativeWind | Metro `8081` |

Web and mobile are **feature-paired (~100% parity)** and share the design system. Both call the
Django API at `/api/v1`. OCR runs client-side (Tesseract.js / browser); the backend validates +
stores. AI chat is multi-provider (**Groq → Gemini → Anthropic → OpenAI**, first available key wins).

## 2. Design system (current — V2 "Social Casual Dining" rebrand)

- Primary forest green `#1B4332` · Accent orange `#FF6B35` · Light bg `#FFFDF9`
- Dark: bg `#0F1F17`, primary `#22C55E`, card `#1A2E22`, border `#2D4A38`
- Semantic: success `#16A34A`, error `#EF4444`, warning `#F59E0B`
- Fonts: **Playfair Display** (headings/amounts) + **Inter** (body)
- Rule of thumb: **orange = action/CTA**, forest green = brand anchor, red = error/overdue.
- Full living specs: `UI_REFERENCE.md` (pixel-level) and `UX_guide.md` (principles).

> ⚠️ Older docs (now removed) described an **earlier teal `#0F9D94` + Urbanist** design — that is
> obsolete. The palette above is authoritative.

---

## 3. Shipped features (✅ complete on web **and** mobile)

**Auth & Onboarding** — splash + auto-redirect · 5-slide onboarding · login (email/phone +
password) · register · permission setup. *(Google/Apple sign-in buttons are UI-only / non-functional.)*

**Navigation** — bottom tab nav · center "+" action sheet (Add Expense / Scan Bill / Settle Up) ·
reusable Filter Sheet · dark/light/system mode.

**Home dashboard** — time-based greeting + rotating quote · balance strip (Net / Owed / You owe) ·
quick actions · active-groups strip · "who owes you" / "you owe" with Remind & Settle · recent
activity feed · AI insight card · pull-to-refresh · skeleton loaders.

**Friends** — list + search · balance summary chips · filter sheet · swipe actions (Add / Settle /
Remind / Remove) · pending requests (accept/decline) · Friend Detail (expenses + settlements tabs) ·
Add Friend (live search + QR tab).

**Groups** — list + search + category filter pills · Create Group (3-step wizard) · Group Detail
(category gradient hero, stat row, quick actions, analytics card, members) · Group Insights
(member bars, category donut, settlement plan) · **group chat** (10s polling) · member management ·
invite link · **Import from Splitwise** (CSV → `POST /groups/import/`).

**Expenses** — Add Expense (chip participant picker, category grid, ₹ amount, paid-by, date, notes,
recurring, group context) · 4 split types (**equal / exact / percentage / shares**) · per-person
amount display · Expense Detail (shares breakdown, comments, emoji reactions, receipt CTA, delete).

**Settlement & payments** — Settle Up (UPI method tabs GPay/PhonePe/Paytm/Cash/Other, amount,
notes, txn ID, AI suggestion card, success screen) · UPI deep links + QR · Balances page · Activity feed.

**Personal / AI finance hub** — Personal tab · AI Chat (real multi-provider backend, expense
context, suggestion chips, typing indicator, online/unavailable badge) · Budget Dashboard (ring +
category bars + OVER/NEAR/ON-TRACK badges) · Spending Insights (donut + date filters) ·
Subscription Tracker.

**Account & settings** — Account hub · Edit Profile (8-color avatar, name, UPI, phone) ·
Appearance · Notifications · Security (change password, JWT-based session info) · Pro Upgrade ·
Referral · Import Splitwise · QR Code (My Code + Scan tabs).

**OCR / scan flow** — Scan (camera + gallery) → Split (edit detected total) → Review → History.

**Design polish (V2 rebrand items, all done)** — token migration · Playfair/Inter fonts · orange
CTAs · rebranded nav · balance hero redesign · stacked member avatars · badge system
(Unsettled/Settled/You-paid/Owes-you/Overdue) · illustrated empty states · toast system ·
sparkline trend charts · per-person "₹X each" · dark-mode forest-green tokens.

### Known parity gaps (minor, also incomplete on web)
- OCR **sample-receipt loader** (mobile) — camera/gallery flow works regardless.
- **Google/Apple OAuth** — UI buttons only on both platforms; OAuth not implemented.

---

## 4. Remaining work

### In progress (uncommitted) — mobile navigation redesign
Files: `mobile/src/navigation/RootNavigator.tsx`, `screens/HomeScreen.tsx`, `FriendsScreen.tsx`,
`GroupsScreen.tsx`. Centralizes the "+" action sheet into the tab bar's center button (removes
HomeScreen's per-screen FAB) and switches tab icons to minimalist glyphs (⌂ ♙ ◇ ✦ ○).
**Finish, typecheck, verify on a simulator, and commit first.**

### Known backend bugs (fix with regression tests)
1. Recording a Settlement does **not** flip `ExpenseShare.is_settled`.
2. `GroupBalanceView` lacks a group-membership check.
3. An Expense can be created with **zero participants**.

### Phase 9 polish (web, not started)
`QRSheet` component (blocks Account QR row) · page/route transition animations · skeleton-loading
audit across all data screens · pull-to-refresh on Friends/Groups/Activity · richer empty states ·
final clean TypeScript build pass.

### V2 backlog (21 features — intentionally deferred)
Guest mode · Phone OTP login · Voice AI assistant · Multi-currency w/ live rates · Export reports
(CSV/PDF/Excel) · Haptic feedback · Home-screen widgets · Recurring auto-detection · Global expense
search · Gamification/badges · Smart auto-categorization · AI fraud detection · Long-term ledger ·
Travel mode · Bank-SMS detection · Spending heatmap · Advanced batch settlement · Multi-device
session management · Email parsing · Analytics tab · Wallet section.

---

## 5. Status snapshot

| Area | State |
|------|-------|
| Backend API (models, ~29 endpoints, JWT, AI, UPI/QR, debt simplification) | ✅ Complete; pytest suite passing |
| Web frontend (Phases 1–8) | ✅ Complete; Phase 9 polish + `QRSheet` pending |
| Mobile app | ✅ v1 at ~100% web parity; nav redesign in progress |
| Web ↔ Mobile parity | ~100% (only the 2 minor gaps above) |

## 6. Where to find things

| Need | File |
|------|------|
| Run / verify / conventions per app | `CLAUDE.md`, `backend/CLAUDE.md`, `frontend/CLAUDE.md`, `mobile/CLAUDE.md` |
| Quick start + setup | `README.md`, `GUIDE.md` |
| AI / DB / external keys | `API_KEYS.md` |
| Dev URLs, admin login, DB details | `DEVLINKS.md` |
| Pixel-level design spec | `UI_REFERENCE.md` |
| UX principles & design system | `UX_guide.md` |
| Architecture / DB / Supabase / handoff | `docs/` |
