# QuickSplit — Web vs Mobile Feature Comparison

> Updated: 2026-06-08 (Session 8 — Dark mode token adoption complete; mobile at ~87% parity)
> Web source: `frontend/src/` (React + React Router v6, 37 pages, 38 routes)
> Mobile source: `mobile/src/` (React Native + Expo SDK 56, 34 screens across 5 tab stacks)

## How to Read This Document

| Symbol | Meaning |
|--------|---------|
| ✅ Complete | Fully implemented and functional |
| 🟡 Partial | Screen/feature exists but missing sub-features |
| ❌ Missing | Not implemented at all |

The **Gap** column highlights whether a remaining difference is **Important** (degrades UX noticeably) or **Minor** (cosmetic / nice-to-have). Features marked ✅ on both sides have no gap.

---

## 1. Auth & Onboarding

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Splash Screen (animated logo, auto-redirect) | ✅ Complete | ✅ Complete | — |
| Onboarding carousel (5 slides, skip, progress dots) | ✅ Complete | ✅ Complete | — |
| Login (email + password, show/hide toggle) | ✅ Complete | ✅ Complete | — |
| Register (name, email, password, terms checkbox) | ✅ Complete | ✅ Complete | — |
| Permission Setup screen (contacts/camera/notifications) | ✅ Complete | ✅ Complete | — |
| Google / Apple sign-in buttons | 🟡 UI only | ❌ Missing | Minor |

**Auth: 5/6 complete on mobile (83%)**

---

## 2. Navigation & Layout

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Bottom navigation (5 tabs) | ✅ Complete | ✅ Complete | — |
| FAB button + slide-up Action Sheet (Add / Scan / Settle) | ✅ Complete | ✅ Complete | — |
| Filter Sheet (slide-up radio filter, Friends + Groups) | ✅ Complete | ✅ Complete | — |
| Dark mode (persisted, system/light/dark) | ✅ Complete | ✅ Complete | — |
| Page transition animations (enter fade + y-slide) | ✅ Complete | ❌ Missing | Minor |

**Navigation: 4/5 complete (80%); page transition animations remain as minor gap**

---

## 3. Home Dashboard

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Hero greeting card (time-based + rotating quote) | ✅ Complete | ✅ Complete | — |
| Balance summary strip (Net / Owed / You owe) | ✅ Complete | ✅ Complete | — |
| Quick actions row (Add / Scan / Settle / Friend) | ✅ Complete | ✅ Complete | — |
| Active groups horizontal strip (top 4 by balance) | ✅ Complete | ✅ Complete | — |
| "Who owes you" section with Remind button | ✅ Complete | ✅ Complete | — |
| "You owe" section with Settle button | ✅ Complete | ✅ Complete | — |
| Recent activity feed (last 5 items) | ✅ Complete | ✅ Complete | — |
| AI insight card (rotating tip + "Chat with AI →") | ✅ Complete | ✅ Complete | — |
| Pull-to-refresh gesture | ✅ Complete | ✅ Complete | — |
| Floating + FAB with Add/Scan/Settle action sheet | ✅ Complete | ✅ Complete | — |
| Skeleton loading states | ✅ Complete | 🟡 Partial | Minor — SkeletonLoader component created + used on Friends/Groups; not yet on Home balance strip |
| Remind button API call | ✅ Complete | 🟡 Partial | Minor — shows friendly Alert; no actual notification API call |

**Home: 10/12 complete (83%)**

---

## 4. Friends

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Friends list with search | ✅ Complete | ✅ Complete | — |
| Balance summary chips (total owed / owe at top) | ✅ Complete | ✅ Complete | — |
| Filter sheet (All / Outstanding / You owe / Owe you) | ✅ Complete | ✅ Complete | — |
| Swipe actions on friend rows (Add / Settle / Remind / Remove) | ✅ Complete | ❌ Missing | Important — long-press remove exists; 4-action swipe reveal not implemented |
| Pending friend requests UI (accept / decline) | ✅ Complete | ✅ Complete | — |
| Friend Detail — balance hero + shared expenses | ✅ Complete | ✅ Complete | — |
| Friend Detail — Settlements tab | ✅ Complete | ✅ Complete | — |
| Add Friend — email search with live results | ✅ Complete | ✅ Complete | — |
| Add Friend — QR scan tab | ✅ Complete | ✅ Complete | — |

**Friends: 8/9 complete (89%)**

---

## 5. Groups

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Groups list with search | ✅ Complete | ✅ Complete | — |
| Filter sheet (All / Outstanding / Settled) | ✅ Complete | ✅ Complete | — |
| Category quick-filter pill row | ✅ Complete | ✅ Complete | — |
| Overlapping member avatar dots on group cards | ✅ Complete | ✅ Complete | — |
| Group Detail — gradient hero (category-coloured LinearGradient) | ✅ Complete | ✅ Complete | — |
| Group Detail — 3-stat row (total spent / members / expenses) | ✅ Complete | ✅ Complete | — |
| Group Detail — 5 quick actions (Add / Settle / Insights / Chat / Invite) | ✅ Complete | ✅ Complete | — |
| Group Detail — analytics mini card | ✅ Complete | ✅ Complete | — |
| Group Detail — simplified debts (who owes who) | ✅ Complete | ✅ Complete | — |
| Group Detail — expenses FlatList | ✅ Complete | ✅ Complete | — |
| Group Chat (bubble UI, send, 10s polling) | ✅ Complete | ✅ Complete | — |
| Member management — add member (email input modal) | ✅ Complete | ✅ Complete | — |
| Member management — remove member (admin only) | ✅ Complete | ✅ Complete | — |
| Admin badge + admin controls | ✅ Complete | ✅ Complete | — |
| Invite link (Share.share()) | ✅ Complete | ✅ Complete | — |
| Create Group — member email chips during creation | ✅ Complete | ✅ Complete | — |
| Create Group — split method selector step | ✅ Complete | ✅ Complete | — |
| Group Insights — member bars, category breakdown, settlement plan | ✅ Complete | ✅ Complete | — |
| Import Group from Splitwise | ✅ Complete | 🟡 Partial | Minor — step instructions + file picker present; backend CSV pipeline not connected |

**Groups: 18/19 complete (95%)**

---

## 6. Expense Management

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Add Expense — description + amount (₹) | ✅ Complete | ✅ Complete | — |
| Add Expense — category grid (10 categories with emoji) | ✅ Complete | ✅ Complete | — |
| Add Expense — Paid By selector (any participant) | ✅ Complete | ✅ Complete | — |
| Add Expense — participant chip picker ("With you and:") | ✅ Complete | ✅ Complete | — |
| Add Expense — Equal split | ✅ Complete | ✅ Complete | — |
| Add Expense — Exact amounts split | ✅ Complete | ✅ Complete | — |
| Add Expense — Percentage split | ✅ Complete | ✅ Complete | — |
| Add Expense — Shares split type (4th option) | ✅ Complete | ✅ Complete | — |
| Add Expense — date picker (modal, defaults today) | ✅ Complete | ✅ Complete | — |
| Add Expense — notes field | ✅ Complete | ✅ Complete | — |
| Add Expense — group context pre-select / group picker | ✅ Complete | ✅ Complete | — |
| Add Expense — recurring toggle + frequency | ✅ Complete | ✅ Complete | — |
| Add Expense — scan receipt button in form | ✅ Complete | ❌ Missing | Minor |
| Expense Detail — paid by + shares breakdown | ✅ Complete | ✅ Complete | — |
| Expense Detail — delete button (payer only, with confirm) | ✅ Complete | ✅ Complete | — |
| Expense Detail — emoji reactions | ✅ Complete | ❌ Missing | Minor |
| Expense Detail — receipt attachment CTA | ✅ Complete | ❌ Missing | Minor |
| Expense Detail — comments section | ✅ Complete | ❌ Missing | Minor |

**Expenses: 14/18 complete (78%); all critical gaps resolved; remaining items are minor polish**

---

## 7. Settlement & Payments

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Settle Up — amount input (pre-filled from balance) | ✅ Complete | ✅ Complete | — |
| Settle Up — notes field | ✅ Complete | ✅ Complete | — |
| Settle Up — UPI transaction ID field | ✅ Complete | ✅ Complete | — |
| Settle Up — payment method tabs (GPay / PhonePe / Paytm / Cash / Other) | ✅ Complete | ✅ Complete | — |
| Settle Up — UPI deep link (opens payment app) | ✅ Complete | ✅ Complete | — |
| Settle Up — UPI QR code generation | ✅ Complete | 🟡 Partial | Minor — displays `qr_code` returned by settlement API; cannot generate on-demand before submission |
| Settle Up — AI settlement suggestion card | ✅ Complete | ✅ Complete | — |
| Settle Up — success screen | ✅ Complete | ✅ Complete | — |
| Balances overview page | ✅ Complete | ✅ Complete | — |
| Activity feed (paginated transactions) | ✅ Complete | ✅ Complete | — |

**Settlement: 9/10 complete (90%)**

---

## 8. Personal Finance & AI

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Personal Tab hub (quick links grid) | ✅ Complete | ✅ Complete | — |
| AI Chat — message bubbles (user right / AI left) | ✅ Complete | ✅ Complete | — |
| AI Chat — real multi-provider backend | ✅ Complete | ✅ Complete | — |
| AI Chat — expense context in system prompt | ✅ Complete | ✅ Complete | — |
| AI Chat — suggestion chips (tap to pre-fill) | ✅ Complete | ✅ Complete | — |
| AI Chat — typing / thinking indicator (3-dot bounce) | ✅ Complete | ✅ Complete | — |
| AI Chat — online / unavailable status badge | ✅ Complete | ✅ Complete | — |
| Budget Dashboard — ring + category progress bars | ✅ Complete | ✅ Complete | — |
| Budget Dashboard — add / edit budgets form | ✅ Complete | ✅ Complete | — |
| Budget Dashboard — OVER / NEAR / ON TRACK badges | ✅ Complete | ✅ Complete | — |
| Spending Insights — category bars + percentage | ✅ Complete | ✅ Complete | — |
| Spending Insights — date filter chips | ✅ Complete | ✅ Complete | — |
| Subscription Tracker — add / delete (AsyncStorage) | ✅ Complete | ✅ Complete | — |
| Subscription Tracker — monthly total summary | ✅ Complete | ✅ Complete | — |

**Personal Finance & AI: 14/14 complete (100%)**

---

## 9. OCR / Scan Flow

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Scan page — camera capture | ✅ Complete | ✅ Complete | — |
| Scan page — file / image upload from gallery | ✅ Complete | ✅ Complete | — |
| Scan page — sample receipt loader | ✅ Complete | ❌ Missing | Minor |
| OCR processing → detected total passed to Split page | ✅ Complete | ✅ Complete | — |
| Split page — edit OCR amount, view detected text | ✅ Complete | ✅ Complete | — |
| Review page — confirm before creating expense | ✅ Complete | ✅ Complete | — |
| History page — past scans | ✅ Complete | ❌ Missing | Minor — not registered in mobile navigator |

**OCR: 5/7 complete (71%); core flow works end-to-end**

---

## 10. Account & Settings

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Account Tab hub | ✅ Complete | ✅ Complete | — |
| Edit Profile — name field | ✅ Complete | ✅ Complete | — |
| Edit Profile — email (read-only) | ✅ Complete | ✅ Complete | — |
| Edit Profile — UPI ID | ✅ Complete | ✅ Complete | — |
| Edit Profile — avatar color picker (8 colors, live preview) | ✅ Complete | ✅ Complete | — |
| Edit Profile — phone number | ✅ Complete | ❌ Missing | Minor |
| Appearance Settings (Light / Dark / System) | ✅ Complete | ✅ Complete | — |
| Notification Settings (grouped toggles, AsyncStorage) | ✅ Complete | ✅ Complete | — |
| Security Settings — change password form | ✅ Complete | ✅ Complete | — |
| Security Settings — active sessions management | ✅ Complete | 🟡 Partial | Minor — "This Device / Current" placeholder; no real session list |
| Pro Upgrade — plan cards + BEST VALUE badge + CTA | ✅ Complete | ✅ Complete | — |
| Referral — X/3 progress bar + accordion + Share | ✅ Complete | ✅ Complete | — |
| Import Splitwise (instructions + CSV file picker) | ✅ Complete | ✅ Complete | — |
| QR Code — "My Code" tab (real QR via react-native-qrcode-svg) | ✅ Complete | ✅ Complete | — |
| QR Code — "Scan" tab (camera QR decode) | ✅ Complete | ✅ Complete | — |
| Permission Setup page | ✅ Complete | ✅ Complete | — |

**Account: 14/16 complete (88%)**

---

## Summary Gap Analysis

| Area | Web Features | Mobile ✅ | Mobile 🟡 | Mobile ❌ | % Complete |
|------|-------------|-----------|-----------|-----------|-----------|
| Auth & Onboarding | 6 | 5 | 0 | 1 | **83%** |
| Navigation & Layout | 5 | 4 | 0 | 1 | **80%** |
| Home Dashboard | 12 | 10 | 2 | 0 | **83%** |
| Friends | 9 | 8 | 0 | 1 | **89%** |
| Groups | 19 | 18 | 1 | 0 | **95%** |
| Expense Management | 18 | 14 | 0 | 4 | **78%** |
| Settlement & Payments | 10 | 9 | 1 | 0 | **90%** |
| Personal Finance & AI | 14 | 14 | 0 | 0 | **100%** |
| OCR / Scan Flow | 7 | 5 | 0 | 2 | **71%** |
| Account & Settings | 16 | 14 | 1 | 1 | **88%** |
| **TOTAL** | **116** | **101** | **5** | **10** | **~87%** |

> **Previous session (before implementation):** 46/115 ✅ → **40%**
> **After this session:** ~100/116 ✅ → **~86%**

---

## Remaining Gaps

### Important (degrades UX noticeably)
- **Swipe actions on friend rows** — web has Framer Motion drag-reveal with Add/Settle/Remind/Remove; mobile only has long-press for Remove.

### Minor (cosmetic / nice-to-have)
- Page transition animations (enter fade + y-slide)
- Expense Detail emoji reactions (👍❤️😂 etc.)
- Expense Detail comments section
- Expense Detail receipt attachment CTA
- Scan receipt button inside Add Expense form
- OCR History page (not in mobile navigator)
- OCR sample receipt loader
- Phone number field in Edit Profile
- Security Settings active session list (real API)
- Skeleton loading on Home balance strip
- Remind button actual notification API call
- Google/Apple sign-in buttons
- Import Group CSV backend pipeline

### V2 New Features (kept pending by design)
Guest mode, Phone OTP, Voice AI, Multi-currency, Export reports, Haptic feedback, Home screen widgets, Recurring auto-detection, Global expense search, Gamification, Smart auto-categorization, AI fraud detection, Long-term ledger, Travel mode, Bank SMS detection, Spending heatmap, Advanced batch settlement, Multi-device session management, Email parsing, Analytics tab, Wallet section.
