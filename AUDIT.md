# QuickSplit — Master Audit, Fix & Redesign Report

**Date:** 2026-06-30
**Scope:** Mobile + Web + Backend
**Outcome:** Audit → critical fixes → HIGH fixes → navigation restructure → Atlantic Blue rebrand → auth hardening → committed, merged (PR #1, `ea5dc8b`), and shipped to APK.

---

## 0. Executive summary

QuickSplit is a Splitwise-style, India-first expense-splitting monorepo: a Django 5 + DRF + SimpleJWT
backend (the single source of truth), a React 18 + Vite web app, and a React Native 0.81 + Expo SDK 54
mobile app (the focus of this effort).

The audit found the backend fundamentally sound (models, ~29 endpoints, tests passing) but with three
auth/data gaps; the mobile app functional but with **stale-data bugs**, **broken cross-stack navigation**
(could not add expenses or settle inside groups), and an outdated visual identity. This report documents
what was found, what was fixed, and the rebrand to **Atlantic Blue**.

All explicitly requested work is complete and merged to `main`.

### Premises in the original prompt that were stale (corrected during audit)
- **"3 known backend bugs" were already fixed.** Settlement clearing `ExpenseShare.is_settled`,
  `GroupBalanceView` membership check, and zero-participant expense rejection already had passing
  regression tests. The docs (`project_status.md`) were stale; the code was authoritative.
- **Expo is SDK 54, not 56.** `mobile/AGENTS.md` referenced Expo v56 docs; `mobile/package.json` pins
  `^54.0.35`. SDK 54 docs were used.
- **Some referenced files did not exist** (e.g. `mobile/src/constants/colors.ts`). Theme tokens live in
  `mobile/src/theme/useTheme.ts`.

---

## 1. Audit findings

### 1.1 Mobile — Critical (blocking core flows)

| # | Finding | Impact | Root cause |
|---|---------|--------|------------|
| M1 | **New expense doesn't appear** after adding | Users think the add failed | Query-key mismatch (`['balance-overview']` vs `['balances']`) + no refetch on screen focus |
| M2 | **Cannot add an expense inside a group** | Core group flow broken | `AddExpense` not registered in `GroupsStack`; cross-stack `navigate()` target missing |
| M3 | **Cannot settle inside a group** | Core group flow broken | `SettleUp` not registered in `GroupsStack`; no group-aware preset (amount / `group_id`) |
| M4 | Friend detail showed wrong/empty expenses | Misleading balances | Client-side filter instead of server `?with_user=` |
| M5 | Activity feed icon never matched | Cosmetic but pervasive | Compared against `'expense_added'`; API emits `'expense'` |

### 1.2 Mobile — High (UX / correctness)

| # | Finding | Resolution |
|---|---------|------------|
| H1 | No spending-insights surface on Home | Added "This month's spending" card |
| H2 | AI assistant occupied a whole tab | Replaced with a floating round AI button above the tab bar |
| H3 | 5th tab had no personal value | Rebuilt as **Personal** monthly-expenses view (grouped by month, descending, no per-row dates, year/month filter defaulting to all/all) |
| H4 | No back button from Tools (Personal hub) | Added header back button |
| H5 | Date rendering showed spurious "5:30 am" | `formatDate` is now date-only (UTC-midnight → IST bug) |
| H6 | Stale lists across screens | `useFocusEffect` refetch added on Home/Friends/Groups/Activity/Detail screens |

### 1.3 Backend — Hardening gaps

| # | Finding | Resolution |
|---|---------|------------|
| B1 | No refresh-token endpoint / silent renewal | Added `POST /auth/refresh` (`TokenRefreshView`) |
| B2 | No server-side logout / token revoke | Added `POST /auth/logout` (`TokenBlacklistView`) + `token_blacklist` app |
| B3 | No rotation/blacklist policy | `ROTATE_REFRESH_TOKENS=True`, `BLACKLIST_AFTER_ROTATION=True`, access 60 min / refresh 7 days |
| B4 | `?with_user=` expense filter unverified | Added filter in `ExpenseListView` + regression test |
| B5 | Auth response lacked refresh token | `token_response` + `TokenResponseSerializer` now return `refresh_token` |

### 1.4 Design

- Visual identity predated requirements (forest-green/orange V2, Playfair/Inter). Approved direction is
  **Atlantic Blue** with **Plus Jakarta Sans**, applied to mobile + web in sync.

---

## 2. Fixes applied

### 2.1 Mobile navigation restructure (`RootNavigator.tsx`)
- Registered shared screens (`AddExpense`, `SettleUp`, `ExpenseDetail`) inside **both** `FriendsStack`
  and `GroupsStack` so group/friend flows can reach them without leaving their stack.
- Tab bar auto-hides on deep screens via `getFocusedRouteNameFromRoute` (`tabBarStyle: display:'none'`
  when not on a root screen).
- Renamed the AI tab → **Personal**; `PersonalMain` = `MonthlyExpensesScreen`, `PersonalHub` =
  `PersonalScreen` (Tools).
- **Floating AI button** above the tab bar (`styles.aiFab`), driven by an `activeRoute` listener on the
  navigation ref; opens chat via `navigate('Personal', { screen: 'AIChat' })`.

### 2.2 Data freshness
- Standardized the balance query key to `['balances']`; added broad invalidations on expense create
  (expenses / balances / groups / group-balances / activity / friends); `useFocusEffect` refetch across
  list and detail screens.

### 2.3 New screen — `MonthlyExpensesScreen.tsx`
- `SectionList` grouping personal expenses by month, descending, **month headers only (no per-row dates)**.
- Year + month filter pills defaulting to **all / all**; rows open `ExpenseDetail`; amount shows
  `your_share`.

### 2.4 Auth (silent refresh)
- `axiosClient` does single-flight refresh-on-401 (`refreshPromise`, `isAuthPath()` guard), retries the
  original request with the new access token, logs out on hard failure.
- `userStore` holds `refreshToken` + `setTokens`; `useAuth.logout` is best-effort server revoke then local
  clear; login/register persist `refresh_token`.

### 2.5 Backend
- `urls.py`: `auth/refresh`, `auth/logout`. `settings.py`: `token_blacklist` app + SIMPLE_JWT rotation
  policy. `views.py`: `?with_user=` filter + refresh token in auth response. Tests:
  `test_expenses_with_user_filter`, `test_refresh_and_logout_flow`.

---

## 3. Atlantic Blue redesign

**Palette**

| Token | Value | Use |
|-------|-------|-----|
| Primary | `#0F4B70` | headers, primary surfaces |
| Bright Blue (CTA) | `#0466C8` | primary actions |
| Soft Sky Blue | `#C4F8FF` | accents / highlights |
| White Convolvulus | `#F5F2F3` | app background |
| Card border (light) | `#C4DFEF` | dividers |

- **Font:** Plus Jakarta Sans (`@expo-google-fonts/plus-jakarta-sans`, weights 400–800).
- **Semantic colors preserved:** "others owe you" stays green (`#22C55E` / `#16A34A`); "you owe" red.
- Applied across `mobile/src/theme/useTheme.ts` (LIGHT + DARK), `App.tsx` font loading,
  `frontend/tailwind.config.js`, and `frontend/src/styles/index.css` — web + mobile kept in sync.

---

## 4. Verification

| Check | Command | Result |
|-------|---------|--------|
| Backend tests | `pytest tests -q` | ✅ 18 passing |
| Mobile typecheck | `npx tsc --noEmit` | ✅ clean |
| Web build/typecheck | `npm --prefix frontend run build` | ✅ clean |
| APK | EAS preview build | ✅ [download](https://expo.dev/artifacts/eas/4unFgCh5fsMPbrBsHbNcO0cqAii6CbZ47wkXba6IjgA.apk) |

---

## 5. Delivery

- **Branch:** `atlantic-rebrand-and-fixes` → **PR #1 merged** into `main` (merge commit `ea5dc8b`,
  squash of `c7b8013`).
- **Backend deploy:** merging `main` triggers Railway, which runs `migrate` on start (creates
  `token_blacklist` tables) — live API now matches the APK.

---

## 6. Recommended next steps (not yet done)

1. **On-device QA** of the rebrand (light + dark), Personal tab, and floating AI button.
2. Confirm the Railway deploy went green (only externally-verifiable item).
3. Refresh stale planning docs (`project_status.md`, `Quicksplit UI and features guide.md`,
   `mobile/AGENTS.md`) to match current code.
4. Web Phase 9 polish (`QRSheet`, transitions, skeleton/empty-state audit, pull-to-refresh).
