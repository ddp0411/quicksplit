# QuickSplit — UX Guide
> User experience principles, design system, route map, and design decisions
> Last updated: 2026-06-06 (reflects moodboard v1 — Social Casual Dining)

---

## Brand Identity

**Tagline:** "Split bills. Settle instantly. Every paisa, perfectly."

**Brand Personality:**
| Trait | What it means in UI |
|-------|---------------------|
| Friendly | Warm language, illustrations, casual tone — never transactional |
| Trustworthy | Accurate numbers, clear breakdowns, no surprise charges |
| Instant | Skeleton loaders, optimistic updates, zero perceived wait |
| Accurate | Every rupee accounted for — per-person splits shown clearly |
| Together | Social presence — member avatars, group activity, shared moments |

**Visual Mood:** Warm, welcoming, social casual dining. Clean layouts with soft shadows. High readability and visual hierarchy. Delightful micro-interactions that reward action.

---

## Core UX Principles

1. **Speed over completeness** — Show something immediately. Use skeleton loaders, optimistic updates, and cached data. Never block on a loading spinner for core content.
2. **Friendliness first** — Language is casual and encouraging ("All settled up! 🎉"), not transactional. Errors explain what went wrong and what to do next.
3. **Mobile-first, keyboard-free** — All primary actions reachable with one thumb. Large tap targets (min 44×44px), bottom-sheet selectors instead of dropdowns, swipe gestures where natural.
4. **Zero dead ends** — Every empty state has a CTA with an illustration. Every error page has a back button. No route leads to a blank screen.
5. **Orange = action** — `#FF6B35` (accent orange) is reserved for primary CTAs ("Split Bill", "Add Expense"). Forest green (`#1B4332`) is the brand anchor — it builds trust, not urgency. Red only for errors and overdue states.
6. **Clarity of money** — Every expense card shows: who paid, total amount, and your share. No mental math required.

---

## Design System

### Color Palette (Moodboard: Option 3 — Social Casual Dining)

| Role | Hex | Usage |
|------|-----|-------|
| **Primary (60%)** | `#1B4332` | Brand anchor, nav bg, dark surfaces, hero cards |
| **Secondary (30%)** | `#FFFDF9` | Page background (light mode), card surfaces |
| **Accent (10%)** | `#FF6B35` | Primary CTA buttons ("Split Bill", "Add Expense"), active badge |
| **Success** | `#22C55E` | Settled badge, positive balances, success alerts |
| **Warning** | `#F59E0B` | Reminder alerts, "near limit" badges |
| **Error** | `#EF4444` | Failed payments, overdue badges, destructive actions |
| **Info** | `#2D7A57` | Informational alerts, secondary green accents |
| **Border** | `#E7E5E4` | Card borders, dividers, input outlines |

**Current implementation uses:** `#0F9D94` (teal) as primary. Migration to `#1B4332` + `#FF6B35` is the V2 design target — the moodboard is aspirational for the full rebrand.

### CSS Variable Mapping (current → target)

| CSS Var | Current light | Target light | Usage |
|---------|--------------|--------------|-------|
| `--bg` | `#F8FAFB` | `#FFFDF9` | Page background |
| `--card` | `#FFFFFF` | `#FFFFFF` | Card surface |
| `--border` | `#E8EDF2` | `#E7E5E4` | Borders |
| `--text` | `#0D1117` | `#1B4332` | Primary text |
| `--text-muted` | `#6B7280` | `#6B7280` | Secondary text |
| `primary-600` | `#0F9D94` | `#1B4332` | Brand primary |
| Accent CTA | — | `#FF6B35` | Action buttons |

### Typography

| Role | Font | Size | Weight | Usage |
|------|------|------|--------|-------|
| **Display / H1** | Playfair Display | 40px | Bold | Hero headlines, splash screen |
| **H2** | Playfair Display | 32px | Bold | Page titles |
| **H3** | Inter | 24px | Semibold | Section headers |
| **H4** | Inter | 20px | Semibold | Card titles |
| **H5** | Inter | 16px | Semibold | Sub-labels |
| **Body 1** | Inter | 16px | Regular | Primary body text |
| **Body 2** | Inter | 14px | Regular | Secondary body text |
| **Small** | Inter | 12px | Regular | Captions, badges, timestamps |

**Current implementation uses:** Urbanist for display, system-ui for body. Target: Playfair Display (headings) + Inter (UI).

### Spacing & Radius

- Card border radius: `rounded-2xl` (16px) for rows and list items, `rounded-3xl` (24px) for hero/feature cards
- Card padding: `p-4` standard, `p-6` for hero cards
- Page padding: `pb-24` on mobile (bottom nav clearance), `pb-8` on desktop
- Section gap: `space-y-4` between sections

### Button System

| Variant | Style | Usage |
|---------|-------|-------|
| **Primary** | Orange bg (`#FF6B35`), white text, pill shape | "Split Bill", "Add Expense", "Settle Up" |
| **Secondary** | Outlined (forest green border, green text) | "Request Money", cancel actions |
| **Tertiary** | Ghost / no border, text only | "Scan Bill", secondary links |
| **Destructive** | Red bg or red text | Delete, remove, logout |
| **Disabled** | `opacity-60`, `cursor-not-allowed` | Any loading/invalid state |

Button sizes: Large (`py-3.5 px-6`), Medium (`py-2.5 px-4`), Small (`py-1.5 px-3`).

### Badge System

| Badge | Color | Meaning |
|-------|-------|---------|
| **Unsettled** | Orange outline | Expense not yet settled |
| **Settled** | Green filled | Fully settled |
| **You paid** | Dark filled | Current user paid |
| **Owes you** | Green filled | Friend owes the user |
| **Overdue** | Red filled | Past due / long pending |

### Card Patterns

**Expense card:**
- Category icon chip (colored bg) + expense name + paid-by avatar + total amount
- Your share shown prominently: `₹310.00 each` in accent color if unsettled
- Status badge in top-right

**Group card:**
- Group emoji/icon + name
- Overlapping member avatar circles (up to 4 + "+N more")
- Balance: "You owe ₹850.00" in rose, "Owed ₹2,450" in emerald

**Balance summary card:**
- Dark primary bg (`#1B4332`), white text
- Large "You are owed ₹2,450.75" headline
- "Settle up now →" CTA in accent orange

**Data card:**
- "Total Spent ₹5,650.00" with sparkline trend chart
- "+12.5% vs last month" trend indicator in emerald

### Alert / Notification System

| Type | Color | Icon | Example |
|------|-------|------|---------|
| Success | Green bg | ✅ | "Payment of ₹850 marked as settled!" |
| Warning | Amber bg | ⚠️ | "Reminder: You have 2 unsettled bills." |
| Error | Red bg | ✕ | "Payment failed. Please try again." |
| Info | Light green bg | ℹ️ | "New expense added to Goa Trip." |

All alerts are dismissible (✕ button). Stack vertically from top, auto-dismiss after 4s.

### Charts & Data Visuals

- **Spending by Category**: Donut/pie chart — Food 🍕, Travel ✈️, Shopping 🛍️, Others
- Donut chart colors: Orange (food), Forest green (travel), Amber (shopping), Slate (others)
- **Trend lines**: Small SVG sparklines on summary cards (green line = positive trend)
- **Bar charts**: Per-member horizontal bars in Group Insights

### Empty States

Every list page has an **illustrated** empty state (not just an icon):

| Page | Illustration | Message | CTA |
|------|-------------|---------|-----|
| Expenses | Two people at a table | "No expenses here yet! Add your first expense and start splitting with your group." | "+ Add Expense" (orange) |
| Friends | Person waving | "No friends yet. Invite your friends to split bills together." | "Add Friend" |
| Groups | Group of people | "No groups yet. Create one for your next trip or shared house." | "Create Group" |
| Activity | Person relaxing | "All quiet here. Add an expense to get started." | "+ Add Expense" |

**Principle**: Empty ≠ broken. Illustration + friendly copy + one clear action.

### Icons

**Style:** Line icons (heroicons or equivalent) — consistent 24px / 20px sizes.

Bottom nav icons: Home · Groups · Expenses · Scan · Friends · Analytics · Wallet · Notification

---

## Route Map & Flow

### First Launch (new user)
```
/ (SplashScreen, 2s auto-redirect)
  → /onboarding  (5-slide carousel, SKIP or CONTINUE)
    → /login      (email/password + Google/Apple UI)
      → /register (if no account)
        → /permissions (Contacts / Notifications / Camera — each skippable)
          → /home  (dashboard)
```

### Returning Authenticated User
```
/ (SplashScreen, 2s)
  → /home  (dashboard — auto-redirect, no onboarding)
```

### Returning Unauthenticated User (previously onboarded)
```
/ (SplashScreen, 2s)
  → /login  (skips onboarding — localStorage `qs_onboarded` flag)
    → /home  (after successful login)
```

---

## Navigation Structure

### Mobile — Bottom Tab Bar (5 tabs + FAB)

| Position | Tab | Route | Icon |
|----------|-----|-------|------|
| 1 | Friends | `/friends` | Users icon |
| 2 | Groups | `/groups` | Group icon |
| 3 (center) | **+ FAB** | Action sheet | Plus (orange) |
| 4 | Personal | `/personal` | Sparkles icon |
| 5 | Account | `/account` | User circle icon |

**FAB** opens a bottom action sheet: Add Expense / Scan Bill / Settle Up.

### Desktop — Horizontal Navbar (moodboard target)

| Item | Route |
|------|-------|
| Dashboard | `/home` |
| Groups | `/groups` |
| Expenses | `/expenses/new` |
| Friends | `/friends` |
| Analytics | `/personal/insights` |
| **+ Add Expense** (orange CTA) | `/expenses/new` |
| 🔔 Notifications | — |
| Avatar | `/account` |

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
3. OR tap "Settle up now →" on a balance card → `/settle-up`
4. Choose UPI method (GPay / PhonePe / Paytm / Cash / Other)
5. Enter amount → Submit → spring-animated success screen

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
- **Tab pages** (`/home`, `/friends`, `/groups`, `/personal`, `/activity`, `/account`): Wrap root div in `<PageTransition>` — enter-only fade + 6px y-slide (200ms ease-out). No exit animation (prevents blank-page flash).
- **Sub-pages** (`/groups/:id`, `/expenses/:id`, etc.): Individual `motion` elements inside the page provide micro-animations. No wrapper needed.
- **Bottom sheets** (`FilterSheet`, `ActionSheet`, `SettleUp success`, `ImportGroup success`): Framer Motion `y: 300 → 0` spring animation.

**Rule: Never use `AnimatePresence mode="wait"` at the route level.** This unmounts the page tree during the exit animation, causing a blank screen for the full duration. Use enter-only animations instead.

---

## Pull-to-Refresh

Available on: Friends, Groups, Activity, Home.

- Drag down from the top of the page (when already scrolled to top) ≥65px
- Spinner indicator animates in as you pull
- Release → query refetch fires
- Implemented via `usePullToRefresh` hook (touch events, no library needed)

---

## Accessibility & Usability

- **All destructive actions** (logout, remove friend, delete group) require a `ConfirmDialog` — never single-tap destructive
- **Form validation** shows inline under fields, not alert popups
- **Loading states**: skeleton rows (not spinners) for list content; button `disabled` + opacity during mutation
- **Error states**: `getAPIErrorMessage()` utility parses API errors into human-readable strings shown in-context
- **Dark mode**: `darkMode: 'class'` via Tailwind. ThemeProvider reads localStorage `qs_theme` preference and applies `dark` class to `<html>`. System preference respected by default.
- **Expense clarity**: Always show per-person amount. Never make the user calculate their share.

---

## Route Security

All routes inside `<ProtectedRoute>` redirect to `/login` if `isAuthenticated` is false (via Zustand `userStore`).

**Public routes:** `/`, `/onboarding`, `/login`, `/register`

**Protected routes:** Everything else — including `/home`, `/friends`, `/groups`, `/account`, etc.

**Important route ordering** in AppRoutes (specific before param):
```
/groups/new      → CreateGroup    (must be before :groupId)
/groups/import   → ImportGroup    (must be before :groupId)
/groups/:groupId → GroupDetail

/friends/add     → AddFriend      (must be before :userId)
/friends/:userId → FriendDetail
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
| Teal (#0F9D94) as current primary vs moodboard green (#1B4332) | Full rebrand requires updating all Tailwind tokens | Moodboard is the design target; token migration is a discrete V2 task |

---

## V2 Roadmap (UX impact)

### Design Rebrand
- Migrate from teal (`#0F9D94`) to forest green (`#1B4332`) primary + orange (`#FF6B35`) accent
- Swap Urbanist → Playfair Display (headings) + Inter (body)
- Illustrated empty states (replace icon-only states)
- Overlapping member avatar circles on group cards
- Expense table view (moodboard shows a list/table layout option)
- "Overdue" badge for long-pending expenses
- Analytics tab replacing or supplementing Personal tab
- Wallet section in navigation

### Features
- **Real AI chat** — Streaming Claude API responses (replace mock keyword replies)
- **Guest mode** — Try the app before signing up
- **Phone OTP login** — SMS verification for Indian users
- **Voice input** — "Split ₹1200 dinner with Rahul and Nehal"
- **Group chat** — Threaded messages per group
- **Bank SMS parsing** — Auto-detect expenses from SMS notifications
- **Home screen widgets** — Live balance widget for iOS/Android
- **Expense search** — Global search with filters (merchant, category, amount range)
- **Gamification** — Best Saver, Fast Settler badges
- **Multi-currency** — Live exchange rates
- **Export reports** — CSV / PDF / Excel
- **Recurring expenses** — Auto-detect from patterns
