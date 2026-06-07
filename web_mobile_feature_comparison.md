# QuickSplit — Web vs Mobile Feature Comparison

> Generated: 2026-06-07
> Web source: `frontend/src/` (React + React Router v6, 37 pages, 38 routes)
> Mobile source: `mobile/src/` (React Native + Expo SDK 56, 34 screens across 5 tab stacks)

## How to Read This Document

| Symbol | Meaning |
|--------|---------|
| ✅ Complete | Fully implemented and functional |
| 🟡 Partial | Screen/feature exists but missing sub-features |
| 🔲 Stub | Screen registered in navigator but shows placeholder/hardcoded UI |
| ❌ Missing | Not implemented at all |

The **Gap** column highlights whether a difference is **Critical** (core user flow broken), **Important** (degrades UX significantly), or **Minor** (cosmetic/nice-to-have).

---

## 1. Auth & Onboarding

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Splash Screen (animated logo, auto-redirect) | ✅ Complete | ✅ Complete | — |
| Onboarding carousel (5 slides, skip, progress dots) | ✅ Complete | ✅ Complete | — |
| Login (email + password, show/hide toggle) | ✅ Complete | ✅ Complete | — |
| Register (name, email, password, terms checkbox) | ✅ Complete | ✅ Complete | — |
| Permission Setup screen (contacts/camera/notifications steps) | ✅ Complete | ❌ Missing | Minor |
| Google / Apple sign-in buttons (UI) | 🟡 UI only | ❌ Missing | Minor |

**Auth gap summary**: 4/6 complete on mobile. Google/Apple and Permission Setup are low priority.

---

## 2. Navigation & Layout

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Bottom navigation (5 tabs: Home/Friends/Groups/Personal/Account) | ✅ Complete | ✅ Complete | — |
| FAB button + slide-up Action Sheet (Add / Scan / Settle) | ✅ Complete | ❌ Missing | Important — mobile uses quick-action row on Home instead |
| Filter Sheet (slide-up radio filter, reused across Friends + Groups) | ✅ Complete | ❌ Missing | Important |
| Dark mode (CSS variables, persisted to Zustand) | ✅ Complete | 🟡 Partial | Important — themeStore + AppearanceSettings exist but dark theme not applied app-wide |
| Page transition animations (enter fade + y-slide) | ✅ Complete | ❌ Missing | Minor |

---

## 3. Home Dashboard

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Hero greeting card (time-based greeting + rotating quote) | ✅ Complete | ✅ Complete | — |
| Balance summary strip (Net / Owed to you / You owe) | ✅ Complete | ✅ Complete | — |
| Quick actions row (Add / Scan / Settle / Friend) | ✅ Complete | ✅ Complete | — |
| Active groups horizontal strip (top 4 by balance) | ✅ Complete | ✅ Complete | — |
| "Who owes you" section (avatars, names, Remind button) | ✅ Complete | ✅ Complete | — |
| "You owe" section (avatars, names, Settle button) | ✅ Complete | ✅ Complete | — |
| Recent activity feed (last 5 items, emoji, timestamps) | ✅ Complete | ✅ Complete | — |
| AI insight card on home (rotating tip + Chat link) | ✅ Complete | ❌ Missing | Minor |
| Pull-to-refresh gesture | ✅ Complete | ✅ Complete | — |
| Skeleton loading states (SkeletonCard / SkeletonRow) | ✅ Complete | ❌ Missing | Minor — mobile shows ActivityIndicator only |
| Remind button calls API | ✅ Complete | ❌ Missing | Minor — button renders but is a no-op |

**Home gap summary**: 8/11 complete. Core content parity achieved; AI card + skeleton loaders missing.

---

## 4. Friends

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Friends list with search | ✅ Complete | ✅ Complete | — |
| Balance summary chips (total owed / owe) | ✅ Complete | ❌ Missing | Minor |
| Filter sheet (All / Outstanding / You owe / Owe you) | ✅ Complete | ❌ Missing | Important |
| Swipe actions on friend rows (Add Expense / Settle / Remind / Remove) | ✅ Complete | ❌ Missing | Important |
| Pending friend requests UI (accept / decline) | ✅ Complete | ✅ Complete | — |
| Friend Detail — balance hero + shared expenses | ✅ Complete | ✅ Complete | — |
| Friend Detail — Settlements tab | ✅ Complete | ❌ Missing | Important |
| Add Friend — email search with live debounced results | ✅ Complete | ✅ Complete | — |
| Add Friend — QR scan tab | ✅ Complete | ❌ Missing | Minor |

**Friends gap summary**: 5/9 complete. Swipe actions and Settlements tab are the biggest gaps.

---

## 5. Groups

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Groups list with search | ✅ Complete | ✅ Complete | — |
| Filter sheet (All / Active / Settled) | ✅ Complete | ❌ Missing | Important |
| Category quick-filter pill row (✈️🏠❤️💼📅📁) | ✅ Complete | ❌ Missing | Minor |
| Overlapping member avatar dots on group cards | ✅ Complete | ✅ Complete | — |
| Group Detail — gradient hero (category-coloured) | ✅ Complete | 🟡 Partial | Minor — mobile shows name/emoji but no gradient or description |
| Group Detail — 3-stat row (total spent / your balance / members) | ✅ Complete | ✅ Complete | — |
| Group Detail — 5 quick actions (Add / Scan / Settle / Insights / Invite) | ✅ Complete | 🟡 Partial | Important — mobile only has Add Expense button in header |
| Group Detail — analytics mini card (top spender, top category) | ✅ Complete | ❌ Missing | Minor |
| Group Detail — simplified debts (who owes who) | ✅ Complete | ✅ Complete | — |
| Group Detail — expenses FlatList | ✅ Complete | ✅ Complete | — |
| **Group Chat** (real-time messaging, bubble UI, 10s polling) | ✅ Complete | ❌ Missing | **Critical** |
| Member management — add member (admin, email input) | ✅ Complete | ❌ Missing | Critical |
| Member management — remove member (admin only) | ✅ Complete | ❌ Missing | Critical |
| Admin badge + admin controls | ✅ Complete | ❌ Missing | Important |
| Invite link (Web Share API / clipboard copy) | ✅ Complete | ❌ Missing | Important |
| Create Group — add members during creation (email chips) | ✅ Complete | ❌ Missing | Important |
| Create Group — split method selector | ✅ Complete | ❌ Missing | Minor |
| Group Insights — per-member bars, SVG donut, settlement plan | ✅ Complete | 🔲 Stub | Important |
| Import Group from Splitwise | ✅ Complete | 🔲 Stub | Minor |

**Groups gap summary**: 6/19 complete. Group Chat and member management are the biggest missing features.

---

## 6. Expense Management

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Add Expense — description + amount (₹) | ✅ Complete | ✅ Complete | — |
| Add Expense — category grid (10 categories with emoji) | ✅ Complete | ✅ Complete | — |
| **Add Expense — Paid By selector** (any participant) | ✅ Complete | ❌ Missing | **Critical** — hardcoded to current user |
| **Add Expense — participant chip picker** ("With you and:") | ✅ Complete | ❌ Missing | Critical — no way to select who's splitting |
| Add Expense — Equal split | ✅ Complete | ✅ Complete | — |
| Add Expense — Exact amounts split | ✅ Complete | ✅ Complete | — |
| Add Expense — Percentage split | ✅ Complete | ✅ Complete | — |
| **Add Expense — Shares split type** (4th option) | ✅ Complete | ❌ Missing | Important |
| **Add Expense — date picker** (calendar, defaults today) | ✅ Complete | ❌ Missing | Important — always uses today |
| **Add Expense — notes / description field** | ✅ Complete | ❌ Missing | Important |
| Add Expense — group context pre-select / group picker | ✅ Complete | ✅ Complete | — |
| Add Expense — recurring toggle + frequency (weekly/monthly/yearly) | ✅ Complete | ❌ Missing | Minor |
| Add Expense — scan receipt button in form | ✅ Complete | ❌ Missing | Minor |
| Expense Detail — paid by + shares breakdown | ✅ Complete | ✅ Complete | — |
| Expense Detail — delete button (payer only, with confirm) | ✅ Complete | ✅ Complete | — |
| Expense Detail — emoji reactions (👍❤️😂😮🎉🙏) | ✅ Complete | ❌ Missing | Minor |
| Expense Detail — receipt attachment CTA | ✅ Complete | ❌ Missing | Minor |
| Expense Detail — comments section | ✅ Complete | ❌ Missing | Minor |

**Expense gap summary**: 7/18 complete on mobile. Paid By selector and participant picker are critical — without them, every expense is always split with everyone in the group.

---

## 7. Settlement & Payments

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Settle Up — amount input (pre-filled from balance) | ✅ Complete | ✅ Complete | — |
| Settle Up — notes field | ✅ Complete | ✅ Complete | — |
| Settle Up — UPI transaction ID field | ✅ Complete | ✅ Complete | — |
| **Settle Up — payment method tabs** (GPay / PhonePe / Paytm / Cash / Other) | ✅ Complete | ❌ Missing | Important |
| Settle Up — UPI QR code generation (qrcode.react) | ✅ Complete | 🔲 Stub | Important |
| Settle Up — UPI deep link (opens GPay/PhonePe directly) | ✅ Complete | ❌ Missing | Important |
| Settle Up — AI settlement suggestion card | ✅ Complete | ❌ Missing | Minor |
| Settle Up — success screen with spring animation | ✅ Complete | ❌ Missing | Minor — mobile just navigates back |
| Balances overview page (owed to you / you owe sections) | ✅ Complete | ✅ Complete | — |
| Activity feed (paginated transactions) | ✅ Complete | ✅ Complete | — |

**Settlement gap summary**: 5/10 complete. UPI payment method selection and QR generation are the key gaps.

---

## 8. Personal Finance & AI

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Personal Tab hub (monthly spend hero, quick links) | ✅ Complete | ✅ Complete | — |
| AI Chat — message bubbles (user right / AI left) | ✅ Complete | ✅ Complete | — |
| AI Chat — real multi-provider backend (Anthropic → OpenAI → Groq) | ✅ Complete | ✅ Complete | — |
| AI Chat — expense context injected into system prompt | ✅ Complete | ✅ Complete | — |
| AI Chat — suggestion chips (Why overspend / Top category / etc.) | ✅ Complete | ❌ Missing | Minor |
| AI Chat — typing / thinking indicator | ✅ Complete | ❌ Missing | Minor |
| AI Chat — online / unavailable status indicator | ✅ Complete | ❌ Missing | Minor |
| Budget Dashboard — SVG ring (% used, days left) | ✅ Complete | 🔲 Stub | Important — mobile shows hardcoded progress bars |
| Budget Dashboard — add / edit budgets form | ✅ Complete | ❌ Missing | Important |
| Budget Dashboard — OVER / NEAR / ON TRACK badges | ✅ Complete | ❌ Missing | Minor |
| Spending Insights — SVG donut by category | ✅ Complete | 🔲 Stub | Important — mobile shows hardcoded bars |
| Spending Insights — date filter chips (Jun / May / All / Custom) | ✅ Complete | ❌ Missing | Minor |
| Subscription Tracker — add / delete subscriptions | ✅ Complete | 🔲 Stub | Important — mobile shows hardcoded list |
| Subscription Tracker — monthly total summary | ✅ Complete | 🔲 Stub | Minor |

**Personal Finance gap summary**: 5/14 complete. Budget, Insights, and Subscriptions are all stubs on mobile.

---

## 9. OCR / Scan Flow

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Scan page — camera capture (OCRScanner component) | ✅ Complete | 🔲 Stub | Important |
| Scan page — file / image upload (OCRUpload component) | ✅ Complete | 🔲 Stub | Important |
| Scan page — sample receipt loader | ✅ Complete | ❌ Missing | Minor |
| OCR processing → detected total + line items | ✅ Complete | ❌ Missing | Critical |
| Split page — edit OCR items, assign to participants | ✅ Complete | 🔲 Stub | Critical |
| Review page — confirm before creating expense | ✅ Complete | 🔲 Stub | Critical |
| History page — past scans and extractions | ✅ Complete | ❌ Missing | Minor — not in mobile navigator |

**OCR gap summary**: 0/7 complete on mobile. The entire scan flow is placeholder. This is a major feature gap.

---

## 10. Account & Settings

| Feature | Web | Mobile | Gap |
|---------|-----|--------|-----|
| Account Tab hub | ✅ Complete | ✅ Complete | — |
| Edit Profile — name field | ✅ Complete | ✅ Complete | — |
| Edit Profile — email (read-only) | ✅ Complete | ✅ Complete | — |
| Edit Profile — UPI ID | ✅ Complete | ✅ Complete | — |
| **Edit Profile — avatar color picker** (8 colors, live preview) | ✅ Complete | ❌ Missing | Important |
| Edit Profile — phone number | ✅ Complete | ❌ Missing | Minor |
| Appearance Settings (Light / Dark / System) | ✅ Complete | 🔲 Stub | Important — toggles render but theme not applied |
| Notification Settings (grouped toggles, Save) | ✅ Complete | 🔲 Stub | Minor — local UI only, no API |
| Security Settings — change password form | ✅ Complete | 🔲 Stub | Minor |
| Security Settings — session management | ✅ Complete | 🔲 Stub | Minor |
| Pro Upgrade — plan cards + "Try It Free" CTA | ✅ Complete | 🔲 Stub | Minor |
| Referral page (progress bar, share link, copy) | ✅ Complete | 🟡 Partial | Minor — Share.share() works; no API |
| Import Splitwise (CSV upload + 3-step flow) | ✅ Complete | 🔲 Stub | Minor |
| QR Code page — "My Code" tab (real QR generation) | ✅ Complete | 🔲 Stub | Important |
| QR Code page — "Scan" tab (webcam QR decode) | ✅ Complete | 🔲 Stub | Minor |
| Permission Setup page | ✅ Complete | ❌ Missing | Minor |

**Account gap summary**: 5/16 complete. Avatar color picker and real QR generation are the most visible gaps.

---

## Summary Gap Analysis

| Area | Web Features | Mobile ✅ | Mobile 🟡/🔲 | Mobile ❌ | % Complete |
|------|-------------|-----------|-------------|-----------|-----------|
| Auth & Onboarding | 6 | 4 | 0 | 2 | 67% |
| Navigation & Layout | 5 | 1 | 1 | 3 | 20% |
| Home Dashboard | 11 | 8 | 0 | 3 | 73% |
| Friends | 9 | 5 | 0 | 4 | 56% |
| Groups | 19 | 6 | 3 | 10 | 32% |
| Expense Management | 18 | 7 | 0 | 11 | 39% |
| Settlement & Payments | 10 | 5 | 1 | 4 | 50% |
| Personal Finance & AI | 14 | 5 | 4 | 5 | 36% |
| OCR / Scan Flow | 7 | 0 | 4 | 3 | 0% |
| Account & Settings | 16 | 5 | 7 | 4 | 31% |
| **TOTAL** | **115** | **46** | **20** | **49** | **40%** |

---

## Critical Missing Features (must-fix for core UX parity)

1. **Add Expense — Paid By selector** — currently hardcoded to current user; breaks any expense where someone else paid
2. **Add Expense — participant chip picker** — no way to select who splits the expense
3. **Group Chat** — fully implemented in web (10s polling, bubble UI, backend model); entirely absent in mobile
4. **Group member management** (add/remove) — groups are effectively read-only in mobile
5. **OCR Scan flow** — all 7 steps are stubs; the entire receipt scanning feature does not work

## Important Gaps (degrade UX but flows still usable)

- Dark mode not applied app-wide
- Filter sheet on Friends and Groups lists
- Swipe actions on friend rows
- Friend Detail — Settlements tab
- Group Detail — Scan/Settle/Insights/Invite quick actions
- Add Expense — date picker (always uses today)
- Add Expense — notes field
- Settle Up — payment method tabs (GPay/PhonePe/Paytm/Cash)
- Settle Up — UPI QR code generation
- Budget / Subscriptions / Insights — all stubs with hardcoded data
- Edit Profile — avatar color picker
- QR Code page — real QR generation

## Minor Gaps (cosmetic / nice-to-have)

- AI insight card on Home
- Skeleton loading states
- Remind button API call
- Expense Detail emoji reactions + comments
- Page transition animations
- FAB action sheet (replaced by quick-action row)
- Category filter pills on Groups
- Suggest chips + typing indicator in AI Chat
- Settle Up success screen animation
