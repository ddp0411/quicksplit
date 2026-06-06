# QuickSplit — UX Guide
> User experience principles, route map, and design decisions

---

## Core UX Principles

1. **Speed over completeness** — Show something immediately. Use skeleton loaders, optimistic updates, and cached data. Never block on a loading spinner for core content.
2. **Friendliness first** — Language is casual and encouraging ("All settled up! 🎉"), not transactional. Errors explain what went wrong and what to do next.
3. **Mobile-first, keyboard-free** — All primary actions reachable with one thumb. Large tap targets (min 44×44px), bottom-sheet selectors instead of dropdowns, swipe gestures where natural.
4. **Zero dead ends** — Every empty state has a CTA. Every error page has a back button. No route leads to a blank screen.
5. **Teal = action** — `#0F9D94` is reserved for primary actions and positive values. Secondary/muted UI uses CSS variables (`--text-muted`, `--border`). Red (`text-negative`) only for debts and destructive actions.

---

## Route Map & Flow

### First Launch (new user)
```
/ (SplashScreen, 2s)
  → /onboarding  (5-slide carousel, SKIP or CONTINUE)
    → /login      (email/password + Google/Apple UI)
      → /register (if no account)
        → /permissions (Contacts / Notifications / Camera — each skippable)
          → /friends  (main app)
```

### Returning Authenticated User
```
/ (SplashScreen, 2s)
  → /friends  (auto-redirect, no onboarding)
```

### Returning Unauthenticated User (previously onboarded)
```
/ (SplashScreen, 2s)
  → /login  (skips onboarding — localStorage `qs_onboarded` flag set)
```

---

## Tab Navigation Structure

Five bottom tabs on mobile, horizontal nav on desktop (md+):

| Tab | Route | Description |
|-----|-------|-------------|
| Friends | `/friends` | Balance list, swipe actions, friend requests |
| Groups | `/groups` | Group list, import, category filters |
| + FAB | Action sheet | Add expense / Scan bill / Settle up |
| Personal | `/personal` | AI insights, budgets, subscriptions |
| Account | `/account` | Profile, QR code, settings, pro |

**FAB (center button)** opens a bottom action sheet with 3 options — this is the primary entry point for adding expenses on mobile.

---

## Key User Flows

### Adding an Expense
1. Tap **+** FAB → "Add Expense" → `/expenses/new`
2. OR tap **Add** in a Group's quick actions → `/expenses/new?group=ID`
3. Select participants (chip picker), enter description + amount
4. Optionally adjust split method (Equal / Exact / % / Shares)
5. Submit → toast confirmation → back to previous screen

### Scanning a Receipt
1. Tap **+** FAB → "Scan Bill" → `/scan`
2. Upload image or use camera → OCR processes receipt
3. Review parsed line items at `/split`
4. Confirm → `/review/:splitId` → creates expense

### Settling a Debt
1. Swipe left on a friend row → "Settle" tray
2. OR tap **Settle** in a Group's quick actions → `/settle-up/:userId`
3. Choose UPI method (GPay / PhonePe / Paytm / Cash / Other)
4. Enter amount → Submit → spring-animated success screen

### Creating a Group
**Option A — New group:**
1. `/groups` → tap **New** → `/groups/new`
2. Step 1: Group name + category (6 types)
3. Step 2: Add members by email (chip input)
4. Step 3: Split method + currency → Create

**Option B — Import from Splitwise:**
1. `/groups` → tap **Import** → `/groups/import`
2. Screen A: Upload `.csv` (Splitwise export)
3. Screen B: Confirm group name, set your identity, choose type, map friend emails
4. Tap IMPORT → group + expenses created → success sheet with invite link

### Inviting Friends to a Group
1. GroupDetail quick actions → **Invite (🔗)**
2. Mobile: Web Share API sheet opens
3. Desktop: invite link copied to clipboard → "Invite link copied!" toast

---

## Page Transition Rules

- **Fullscreen pages** (`/`, `/onboarding`): Navbar and BottomNav are hidden. These pages use `fixed inset-0` and own the entire viewport.
- **Tab pages** (`/friends`, `/groups`, `/personal`, `/activity`, `/account`): Wrap root div in `<PageTransition>` — enter-only fade + 6px y-slide (200ms ease-out). No exit animation (prevents blank-page flash).
- **Sub-pages** (`/groups/:id`, `/expenses/:id`, etc.): Individual `motion` elements inside the page provide micro-animations. No wrapper needed.
- **Bottom sheets** (`FilterSheet`, `ActionSheet`, `SettleUp success`, `ImportGroup success`): Framer Motion `y: 300 → 0` spring animation.

**Rule: Never use `AnimatePresence mode="wait"` at the route level.** This unmounts the page tree during the exit animation, causing a blank screen for the full duration. Use enter-only animations instead.

---

## Empty States

Every list page has a graceful empty state:

| Page | Empty state |
|------|-------------|
| Friends | 👥 icon + "No friends yet" + "Add your first friend" CTA button |
| Groups | 👥 icon + "No groups yet" + "Create first group" CTA button |
| Activity | ⚡ icon + "No activity yet" + descriptive subtitle |
| Group expenses | Shown inside GroupDetail when group has no expenses |

**Principle**: Empty ≠ broken. Make it clear why it's empty and give the user exactly one action to fix it.

---

## Pull-to-Refresh

Available on: Friends, Groups, Activity.

- Drag down from the top of the page (when already scrolled to top) ≥65px
- Spinner indicator animates in as you pull
- Release → query refetch fires
- Implemented via `usePullToRefresh` hook (touch events, no library needed)

---

## Design System

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | #F8FAFB (light) / #0F1117 (dark) | Page background |
| `--card` | #FFFFFF (light) / #1A1D25 (dark) | Card/surface background |
| `--border` | #E8EDF2 (light) / #2A2D38 (dark) | Borders, dividers |
| `--text` | #0D1117 (light) / #F0F4F8 (dark) | Primary text |
| `--text-muted` | #6B7280 (light) / #9CA3AF (dark) | Secondary text |
| `primary-600` | #0F9D94 | CTAs, active states, teal brand |
| `text-positive` | #10B981 | Owed to you (green) |
| `text-negative` | #EF4444 | You owe (red) |

### Typography
- **Font**: Urbanist (display headings), system-ui (body)
- **Page title**: `font-display text-2xl font-extrabold`
- **Card label**: `text-sm font-bold`
- **Meta / muted**: `text-xs` with `--text-muted`

### Spacing & Radius
- Card border radius: `rounded-2xl` (16px) for rows, `rounded-3xl` (24px) for hero cards
- Card padding: `p-4` standard, `p-6` for hero cards
- Page padding: `pb-24` on mobile (bottom nav clearance), `pb-8` on desktop

### Interactive States
- Tap targets: min `h-9 w-9` (36px) for icon buttons
- Active press: `active:scale-[0.99]` on cards, `active:scale-95` on FAB
- Hover: `hover:border-primary-300 hover:shadow-sm` on cards
- Disabled: `opacity-60` + `cursor-not-allowed`

---

## Accessibility & Usability

- **All destructive actions** (logout, remove friend) require a `ConfirmDialog` — never single-tap destructive
- **Form validation** shows inline under fields, not alert popups
- **Loading states**: skeleton rows (not spinners) for list content; button `disabled` + opacity during mutation
- **Error states**: `getAPIErrorMessage()` utility parses API errors into human-readable strings shown in-context
- **Dark mode**: `darkMode: 'class'` via Tailwind. ThemeProvider reads localStorage `qs_theme` preference and applies `dark` class to `<html>`. System preference respected by default.

---

## Route Security

All routes inside `<ProtectedRoute>` redirect to `/login` if `isAuthenticated` is false (via Zustand `userStore`).

Public routes: `/`, `/onboarding`, `/login`, `/register`

Protected routes: Everything else.

**Important route ordering** in AppRoutes (specific before param):
```
/groups/new     → CreateGroup   (must be before :groupId)
/groups/import  → ImportGroup   (must be before :groupId)
/groups/:groupId → GroupDetail
```

---

## Known UX Tradeoffs

| Decision | Tradeoff | Reason |
|----------|----------|--------|
| CSV import assigns all expenses to current user | Splitwise CSV has names, not user IDs | No backend lookup; user can re-edit expenses after import |
| Web Share API with clipboard fallback | Not all browsers support Share API | Works universally; desktop gets clipboard copy |
| Scan tab in QR page is a placeholder | Camera access requires native / HTTPS | Actual scanning not available in web preview |
| AI chat uses mock keyword replies | Claude API requires backend proxy + billing | Backend integration is V2 scope |
| Settlement doesn't clear `is_settled` on backend | Backend bug | Frontend shows optimistic settled state; backend fix is deferred |

---

## V2 Roadmap (UX impact)

- **Real AI chat** — Replace mock keyword replies with streaming Claude API responses
- **Guest mode** — Allow trying the app before signing up (onboarding → limited trial → register prompt)
- **Phone OTP login** — Replace email/password flow for Indian users (more familiar)
- **Voice input** — "Split ₹1200 dinner with Rahul and Nehal" natural language expense entry
- **Group chat** — Threaded messages per group (not just expense comments)
- **Bank SMS parsing** — Auto-detect expenses from SMS notifications
- **Home screen widgets** — Live balance widget for iOS/Android
