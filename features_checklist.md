# QuickSplit — Complete Feature Checklist

> Cross-reference against: `Quicksplit UI and features guide.md` + Moodboard v1 (Social Casual Dining)
> Last updated: 2026-06-07 (Session 6 — Mobile Status column added; web_mobile_feature_comparison.md created)
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
| 5 | Permission Setup — Contacts / Notifications / Camera step cards, skip each, navigates to /home | ✅ | ❌ Missing |
| **Navigation** | | | |
| 6 | 6-tab Bottom Nav — Home / Friends / +FAB / Groups / Personal / Account | ✅ | 🟡 Partial (5 tabs, no FAB) |
| 7 | FAB Action Sheet — slide-up with 3 options: Add Expense / Scan Bill / Settle Up | ✅ | ❌ Missing (quick-action row used instead) |
| 8 | Filter Sheet — slide-up radio options, reused across Friends + Groups | ✅ | ❌ Missing |
| 9 | Desktop Navbar — Home, no redundant "Add Expense" button | ✅ | N/A (native app) |
| 10 | Dark Mode — CSS variables, ThemeProvider, persisted via Zustand | ✅ | 🟡 Partial (themeStore + AppearanceSettings exist; theme not applied app-wide) |
| **Friends** | | | |
| 11 | Friends Tab — search bar, FilterSheet (All / Outstanding / You owe / Owe you), balance summary chips | ✅ | 🟡 Partial (search works; no filter sheet or summary chips) |
| 12 | Swipe Actions — drag to reveal ➕ Add / Settle / Remind / Remove on friend rows | ✅ | ❌ Missing |
| 13 | Friend Detail — hero with balance, Expenses tab, Settlements tab, floating Add Expense FAB | ✅ | 🟡 Partial (balance hero + expenses; no Settlements tab) |
| 14 | Add Friend — search by name/email with live debounced results, QR tab, sent invite tracking | ✅ | 🟡 Partial (email search works; no QR tab) |
| **Groups** | | | |
| 15 | Groups Tab — search, FilterSheet, category emoji icons, balance chips, category quick-filter pills | ✅ | 🟡 Partial (list + search works; no filter or pills) |
| 16 | Create Group — 3-step wizard: name + 6-type grid → member email chips → split method + currency | ✅ | 🟡 Partial (name + category; no member chips or split method step) |
| 17 | Group Detail — gradient hero by category type, 3-stat row, 5-button quick actions, group analytics mini card, collapsible members section | ✅ | 🟡 Partial (stats row + expenses + debts; no gradient hero, no 5 actions, no analytics card) |
| 18 | Group Insights — per-member horizontal bar chart, SVG donut by category, settlement plan list | ✅ | 🔲 Stub |
| 19 | Group Types — Trip ✈️ / Home 🏠 / Couple ❤️ / Office 💼 / Event 📅 / Other 📁 | ✅ | ✅ Complete |
| 20 | Import from Splitwise — /groups/import, 3-screen CSV flow → success bottom sheet | ✅ | 🔲 Stub |
| 21 | Invite link — GroupDetail quick action, Web Share API / clipboard copy, "Copied!" toast | ✅ | ❌ Missing |
| 22 | Group Chat — full messaging thread per group; bubble UI; send input; 10s polling; backend GroupMessage model | ✅ | ❌ Missing |
| **Expense Management** | | | |
| 23 | Add Expense — Splitwise-style: "With you and:" chip picker, category emoji + description, large ₹ amount, Paid by / split expandable panel (Equal/Exact/%/Shares), bottom toolbar (Date/Group/Scan/Notes) | ✅ | 🟡 Partial (description + amount + category + 3 split types + group picker; NO paid-by selector, NO participant chips, NO date picker, NO notes, NO Shares type) |
| 24 | Expense Detail — gradient hero, paid-by + split table, emoji reactions, receipt attachment CTA, comments section | ✅ | 🟡 Partial (paid-by + split table + delete; no reactions, comments, or receipt) |
| 25 | Split Methods — Equal, Exact amounts, Percentage, Shares | ✅ | 🟡 Partial (Equal, Exact, Percentage only) |
| 26 | Scan Receipt with Group Context — GroupDetail Scan button passes `?group=ID`; amount pre-filled from OCR | ✅ | ❌ Missing |
| **Settlement & Payments** | | | |
| 27 | Settle Up — 5 UPI method tabs (GPay/PhonePe/Paytm/Cash/Other), amount + notes, AI suggestion card, transaction ID, success screen with QR | ✅ | 🟡 Partial (amount + notes + txn ID; no payment method tabs, no QR, no success screen) |
| 28 | Smart Settlement Suggestions — static AI card ("settle in 2 instead of 6") on Settle Up | ✅ | ❌ Missing |
| **Personal / AI Finance Hub** | | | |
| 29 | Personal Tab — monthly spend hero, budget status ring, upcoming bills preview, rotating AI insight card, quick links, recent expenses feed | ✅ | 🟡 Partial (4 cards for sub-screens; no spend hero, budget ring, or AI insight card) |
| 30 | AI Chat — real multi-provider backend (Anthropic → OpenAI → Groq); full conversation history; expense context; status indicator Online/Unavailable | ✅ | 🟡 Partial (real AI calls work; no suggestion chips, no typing indicator, no status badge) |
| 31 | Budget Dashboard — SVG ring (% used, remaining, days left), category bars with OVER/NEAR/ON TRACK badges, add budget form, localStorage | ✅ | 🔲 Stub (hardcoded progress bars; no add form; no badges) |
| 32 | Spending Insights — SVG donut, date filter chips (Jun/May/All/Custom), category list with % bars | ✅ | 🔲 Stub (hardcoded bars; no date filter) |
| 33 | Subscription Tracker — list view, add/delete subscriptions, monthly total, localStorage | ✅ | 🔲 Stub (hardcoded list; no add/delete) |
| **Account & Settings** | | | |
| 34 | Account Tab — user avatar card, QR code row, Pro banner, all settings rows (Notifications/Security/Appearance/Referral/Import/Rate/Contact), logout | ✅ | ✅ Complete |
| 35 | Edit Profile — 8-color avatar picker (live preview), name, UPI ID, email (read-only), PATCH /auth/me/ | ✅ | 🟡 Partial (name + UPI ID + email; no avatar color picker) |
| 36 | Appearance Settings — Light / Dark / System rows, instantly applies dark class to `<html>` | ✅ | 🔲 Stub (radio buttons render; theme not applied) |
| 37 | Notification Settings — grouped toggles (Groups/Expenses/News), Save button, localStorage | ✅ | 🔲 Stub (4 toggles; no API call) |
| 38 | Security Settings — biometrics toggle placeholder, session history placeholder | ✅ | 🔲 Stub |
| 39 | Pro Upgrade — feature checklist, Yearly/Quarterly/Monthly plan cards, BEST VALUE badge, "Try It Free" CTA | ✅ | 🔲 Stub |
| 40 | Referral Page — X/3 referral progress bar, how-it-works accordion, Share link + Copy link | ✅ | 🟡 Partial (Share.share() works; no progress bar or API) |
| 41 | Import from Splitwise — /account/import, Option 1: instructions, Option 2: CSV upload | ✅ | 🔲 Stub |
| 42 | QR Code page — "My Code" tab (real QR via qrcode.react + copy/share) + "Scan" tab (webcam decode at 200ms, navigate to /friends/add) | ✅ | 🔲 Stub (placeholder; no real QR generation) |
| **Home Dashboard** | | | |
| 43 | Home page — default post-login destination | ✅ | ✅ Complete |
| 44 | Hero greeting card — time-based greeting + daily rotating quote (20 quotes, forest green gradient) | ✅ | ✅ Complete |
| 45 | Balance summary strip — Net / Owed to you / You owe (3-column card with skeleton loading) | ✅ | ✅ Complete |
| 46 | Quick actions row — ➕ Add / 📷 Scan / 💸 Settle / 👤 Friend (4 pill buttons) | ✅ | ✅ Complete |
| 47 | Active groups strip — horizontal scroll, up to 4 groups sorted by outstanding balance | ✅ | ✅ Complete |
| 48 | Who owes you / You owe — compact friend rows with Remind 🔔 / Settle → inline actions | ✅ | 🟡 Partial (rows render; Remind is a no-op) |
| 49 | Recent activity feed — last 5 items with category emoji and timestamps | ✅ | ✅ Complete |
| 50 | AI insight card — rotating daily insight + "Chat with AI →" link | ✅ | ❌ Missing |
| **System & OCR Flow** | | | |
| 51 | OCR Scan Flow — Scan → Split → Review → History pages (camera + file upload, OCR processing) | ✅ | 🔲 Stub (all 4 screens are placeholders) |
| 52 | Skeleton Loading — SkeletonCard + SkeletonRow on Friends, Groups, GroupDetail, Home | ✅ | ❌ Missing |
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
| 3 | Primary CTA buttons → orange (#FF6B35) | ✅ Complete | 🟡 Partial (most CTAs are green; orange used selectively) |
| 4 | Navbar & BottomNav rebrand (forest green active states, FAB) | ✅ Complete | ✅ Complete |
| 5 | Balance hero card redesign (dark #1B4332 bg + orange Settle CTA) | ✅ Complete | ✅ Complete |
| 6 | Overlapping member avatars (stacked circles, up to 4 + "+N more") | ✅ Complete | ✅ Complete |
| 7 | Badge system (Unsettled / Settled / You paid / Owes you / Overdue) | ✅ Complete | 🟡 Partial (balance chips exist; no Overdue/You-paid badges) |
| 8 | Illustrated empty states | ✅ Complete | ❌ Missing (text-only empty states) |
| 9 | Alert / toast system (dismissible, success/warning/error/info, auto-dismiss 4s) | ✅ Complete | ✅ Complete (built-in Animated, no reanimated) |
| 10 | Sparkline trend charts (inline SVG) | ✅ Complete | ❌ Missing |
| 11 | Per-person amount on cards ("₹310.00 each" in accent color) | ✅ Complete | ❌ Missing |
| 12 | Dark mode forest green tokens (#0F1F17, #1A2E22, #2D4A38) | ✅ Complete | ❌ Missing (dark mode not applied) |

---

## ❌ Missing Features (V2 New Features)

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
| ✅ Complete | 52 | ~25 |
| 🟡 Partial | 0 | ~13 |
| 🔲 Stub (screen exists, placeholder UI) | — | ~14 |
| 🎨 V2 Rebrand | 12 ✅ | 5 ✅ / 2 🟡 / 5 ❌ |
| ❌ Missing (V2 new features) | 21 | 21 |
| **Web complete features missing on mobile** | — | **~27 features** |
| **Total tracked** | **85** | — |

> For full feature-by-feature breakdown see [`web_mobile_feature_comparison.md`](web_mobile_feature_comparison.md)
