@AGENTS.md

# Mobile App — QuickSplit (CLAUDE.md)

React Native + Expo app. Feature-paired with the web app (`../frontend`) at ~100% parity.
**This is the focus of current active development.** See root [`../CLAUDE.md`](../CLAUDE.md) for
shared conventions and the design system.

> ⚠️ **Expo version:** `AGENTS.md` (imported above) says read the **v56** docs, but
> `package.json` pins **Expo SDK 54** (`expo@^54.0.35`, React Native `0.81.5`, React `19.1`).
> Treat **SDK 54** as the truth and read `https://docs.expo.dev/versions/v54.0.0/` unless the
> package is actually upgraded.

## Stack
- Expo SDK `54`, React Native `0.81.5`, React `19.1`, TypeScript
- Navigation: `@react-navigation/native` v7 — bottom tabs + native stacks
- Client state: **Zustand** `5` persisted via `@react-native-async-storage/async-storage`
- Server state: **TanStack React Query** `5` · HTTP: `axios`
- Styling: **NativeWind** `4` (Tailwind) + a JS theme (`src/theme/useTheme.ts`)
- Forms: `react-hook-form` + `zod` · Fonts: Inter + Playfair Display (`@expo-google-fonts`)
- Camera/OCR: `expo-camera`, `expo-image-picker`, `expo-document-picker` · QR: `react-native-qrcode-svg`
- Animation/gesture: `react-native-reanimated`, `react-native-gesture-handler`

## Run
```bash
npm install
npx expo start         # then press i (iOS sim) / a (Android emulator), or scan the QR
npx tsc --noEmit       # typecheck (use to verify changes)
```

## Layout (`src/`)
```
navigation/RootNavigator.tsx   auth stack vs main tabs (gated on userStore.isAuthenticated);
                               5 tabs + center action button; per-tab native stacks
screens/                       ~23 screen files; RemainingScreens.tsx holds several stubs;
                               _stub.tsx is the "coming soon" fallback
services/api/                  one module per resource (authAPI, friendsAPI, groupsAPI,
                               expensesAPI, balancesAPI, activityAPI, aiAPI, ocrAPI, splitAPI)
services/api/axiosClient.ts    axios instance: Bearer interceptor + logout-on-401
services/queryClient.ts        React Query defaults (5-min stale, 1 retry)
state/                         Zustand stores: userStore, themeStore, toastStore,
                               splitStore, ocrStore
theme/useTheme.ts              light/dark color tokens (forest green / orange)
config/api.ts                  API_BASE_URL (see below)
components/                    Toast, EmptyState, FilterSheet, SkeletonLoader, …
hooks/useAuth.ts               login/register/logout wrapping userStore + mutations
utils/                         upi.ts (UPI link/validate, ₹ format), helpers.ts
```

## API base URL (`src/config/api.ts`)
Driven by **`EXPO_PUBLIC_API_URL`** (inlined at build; set per profile in `eas.json`). Falls back
to local dev when unset:
- Android emulator → `http://10.0.2.2:9000/api/v1`
- iOS simulator → `http://localhost:9000/api/v1`
- **Physical device** → set `EXPO_PUBLIC_API_URL` to your machine's LAN IP, e.g.
  `EXPO_PUBLIC_API_URL=http://192.168.x.x:9000/api/v1`.

Builds: `eas.json` has `development` / `preview` (internal) / `production` profiles. The `preview`
and `production` profiles' `EXPO_PUBLIC_API_URL` are placeholders (`REPLACE_WITH_RAILWAY_URL`) until
the backend is deployed. Bundle IDs (`com.quicksplit.app`) live in `app.json`; run `eas init` to
populate `extra.eas.projectId`.

## Conventions
- **Auth:** token persisted in AsyncStorage via Zustand. `App.tsx`'s `AuthBridge` injects the
  token into the axios interceptor; a `401` triggers `userStore.logout()`, which flips
  `RootNavigator` back to the auth stack.
- **Theming:** use `useTheme()` for colors and build `StyleSheet`s from `colors` (see existing
  `createStyles(colors)` pattern). Don't hard-code hex values that already exist as tokens.
- **Parity:** these screens mirror `../frontend/src/pages`. When changing a feature, mirror it
  on web too.

## Navigation redesign (done)
The "+" action sheet (Add Expense / Scan Bill / Settle Up) is centralized into the tab bar's
center button in `RootNavigator` (uses `navigationRef` to route into the Home stack); per-screen
FABs are gone. The tab bar matches the Jun-11 UI images: **Home · Friends · ＋ · Groups · AI
Assistant**, on a floating rounded bar, active tint orange `#FF6B35`. Icons are clean SVG line
icons (`components/TabBarIcon.tsx`, via `react-native-svg`) — not emoji/glyphs. **Account** is off
the tab bar and opened from the Home hero avatar (hidden tab, still mounted). The "AI Assistant"
tab is the former Personal stack (AI chat + budget + subscriptions + insights).

> The Jun-9 `UI_REFERENCE.md` text spec still lists 5 tabs (Home/Friends/Groups/Personal/Account)
> + a FAB and says "all icons are emoji" — the Jun-11 UI images supersede it for navigation.

Friends/Groups headers use a centered title + circular add button + a search row whose search and
filter controls are SVG icons (`components/icons.tsx`). UI visuals still need an on-device pass in
Radon (SVG icons + orange active tint not yet eyeballed).

## Stubs / not done
`RemainingScreens.tsx` contains placeholder implementations for several account/premium/
analytics/OCR screens (e.g. SubscriptionTracker, SpendingInsights, ProUpgrade, Referral, Scan,
Review, OCRHistory, various Settings). Core flows (Home, Friends, Groups, AddExpense,
ExpenseDetail, SettleUp, CreateGroup, GroupDetail, AddFriend, Login/Register, AIChat,
EditProfile) are fully implemented.
