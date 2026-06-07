# QuickSplit — Complete Feature Checklist

> Cross-reference against: `Quicksplit UI and features guide.md` + Moodboard v1 (Social Casual Dining)
> Last updated: 2026-06-08 (Session 8 — Dark mode token adoption complete; all screens use useTheme)
>
> **Mobile Status Key**: ✅ Complete · 🟡 Partial · 🔲 Stub (screen exists, placeholder UI) · ❌ Missing

---

## ✅ Complete Web Features (52 items)

| # | Feature | Web Status | Mobile Status |
|---|---------|------------|---------------|
| **Auth & Onboarding** | | | |
| 1 | Splash Screen — animated logo, auto-redirect (authed → /home, unauthed → /onboarding) | ✅ | ✅ Complete |
| 2 | Onboarding Carousel — 5 slides (Shared Expenses, Scan Bills, AI Insights, Smart Budgets, Recurring), progress dots, Skip, localStorage flag | ✅ | ✅ Complete |
| 3 | Login — Google/Apple UI buttons, email + password, show/hide toggle, teal CTA → /home | ✅ | ✅ Complete |
| 4 | Register — name, email, password, confirm password, terms checkbox, Google signup UI → /home | ✅ | ✅ Complete |
| 5 | Permission Setup — Contacts / Notifications / Camera step cards, skip each, navigates to /home | ✅ | ✅ Complete |
| **Navigation** | | | |
| 6 | 6-tab Bottom Nav — Home / Friends / +FAB / Groups / Personal / Account | ✅ | 🟡 Partial (5 tabs; FAB is floating button on Home screen instead of tab) |
| 7 | FAB Action Sheet — slide-up with 3 options: Add Expense / Scan Bill / Settle Up | ✅ | ✅ Complete (floating + button on Home with slide-up modal) |
| 8 | Filter Sheet — slide-up radio options, reused across Friends + Groups | ✅ | ✅ Complete |
| 9 | Desktop Navbar — Home, no redundant "Add Expense" button | ✅ | N/A (native app) |
| 10 | Dark Mode — CSS variables, ThemeProvider, persisted via Zustand | ✅ | ✅ Complete (useTheme hook adopted across all screens; all StyleSheets use c.bg/c.text/c.card tokens; brand colors #1B4332/#FF6B35 kept static) |
| **Friends** | | | |
| 11 | Friends Tab — search bar, FilterSheet (All / Outstanding / You owe / Owe you), balance summary chips | ✅ | ✅ Complete |
| 12 | Swipe Actions — drag to reveal ➕ Add / Settle / Remind / Remove on friend rows | ✅ | ❌ Missing (long-press remove exists; swipe reveal not implemented) |
| 13 | Friend Detail — hero with balance, Expenses tab, Settlements tab, floating Add Expense FAB | ✅ | ✅ Complete (Expenses + Settlements tabs both implemented) |
| 14 | Add Friend — search by name/email with live debounced results, QR tab, sent invite tracking | ✅ | ✅ Complete |
| **Groups** | | | |
| 15 | Groups Tab — search, FilterSheet, category emoji icons, balance chips, category quick-filter pills | ✅ | ✅ Complete |
| 16 | Create Group — 3-step wizard: name + 6-type grid → member email chips → split method + currency | ✅ | ✅ Complete |
| 17 | Group Detail — gradient hero by category type, 3-stat row, 5-button quick actions, group analytics mini card, collapsible members section | ✅ | ✅ Complete |
| 18 | Group Insights — per-member horizontal bar chart, SVG donut by category, settlement plan list | ✅ | ✅ Complete (real data from API; View-based bars) |
| 19 | Group Types — Trip ✈️ / Home 🏠 / Couple ❤️ / Office 💼 / Event 📅 / Other 📁 | ✅ | ✅ Complete |
| 20 | Import from Splitwise — /groups/import, 3-screen CSV flow → success bottom sheet | ✅ | 🟡 Partial (step instructions + file picker; backend pipeline not connected) |
| 21 | Invite link — GroupDetail quick action, Web Share API / clipboard copy, "Copied!" toast | ✅ | ✅ Complete |
| 22 | Group Chat — full messaging thread per group; bubble UI; send input; 10s polling; backend GroupMessage model | ✅ | ✅ Complete |
| **Expense Management** | | | |
| 23 | Add Expense — Splitwise-style: "With you and:" chip picker, category emoji + description, large ₹ amount, Paid by / split expandable panel (Equal/Exact/%/Shares), bottom toolbar (Date/Group/Scan/Notes) | ✅ | ✅ Complete (paid-by modal, participant chip picker, date modal, notes, all 4 split types, recurring toggle, group picker) |
| 24 | Expense Detail — gradient hero, paid-by + split table, emoji reactions, receipt attachment CTA, comments section | ✅ | 🟡 Partial (paid-by + split table + delete + notes; no reactions, receipt, or comments) |
| 25 | Split Methods — Equal, Exact amounts, Percentage, Shares | ✅ | ✅ Complete |
| 26 | Scan Receipt with Group Context — GroupDetail Scan button passes `?group=ID`; amount pre-filled from OCR | ✅ | ❌ Missing |
| **Settlement & Payments** | | | |
| 27 | Settle Up — 5 UPI method tabs (GPay/PhonePe/Paytm/Cash/Other), amount + notes, AI suggestion card, transaction ID, success screen with QR | ✅ | ✅ Complete |
| 28 | Smart Settlement Suggestions — static AI card ("settle in 2 instead of 6") on Settle Up | ✅ | ✅ Complete |
| **Personal / AI Finance Hub** | | | |
| 29 | Personal Tab — monthly spend hero, budget status ring, upcoming bills preview, rotating AI insight card, quick links, recent expenses feed | ✅ | ✅ Complete (AI insight card on Home; quick links to Budget/Insights/Subscriptions) |
| 30 | AI Chat — real multi-provider backend (Anthropic → OpenAI → Groq); full conversation history; expense context; status indicator Online/Unavailable | ✅ | ✅ Complete (suggestion chips + 3-dot typing indicator + Online/Unavailable badge added) |
| 31 | Budget Dashboard — SVG ring (% used, remaining, days left), category bars with OVER/NEAR/ON TRACK badges, add budget form, localStorage | ✅ | ✅ Complete (AsyncStorage CRUD; progress ring; OVER/NEAR/ON TRACK badges; add budget modal) |
| 32 | Spending Insights — SVG donut, date filter chips (Jun/May/All/Custom), category list with % bars | ✅ | ✅ Complete (live from API; This Month/Last Month/All Time filters; category % bars) |
| 33 | Subscription Tracker — list view, add/delete subscriptions, monthly total, localStorage | ✅ | ✅ Complete (AsyncStorage CRUD; add modal; monthly total) |
| **Account & Settings** | | | |
| 34 | Account Tab — user avatar card, QR code row, Pro banner, all settings rows (Notifications/Security/Appearance/Referral/Import/Rate/Contact), logout | ✅ | ✅ Complete |
| 35 | Edit Profile — 8-color avatar picker (live preview), name, UPI ID, email (read-only), PATCH /auth/me/ | ✅ | ✅ Complete (8-color picker + live preview + real PATCH /auth/me/) |
| 36 | Appearance Settings — Light / Dark / System rows, instantly applies dark class to `<html>` | ✅ | ✅ Complete (applies mode via themeStore; system respects device dark mode) |
| 37 | Notification Settings — grouped toggles (Groups/Expenses/News), Save button, localStorage | ✅ | ✅ Complete (AsyncStorage persistence; Save button) |
| 38 | Security Settings — biometrics toggle placeholder, session history placeholder | ✅ | ✅ Complete (Face ID toggle; change password form; current session row) |
| 39 | Pro Upgrade — feature checklist, Yearly/Quarterly/Monthly plan cards, BEST VALUE badge, "Try It Free" CTA | ✅ | ✅ Complete |
| 40 | Referral Page — X/3 referral progress bar, how-it-works accordion, Share link + Copy link | ✅ | ✅ Complete (progress bar; accordion with Animated height; Share.share() + copy) |
| 41 | Import from Splitwise — /account/import, Option 1: instructions, Option 2: CSV upload | ✅ | ✅ Complete (step instructions + expo-image-picker for file upload) |
| 42 | QR Code page — "My Code" tab (real QR via qrcode.react + copy/share) + "Scan" tab (webcam decode at 200ms, navigate to /friends/add) | ✅ | ✅ Complete (react-native-qrcode-svg for real QR; expo-camera scan tab) |
| **Home Dashboard** | | | |
| 43 | Home page — default post-login destination | ✅ | ✅ Complete |
| 44 | Hero greeting card — time-based greeting + daily rotating quote (20 quotes, forest green gradient) | ✅ | ✅ Complete |
| 45 | Balance summary strip — Net / Owed to you / You owe (3-column card with skeleton loading) | ✅ | ✅ Complete |
| 46 | Quick actions row — ➕ Add / 📷 Scan / 💸 Settle / 👤 Friend (4 pill buttons) | ✅ | ✅ Complete |
| 47 | Active groups strip — horizontal scroll, up to 4 groups sorted by outstanding balance | ✅ | ✅ Complete |
| 48 | Who owes you / You owe — compact friend rows with Remind 🔔 / Settle → inline actions | ✅ | 🟡 Partial (rows render; Remind shows friendly Alert; no API call) |
| 49 | Recent activity feed — last 5 items with category emoji and timestamps | ✅ | ✅ Complete |
| 50 | AI insight card — rotating daily insight + "Chat with AI →" link | ✅ | ✅ Complete |
| **System & OCR Flow** | | | |
| 51 | OCR Scan Flow — Scan → Split → Review → History pages (camera + file upload, OCR processing) | ✅ | 🟡 Partial (Scan camera + gallery + OCR API; Split review; Review creates expense; History page not in mobile navigator) |
| 52 | Skeleton Loading — SkeletonCard + SkeletonRow on Friends, Groups, GroupDetail, Home | ✅ | 🟡 Partial (SkeletonLoader component created; used on Friends, Groups; not yet on Home or GroupDetail) |
| | Pull-to-refresh — touch gesture on Friends, Groups, Activity | ✅ | ✅ Complete |
| | Balances page — accessible from Friends/Groups balance chips | ✅ | ✅ Complete |
| | Activity page — date-grouped feed, dark mode themed | ✅ | ✅ Complete |
| | Page transition animations — enter fade + y-slide via PageTransition | ✅ | ❌ Missing |

---

## 🟡 Partial Web Features

None. All previously partial features are now ✅ Complete on web.

---

## 🎨 V2 Design Rebrand

> Moodboard: Option 3 — Social Casual Dining
> Primary: `#1B4332` forest green · Accent: `#FF6B35` orange · Background: `#FFFDF9`
> Typography: Playfair Display (headings) + Inter (body)

| # | Feature | Web Status | Mobile Status |
|---|---------|------------|---------------|
| 1 | Tailwind token migration (forest green + orange accent) | ✅ Complete | ✅ Complete (StyleSheet.create with #1B4332 / #FF6B35) |
| 2 | Google Fonts — Playfair Display + Inter | ✅ Complete | ✅ Complete (@expo-google-fonts) |
| 3 | Primary CTA buttons → orange (#FF6B35) | ✅ Complete | 🟡 Partial (most CTAs are green; orange used selectively on key actions) |
| 4 | Navbar & BottomNav rebrand (forest green active states, FAB) | ✅ Complete | ✅ Complete |
| 5 | Balance hero card redesign (dark #1B4332 bg + orange Settle CTA) | ✅ Complete | ✅ Complete |
| 6 | Overlapping member avatars (stacked circles, up to 4 + "+N more") | ✅ Complete | ✅ Complete |
| 7 | Badge system (Unsettled / Settled / You paid / Owes you / Overdue) | ✅ Complete | 🟡 Partial (balance chips exist; no Overdue/You-paid badges) |
| 8 | Illustrated empty states | ✅ Complete | ❌ Missing (emoji + text empty states) |
| 9 | Alert / toast system (dismissible, success/warning/error/info, auto-dismiss 4s) | ✅ Complete | ✅ Complete (built-in Animated, no reanimated) |
| 10 | Sparkline trend charts (inline SVG) | ✅ Complete | ❌ Missing |
| 11 | Per-person amount on cards ("₹310.00 each" in accent color) | ✅ Complete | ❌ Missing |
| 12 | Dark mode forest green tokens (#0F1F17, #1A2E22, #2D4A38) | ✅ Complete | ✅ Complete (all screens refactored to createStyles(c: C) pattern; useTheme tokens adopted app-wide) |

---

## ❌ Missing Features (V2 New Features — kept pending by design)

| Feature | Notes | Mobile Status |
|---------|-------|---------------|
| Guest mode | Use app without login | ❌ Missing |
| Phone OTP login | SMS verification for Indian users | ❌ Missing |
| Voice AI assistant | "Split ₹1200 dinner with Rahul and Nehal" voice input | ❌ Missing |
| Multi-currency with live exchange rates | Currency field exists; no exchange rate API | ❌ Missing |
| Export reports | CSV / PDF / Excel — "coming soon" toast | ❌ Missing |
| Haptic feedback | On settlement, add expense success, reactions | ❌ Missing (React Native `Haptics` not wired) |
| Home screen widgets | Live balance widget for iOS/Android | ❌ Missing |
| Recurring expense auto-detection | Auto-detect from bank SMS / email parsing | ❌ Missing |
| Expense search engine | Global search with filters (merchant, category, amount range) | ❌ Missing |
| Gamification / badges | Best Saver, Fast Settler, Most Active badges | ❌ Missing |
| Smart auto-categorization | ML-based merchant name → expense category | ❌ Missing |
| AI fraud detection | Duplicate/unusual expense detection alerts | ❌ Missing |
| Long-term ledger | Persistent couple/roommate debt history with monthly cycles | ❌ Missing |
| Travel mode | Trip budget tracking, expense itinerary, shared docs | ❌ Missing |
| Bank SMS detection | Auto-parse SMS for expense amounts | ❌ Missing |
| Spending heatmap | Day-of-week / time-of-day heat map chart | ❌ Missing |
| Advanced batch settlement | Full minimize-transactions algorithm | ❌ Missing |
| Multi-device session management | Security → "active sessions" list with revoke | ❌ Missing |
| Email parsing | Parse Gmail/Outlook for expense detection | ❌ Missing |
| Analytics tab | Dedicated analytics route (replacing/supplementing Personal tab) | ❌ Missing |
| Wallet section | Wallet tab in nav for UPI balance / payment history | ❌ Missing |

---

## Summary

| Status | Web Count | Mobile Count |
|--------|-----------|--------------|
| ✅ Complete | 52 | ~46 |
| 🟡 Partial | 0 | ~6 |
| 🔲 Stub (screen exists, placeholder UI) | — | 0 (all stubs replaced) |
| 🎨 V2 Rebrand | 12 ✅ | 6 ✅ / 4 🟡 / 2 ❌ |
| ❌ Missing (V2 new features — kept pending) | 21 | 21 |
| **Web complete features still missing/partial on mobile** | — | **~10 features** |
| **Total tracked** | **85** | — |
| **Overall parity** | — | **~86%** (up from 40%) |

> For full feature-by-feature breakdown see [`web_mobile_feature_comparison.md`](web_mobile_feature_comparison.md)
>
> **Remaining gaps (not V2 new):** Swipe actions on friend rows · Full dark mode token adoption · Expense reactions/comments · Page transition animations · OCR History page · Scan-from-expense button · Phone number in profile · Session management
