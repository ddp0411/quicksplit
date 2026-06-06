# QuickSplit — Complete Feature Checklist

> Cross-reference against: `Quicksplit UI and features guide.md`
> Last updated: 2026-06-06

---

## ✅ Complete Features (36 items)

### Auth & Onboarding
- ✅ Splash Screen — animated teal logo, auto-redirect (authed → /friends, unauthed → /onboarding)
- ✅ Onboarding Carousel — 5 slides (Shared Expenses, Scan Bills, AI Insights, Smart Budgets, Recurring), progress dots, Skip, localStorage `qs_onboarded` flag
- ✅ Login — Google/Apple UI buttons, email + password, show/hide password toggle, teal CTA
- ✅ Register — name, email, password, confirm password, terms checkbox, Google signup UI
- ✅ Permission Setup — Contacts / Notifications / Camera step cards, skip each, navigates to /friends on finish

### Navigation
- ✅ 5-tab Bottom Nav — Friends | Groups | +FAB | Personal | Account
- ✅ FAB Action Sheet — slide-up with 3 options: Add Expense / Scan Bill / Settle Up
- ✅ Filter Sheet — slide-up radio options, reused across Friends + Groups
- ✅ Desktop Navbar — left sidebar with teal brand, 5 sections
- ✅ Dark Mode — CSS variables (--bg, --card, --border, --text, --text-muted), ThemeProvider, persisted via Zustand

### Friends
- ✅ Friends Tab — search bar, FilterSheet (All/Outstanding/You owe/Owe you), balance summary chips, "all settled up" banner
- ✅ Swipe Actions — drag="x" to reveal Settle / Remind / Remove on friend rows
- ✅ Friend Detail — hero with balance, Expenses tab, Settlements tab, floating Add Expense FAB
- ✅ Add Friend — search by name/email with live results (debounced), QR tab placeholder, sent invite tracking

### Groups
- ✅ Groups Tab — search, FilterSheet, category emoji icons (✈️🏠❤️💼📅📁), balance chips, category quick-filter pill row
- ✅ Create Group — 3-step wizard: name + 6-type grid → member email chips → split method + currency
- ✅ Group Detail — gradient hero by category type, 3-stat row, 4-button quick actions, group analytics mini card (top spender + category), collapsible members section
- ✅ Group Insights — per-member horizontal bar chart, SVG donut by category, settlement plan list
- ✅ Group Types — Trip ✈️ / Home 🏠 / Couple ❤️ / Office 💼 / Event 📅 / Other 📁

### Expense Management
- ✅ Add Expense — Splitwise-style: "With you and:" chip picker, category emoji + description field, large ₹ amount field, "Paid by / split" expandable panel (Equal/Exact/%/Shares tabs), bottom toolbar (Date/Group/Scan/Notes)
- ✅ Expense Detail — teal gradient hero, paid-by + split table, emoji reactions (👍❤️😂😮🎉🙏), receipt attachment CTA, comments section with send button
- ✅ Split Methods — Equal, Exact amounts, Percentage, Shares (UI complete; backend wires to equal for now)

### Settlement & Payments
- ✅ Settle Up — 5 UPI method tabs (GPay/PhonePe/Paytm/Cash/Other), amount + notes, AI suggestion card, transaction ID field (hidden for cash), success screen with QR placeholder + spring animation
- ✅ Smart Settlement Suggestions — static AI card ("settle in 2 instead of 6") shown on Settle Up screen

### Personal / AI Finance Hub
- ✅ Personal Tab — monthly spend hero, budget status ring, upcoming bills preview, rotating AI insight card, quick links, recent expenses feed
- ✅ AI Chat — chat UI, 6 suggested prompts, mock AI with keyword pattern replies, "thinking" animation, Claude API note
- ✅ Budget Dashboard — SVG ring (% used, remaining, days left), category bars with OVER/NEAR/ON TRACK badges, add budget form, localStorage (`qs_budgets`)
- ✅ Spending Insights — SVG donut (pure, no lib), date filter chips (Jun/May/All/Custom), category list with % bars, Export (coming soon)
- ✅ Subscription Tracker — list view, add/delete subscriptions, monthly total summary, localStorage (`qs_subs`)

### Account & Settings
- ✅ Account Tab — user avatar card, QR code row, Pro banner, all settings rows (Notifications/Security/Appearance/Referral/Import/Rate/Contact), logout with confirm dialog
- ✅ Edit Profile — 8-color avatar picker (live preview), name field, UPI ID field, email (read-only), PATCH /auth/me/
- ✅ Appearance Settings — Light / Dark / System rows, instantly applies dark class to `<html>`
- ✅ Notification Settings — grouped toggles (Groups/Expenses/News), Save button, localStorage (`qs_notif_prefs`)
- ✅ Security Settings — biometrics toggle placeholder, session history placeholder
- ✅ Pro Upgrade — feature checklist, Yearly/Quarterly/Monthly plan cards (BEST VALUE badge), timeline, "Try It Free" CTA
- ✅ Referral Page — X/3 referral progress bar, how-it-works accordion, Share link + Copy link
- ✅ Import from Splitwise — standalone page at /account/import (Option 1: direct instructions, Option 2: CSV file upload)

### System & OCR Flow
- ✅ OCR Scan Flow — Scan → Split → Review → History pages (full existing flow kept)
- ✅ Skeleton Loading — SkeletonCard + SkeletonRow used on Friends, Groups, GroupDetail, GroupInsights
- ✅ Teal Design System — #0F9D94 brand, Urbanist font, 24px radius cards, all screens consistent
- ✅ Balances page — existing page kept, accessible from Friends/Groups balance chips
- ✅ Activity page — existing page kept

---

## 🟡 Partial Features (implemented but not complete)

| Feature | Status | What's missing |
|---------|--------|----------------|
| Import from Splitwise in Create Group | 🟡 Just added | Expense batch-create is best-effort; paid_by always defaults to current user since CSV names can't be auto-matched to user IDs |
| AI Chat | 🟡 Mock only | Real Claude API integration needed — currently uses keyword pattern matching |
| QR Code payments | 🟡 UI only | Actual UPI deep-links / QR generation not wired |
| Scan receipt | 🟡 Partial | OCR flow exists; "Scan receipt" buttons in GroupDetail/AddExpense navigate to /scan |
| Group Chat | 🟡 Placeholder | Comments on expenses exist; full group thread/pinned messages not built |

---

## ❌ Missing Features

### Phase 9 Polish (Next immediate priority)
| Feature | Notes |
|---------|-------|
| QRSheet component | AccountTab "QR Code" row navigates nowhere; needs Scan + My Code bottom sheet |
| Page transition animations | AnimatePresence on route change — slide/fade between pages |
| Pull-to-refresh | Friends, Groups, Activity tabs (touch gesture → query refetch) |
| Enhanced empty states | Illustration + CTA on Friends, Groups, Activity, ExpenseDetail comments |

### V2 / Post-launch
| Feature | Notes |
|---------|-------|
| Guest mode | Use app without login |
| Phone OTP login | SMS verification |
| Real AI (Claude API) in chat | /personal/ai-chat currently uses mock keyword replies |
| Voice AI assistant | "Split ₹1200 dinner with Rahul and Nehal" voice input |
| Multi-currency with live exchange rates | Currency field exists; no exchange rate API |
| Export reports | CSV / PDF / Excel — button shows "coming soon" toast |
| Full Group Chat | Threaded messages, pinned messages, per-group feed |
| Haptic feedback | On settlement, add expense success, reactions |
| Home screen widgets | Live balance widget for iOS/Android |
| Recurring expense auto-detection | Auto-detect from bank SMS / email parsing |
| Expense search engine | Global search with filters (merchant, category, amount range) |
| Gamification / badges | Best Saver, Fast Settler, Most Active badges |
| Smart auto-categorization | ML-based merchant name → expense category |
| AI fraud detection | Duplicate/unusual expense detection alerts |
| Long-term ledger | Persistent couple/roommate debt history with monthly cycles |
| Travel mode | Trip budget tracking, expense itinerary, shared docs |
| Bank SMS detection | Auto-parse SMS for expense amounts |
| Spending heatmap | Day-of-week / time-of-day heat map chart |
| Advanced batch settlement | Full minimize-transactions algorithm (currently shows simplified debts from backend) |
| Multi-device session management | Security → "active sessions" list with revoke |
| Email parsing | Parse Gmail/Outlook for expense detection |

---

## Summary

| Status | Count |
|--------|-------|
| ✅ Complete | 36 |
| 🟡 Partial | 5 |
| ❌ Missing (Phase 9) | 4 |
| ❌ Missing (V2+) | 20 |
| **Total tracked** | **65** |
