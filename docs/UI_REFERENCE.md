# QuickSplit — Complete UI Reference

> **Purpose:** This document describes every screen, component, and design token in the QuickSplit mobile app with enough detail for an AI image generator to produce accurate, consistent mockups of every view.

---

## Table of Contents

1. [Design System](#1-design-system)
2. [Shared Components](#2-shared-components)
3. [Navigation Structure](#3-navigation-structure)
4. [Auth Screens](#4-auth-screens)
5. [Home Stack](#5-home-stack)
6. [Friends Stack](#6-friends-stack)
7. [Groups Stack](#7-groups-stack)
8. [Personal Stack](#8-personal-stack)
9. [Account Stack](#9-account-stack)

---

## 1. Design System

### 1.1 Color Palette

#### Brand Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#1B4332` | Primary actions, hero backgrounds, dark buttons |
| Accent | `#FF6B35` | CTAs, submit buttons, active tab indicator |
| Positive | `#22C55E` | Success states, positive balances |
| Negative | `#EF4444` | Error states, negative balances |
| Warning | `#F59E0B` | Warning banners, pending states |
| Info | `#2D7A57` | Info toasts, secondary green |

#### Light Theme Surfaces
| Token | Hex | Usage |
|-------|-----|-------|
| bg | `#FFFDF9` | Screen background (warm off-white) |
| card | `#FFFFFF` | Card/panel background |
| cardBorder | `#E7E5E4` | Card borders, dividers |
| inputBg | `#FFFFFF` | Text input background |
| inputBorder | `#E7E5E4` | Input border |
| pillBg | `#F3F4F6` | Chip/badge backgrounds |

#### Light Theme Text
| Token | Hex | Usage |
|-------|-----|-------|
| text | `#111827` | Primary body text |
| textSub | `#6B7280` | Secondary/meta text |
| textMuted | `#9CA3AF` | Placeholder, captions |
| sectionLabel | `#374151` | Section headings |

#### Dark Theme Surfaces
| Token | Hex | Usage |
|-------|-----|-------|
| bg | `#0F1F17` | Dark screen background |
| card | `#1A2E22` | Dark card background |
| cardBorder | `#2D4A38` | Dark card borders |
| inputBg | `#1A2E22` | Dark input background |
| inputBorder | `#2D4A38` | Dark input border |
| pillBg | `#1A2E22` | Dark chip background |

#### Semantic State Colors
| State | Background | Border | Text |
|-------|-----------|--------|------|
| Success | `#F0FDF4` | `#BBF7D0` | `#16A34A` |
| Error | `#FEF2F2` | `#FECACA` | `#DC2626` |
| Warning | `#FFFBEB` | `#FDE68A` | `#92400E` |
| Info | `#ECFDF5` | `#A7F3D0` | `#065F46` |

#### Category Colors (Groups)
| Category | Emoji | Color |
|----------|-------|-------|
| Home | 🏠 | `#0EA5E9` (sky blue) |
| Trip | ✈️ | `#F59E0B` (amber) |
| Couple | ❤️ | `#EF4444` (red) |
| Work | 💼 | `#64748B` (slate) |
| Event | 📅 | `#8B5CF6` (purple) |
| Other | 📁 | `#1B4332` (primary green) |

---

### 1.2 Typography

#### Fonts
- **Display:** `PlayfairDisplay_700Bold` / `PlayfairDisplay_800ExtraBold` — Used for titles, hero text, large amounts
- **Body:** `Inter_400Regular` / `Inter_500Medium` / `Inter_600SemiBold` / `Inter_700Bold` — Used for all body text, labels, buttons

#### Type Scale
| Role | Size | Weight | Font | Usage |
|------|------|--------|------|-------|
| Hero Amount | 48px | 800 | Playfair | Large balance on hero cards |
| Screen Title | 28–32px | 800 | Playfair | Screen headings |
| Section Title | 20–24px | 700–800 | Playfair | Section headings |
| Card Title | 16–18px | 700 | Playfair | Card headings |
| List Title | 14–15px | 700 | Inter | List item primary text |
| Body | 14px | 400–600 | Inter | Body/description text |
| Label | 13px | 600 | Inter | Form labels, badges |
| Caption | 10–12px | 600 | Inter | Metadata, timestamps |
| Micro | 9–10px | 600–700 | Inter | Sub-captions, swipe button labels |

---

### 1.3 Spacing Scale

All spacing follows a 4px base grid:

`4 · 6 · 8 · 10 · 12 · 14 · 16 · 20 · 24 · 28 · 32`

- **Screen horizontal padding:** 16px
- **Card internal padding:** 14–20px
- **Section gap:** 20–24px
- **List item gap:** 8–10px
- **Inline element gap:** 6–8px

---

### 1.4 Border Radius Scale

| Context | Radius |
|---------|--------|
| Screen-level sheets | 24px (top corners only) |
| Hero / large cards | 20–24px |
| Standard cards | 16px |
| Buttons (large) | 16px |
| Buttons (medium) | 12–14px |
| Buttons (small) | 10–12px |
| Input fields | 14–16px |
| Chips / pills | 20px (fully rounded) |
| Avatars | 10–12px |
| Tiny badges | 8px |

---

### 1.5 Shadow / Elevation

| Element | Shadow Color | Offset | Opacity | Blur |
|---------|-------------|--------|---------|------|
| Hero card | `#1B4332` | (0, 8) | 0.35 | 20 |
| Orange CTA button | `#FF6B35` | (0, 8) | 0.35 | 20 |
| FAB button | `#1B4332` | (0, 6) | 0.40 | 16 |
| Standard card | `#000000` | (0, 2) | 0.06 | 8 |

---

## 2. Shared Components

### 2.1 Avatar

- **Sizes:** 36px (list rows) · 44px (friend rows) · 48px (settle up) · 56px (account) · 72px (profile hero) · 80px (edit profile)
- **Shape:** Rounded rectangle — radius scales with size (10–20px)
- **Content:** 2-character initials, white, Inter 700, font-size ~40% of avatar size
- **Background:** User's chosen `avatar_color` (one of 8 preset colors), fallback `#1B4332`
- **Avatar Colors (8 presets):** `#1B4332` · `#0EA5E9` · `#8B5CF6` · `#EF4444` · `#F59E0B` · `#EC4899` · `#10B981` · `#6366F1`

---

### 2.2 Balance Badge / Status Chip

A compact pill that shows debt status.

| State | Background | Text | Text Content |
|-------|-----------|------|--------------|
| Settled | `#F3F4F6` | `#6B7280` | "Settled" |
| Owed to you | `#F0FDF4` | `#16A34A` | "+₹XXX" |
| You owe | `#FEF2F2` | `#DC2626` | "-₹XXX" |

- **Size:** 20px tall, horizontal padding 8px, border-radius 20px
- **Font:** 11–12px, Inter 600–700

---

### 2.3 Primary Button (Orange CTA)

- **Background:** `#FF6B35`
- **Text:** White, Inter 700, 15–16px
- **Height:** 52px (large), 44px (medium), 36px (small)
- **Border-radius:** 16px (large), 14px (medium), 12px (small)
- **Shadow:** `#FF6B35` · offset (0, 8) · opacity 0.35 · blur 20
- **Disabled state:** 0.6 opacity, no shadow
- **Active state:** 0.85 opacity

---

### 2.4 Secondary Button

- **Background:** `#F3F4F6`
- **Text:** `#374151`, Inter 700, 14px
- **Height:** 44px (medium), 36px (small)
- **Border-radius:** 14px
- **No shadow**

---

### 2.5 Dark Primary Button

- **Background:** `#1B4332`
- **Text:** White, Inter 700, 14–15px
- **Height:** 52px (large), 44px (medium)
- **Border-radius:** 16px
- **Shadow:** `#1B4332` · offset (0, 6) · opacity 0.4

---

### 2.6 Text Input

- **Background:** `#FFFFFF` (light) / `#1A2E22` (dark)
- **Border:** 1.5px solid `#E7E5E4`
- **Border-radius:** 14–16px
- **Height:** 52px (single line), auto (multiline)
- **Padding:** 14px vertical · 16px horizontal
- **Font:** Inter 400, 15px, color `#111827`
- **Placeholder color:** `#9CA3AF`
- **Focus state:** border becomes `#1B4332`, 2px

---

### 2.7 Search Bar

- **Shape:** Rounded pill, border 1px `#E7E5E4`, background `#F3F4F6`
- **Height:** 44px
- **Prefix icon:** 🔍 emoji, 16px, `#9CA3AF`, margin-right 8px
- **Input:** Flex-fill, Inter 400, 14px, placeholder "Search…"
- **Border-radius:** 14px

---

### 2.8 Toast Notification

Positioned at top of screen, 56px from top edge, 16px from sides.

| Type | Background | Border | Text | Icon |
|------|-----------|--------|------|------|
| Success | `#F0FDF4` | `#BBF7D0` | `#166534` | ✅ |
| Warning | `#FFFBEB` | `#FDE68A` | `#92400E` | ⚠️ |
| Error | `#FEF2F2` | `#FECACA` | `#991B1B` | ✕ |
| Info | `#ECFDF5` | `#A7F3D0` | `#065F46` | ℹ️ |

- **Shape:** Border-radius 16px, 1px border, padding 12px vertical · 16px horizontal
- **Shadow:** `#000` · offset (0, 2) · opacity 0.08 · blur 8
- **Animation:** Fades in + slides up 20px over 300ms
- **Auto-dismiss:** 4 seconds

---

### 2.9 Empty State

Centered vertically in the content area.

- **Icon container:** 80×80px circle, border-radius 24px, background `#F3F4F6`, 1.5px border `#E7E5E4`
- **Icon:** 36px emoji, centered
- **Title:** 18px, Playfair 800, `#111827`, margin-bottom 6px
- **Subtitle:** 14px, Inter 400, `#9CA3AF`, line-height 20px, max-width 240px, centered
- **CTA Button:** Orange primary button, margin-top 20px

---

### 2.10 Skeleton Loader

Animated pulsing placeholder shown while data loads.

- **Color:** `#E7E5E4`
- **Animation:** Opacity pulses 0.4 → 0.8 → 0.4, 700ms cycle
- **Card skeleton:** Full-width, 80px tall, border-radius 16px
- **Row skeleton:** Variable width, 16px tall, border-radius 8px
- **Friend row skeleton:** 44px avatar circle + two rows of text + chip (all gray rectangles)

---

### 2.11 Filter Sheet (Bottom Sheet Modal)

- **Overlay:** Full screen, background `rgba(0,0,0,0.4)`
- **Sheet:** Slides up from bottom with spring animation
  - Background: `#FFFDF9` (light) / `#0F1F17` (dark)
  - Top corners border-radius: 24px
  - Padding: 20px
- **Drag handle:** 36×4px rectangle, border-radius 2px, `#D1D5DB`, centered, 12px below top
- **Title:** 16px, Inter 700, `#111827`
- **Option rows:** Full width, padding 14px vertical, hairline bottom border
  - Label: 15px, `#374151`; active: 700 weight, `#1B4332`
  - Radio circle: 22×22px, border-radius 11px, 2px border `#D1D5DB`; active: `#1B4332` border + 10×10px green dot
- **Cancel button:** Secondary button, margin-top 16px, full-width

---

### 2.12 Floating Action Button (FAB)

- **Position:** Absolute, bottom 90px, right 20px
- **Size:** 56×56px, border-radius 28px (circle)
- **Background:** `#1B4332`
- **Icon:** "+" in white, 28px, Inter 300
- **Shadow:** `#1B4332` · offset (0, 6) · opacity 0.4 · radius 16 · elevation 10

**FAB Action Sheet (opens on tap):**
- Semi-transparent overlay (taps through to close)
- Sheet slides up from bottom
- 3 action rows:
  1. Add Expense — icon circle bg `#FF6B35`, emoji 💸, label "Add Expense", sublabel "Split a bill manually"
  2. Scan Bill — icon circle bg `#F59E0B`, emoji 📷, label "Scan Bill", sublabel "Auto-fill from receipt"
  3. Settle Up — icon circle bg `#22C55E`, emoji ✅, label "Settle Up", sublabel "Record a payment"
- Each row: icon circle 48×48px + text stack + arrow (›)

---

### 2.13 Category Selector Grid

Used in Add Expense and Create Group flows.

- **Layout:** Wrap grid, 3–5 columns
- **Each cell:** 64×72px, border-radius 14px, 1.5px border
- **Inactive state:** Background `#FFFFFF`, border `#E7E5E4`, text `#374151`
- **Active state:** Background `#F0FDF4`, border `#1B4332`, text `#1B4332`
- **Content:** Emoji (24px) + label (11px, Inter 600) stacked vertically, centered

---

### 2.14 Step Indicator (Wizard Progress)

Used in Create Group (3 steps) and similar multi-step flows.

- **Layout:** Horizontal row, centered
- **Circle:** 28×28px, border-radius 14px
  - Pending: White background, 1.5px border `#E7E5E4`, number in `#9CA3AF`
  - Current: `#1B4332` background, white number
  - Completed: `#1B4332` background, white checkmark ✓
- **Connector line:** 40px wide, 2px height
  - Incomplete: `#E7E5E4`
  - Complete: `#1B4332`
- **Label:** 10px, Inter 600, below each circle

---

## 3. Navigation Structure

### 3.1 Bottom Tab Bar

Always visible when logged in. 5 tabs, positioned at bottom of screen.

- **Background:** `#FFFFFF` (light) / `#1A2E22` (dark)
- **Height:** ~83px (including safe area inset)
- **Top border:** 1px `#E7E5E4`
- **Active tab:** Emoji + label in `#FF6B35` (orange)
- **Inactive tab:** Emoji + label in `#9CA3AF` (gray)
- **Label font:** 10px, Inter 600

| Tab | Emoji | Label |
|-----|-------|-------|
| 1 | 🏠 | Home |
| 2 | 👥 | Friends |
| 3 | 🏝️ | Groups |
| 4 | ✨ | Personal |
| 5 | 👤 | Account |

---

### 3.2 Stack Header Pattern

Used within each tab's stack navigator.

- **Background:** Screen bg color (no separate header bar)
- **Title:** 24px, Playfair 800, `#111827`
- **Back button:** "‹" or "← Back" text, or `<` icon, `#1B4332` color
- **Right action buttons:** Small rounded buttons, 36px height

---

## 4. Auth Screens

### 4.1 Splash Screen

**Background:** Solid `#1B4332` (dark forest green), fills entire screen.

**Layout:** Vertically and horizontally centered, single column.

**Elements (top to bottom):**
1. **Logo Box**
   - Size: 80×80px, border-radius 24px
   - Background: `rgba(255,255,255,0.15)` (frosted glass)
   - Border: 1px `rgba(255,255,255,0.25)`
   - Content: Letter "Q" — Playfair Display 700, 36px, white
2. **App Name**
   - Text: "QuickSplit"
   - Font: Playfair Display 700, 32px, white
   - Margin-top: 16px
3. **Tagline**
   - Text: "Split Smart. Live More."
   - Font: Inter 400, 14px, `rgba(255,255,255,0.65)`
   - Margin-top: 8px

**Animation:** Entire group fades in and translates up 20px over 600ms on mount.

**Behavior:** Auto-navigates to Onboarding after 2 seconds (or Home if already logged in).

---

### 4.2 Onboarding Screen

**Background:** Theme background `#FFFDF9` (light mode).

**Layout:** Full screen, vertically centered.

**Top-right:** "Skip" text link — 14px, Inter 600, `#1B4332`

**Slide Area (centered):**
1. **Main Emoji:** 80px emoji, centered
2. **Title:** 26px, Playfair 700, `#111827`, centered, margin-top 28px
3. **Body Text:** 16px, Inter 400, `#6B7280`, centered, line-height 24px, max-width 300px, margin-top 12px

**5 Slides:**
| # | Emoji | Title | Body |
|---|-------|-------|------|
| 1 | 🍕 | "Split bills effortlessly" | "Add expenses and split them instantly with friends and groups" |
| 2 | 👥 | "Track group debts" | "Create groups for trips, rent, or anything. Stay on top of who owes what" |
| 3 | ⚡ | "Settle instantly" | "Pay directly via GPay, PhonePe, or Paytm right from the app" |
| 4 | 🤖 | "AI-powered insights" | "Get smart summaries, spending analysis, and suggestions from your AI assistant" |
| 5 | 📷 | "Scan any receipt" | "Point your camera at any bill and we'll split it automatically" |

**Pagination Dots (below slide):**
- Inactive: 8×8px circle, `#D1D5DB`, border-radius 4px
- Active: 8×24px pill (width animates), `#FF6B35`, border-radius 4px
- Gap between dots: 6px

**CTA Button:**
- Full width (minus 32px side padding), height 52px
- Orange primary button
- Text: "Get Started →" (last slide) / "Next →" (other slides)
- Margin-bottom: 40px (above safe area)

---

### 4.3 Login Screen

**Background:** `#FFFDF9`

**Safe Area:** Full screen scroll view.

**Layout (top to bottom, 24px horizontal padding):**

1. **Logo Block** — margin-top 60px
   - Box: 56×56px, border-radius 18px, background `#1B4332`, shadow: `#FF6B35` (0, 4, 0.3, 12)
   - Letter "Q": Playfair 700, 24px, white
   - Spacing below: 20px

2. **Heading**
   - "Welcome back" — Playfair 800, 28px, `#111827`
   - "Sign in to your QuickSplit account" — Inter 400, 14px, `#6B7280`, margin-top 6px

3. **Error Alert** (conditional, shows on failed login)
   - Background `#FFF1F2`, border 1px `#FECACA`, border-radius 14px, padding 12px
   - Text: red `#EF4444`, 13px, Inter 600

4. **Email / Phone Field**
   - Label: "Email or phone number" — 13px, Inter 600, `#374151`, margin-bottom 6px
   - TextInput (standard input styling)
   - Keyboard: email-address

5. **Password Field**
   - Label row: "Password" (left, 13px Inter 600) + "Forgot password?" (right, 13px Inter 600, `#1B4332`)
   - TextInput with eye toggle:
     - Input fills flex
     - Eye button: 36×36px touchable, emoji (👁 / 🙈), 16px, right side

6. **Submit Button**
   - "Sign In" — Orange primary button, full width, height 52px
   - Margin-top: 24px
   - Disabled when fields empty (0.6 opacity)

7. **Footer**
   - Centered row: "Don't have an account? " (gray, 14px) + "Sign up free" (`#1B4332`, 14px, Inter 700)
   - Margin-top: 24px

---

### 4.4 Register Screen

**Background:** `#FFFDF9`

**Layout** (same header as Login — logo + "Create account" title + subtitle):

**Form Fields (in order):**
1. **Full Name** — placeholder "e.g. Rohan Mehta"
2. **Phone Number** — numeric keyboard, placeholder "10-digit mobile number", label note "Must start with 6–9"
3. **Email** (optional) — label shows "(optional)" in gray, email keyboard
4. **Password** — eye toggle
5. **Confirm Password** — eye toggle

**Validation Errors** (inline below field or top alert box):
- "Phone must start with 6–9"
- "Password must be at least 6 characters"
- "Passwords do not match"

**Terms Checkbox Row:**
- Custom checkbox: 20×20px, border-radius 6px, 2px border `#D1D5DB`
- Checked state: `#1B4332` fill + white ✓ checkmark
- Text: 13px Inter 400, `#6B7280` + links "Terms of Service" and "Privacy Policy" in `#1B4332`

**Submit Button:** "Create Account" — Orange primary, full width, 52px

**Footer:** "Already have an account? Sign in" — same style as Login footer

---

## 5. Home Stack

### 5.1 Home Screen

**Background:** `#FFFDF9`

**Scroll:** Vertical ScrollView, no scroll indicator.

---

#### Section 1 — Hero Card

Full-width card, border-radius 24px, padding 20px.
**Background:** Linear gradient `#1B4332` → `#163829` (vertical).

**Top row (flex, space-between):**
- Left: Greeting text
  - Line 1: "Good morning, [First Name] 👋" — Playfair 700, 18px, white
  - Line 2: Day + date — Inter 500, 12px, `rgba(255,255,255,0.6)`
- Right: Avatar circle — 36×36px, rounded 10px, user's avatar_color bg, white initials (Inter 700, 14px)

**Quote Block** (margin-top 16px):
- Left border: 2px solid `rgba(255,255,255,0.35)`, padding-left 12px
- Quote text: Inter 400 italic, 13px, `rgba(255,255,255,0.9)`, line-height 20px, 2 lines max
- Author: Inter 600, 11px, `rgba(255,255,255,0.5)`, margin-top 4px

---

#### Section 2 — Balance Card

Full-width card, border-radius 24px, padding 20px.
**Background:** Linear gradient `#1B4332` → `#163829` (vertical).

**Status row:**
- Left column:
  - Label: "YOU ARE OWED" / "YOU OWE" / "ALL SETTLED UP" — Inter 600, 10px, `rgba(255,255,255,0.55)`, letter-spacing 1.5
  - Amount: Playfair 800, 30px, white
- Right column: Emoji icon — 40×40px circle, `rgba(255,255,255,0.12)` bg, 22px emoji centered

**Stats subrow** (margin-top 16px, flex row with 1px dividers):
- 3 stats: "Owed to You" | "You Owe" | "Net"
- Each: value (Inter 800, 16px, white) + label (Inter 600, 10px, `rgba(255,255,255,0.55)`)
- Positive net: `#22C55E`; Negative net: `#EF4444`

**Settle Up button** (shown when user owes money):
- Small, orange bg, right-aligned
- "Settle Up →" — Inter 700, 12px, white, padding 6px ×12px, border-radius 10px

---

#### Section 3 — Quick Action Buttons

**Layout:** 4 buttons in a horizontal row, equal flex, gap 8px.

| Button | Emoji | Label | Background |
|--------|-------|-------|------------|
| Add | 💸 | "Add" | `#FF6B35` |
| Scan | 📷 | "Scan" | `#F59E0B` |
| Settle | ✅ | "Settle" | `#22C55E` |
| Friend | 👥 | "Friend" | `#8B5CF6` |

Each button:
- Height: 64px, border-radius 16px
- Emoji: 22px, centered above label
- Label: Inter 700, 10px, white
- Active opacity: 0.85

---

#### Section 4 — AI Insight Card

Card with border 1.5px `#E7E5E4`, border-radius 16px, padding 14px, background white.

**Layout:** Horizontal row
- Left: Robot emoji 🤖 (24px) + "AI INSIGHT" badge (9px, `#1B4332`, letter-spacing 1) + insight text (13px, `#374151`, 2 lines)
- Right: "Chat →" — Inter 700, 13px, `#1B4332`

---

#### Section 5 — Your Groups

**Header row:** "Your Groups" (Playfair 700, 17px) + "See all →" (`#1B4332`, 13px Inter 600)

**Horizontal ScrollView** (showsHorizontalScrollIndicator: false):

Each group card — 140×110px, border-radius 20px, 1px border, white bg, padding 14px:
- Top: 36×36px emoji circle (category color tinted bg) + emoji (18px)
- Group name: Inter 700, 12px, `#111827`, margin-top 8px, 2 lines max
- Balance badge: pill at bottom, color matches balance state (see Badge component)

**Empty state:** "No groups yet" text + "Create one →" link

---

#### Section 6 — Who Owes You

**Header:** "Who owes you (X)" — Playfair 700, 17px + "See all" link

**List card:** White bg, border-radius 16px, 1px border.

Each row (border-bottom hairline, padding 12px ×16px):
- Avatar (36×36px) + name (Inter 700, 14px) + email (Inter 400, 12px, gray) — flex grow
- Right: Amount (Inter 800, 14px, `#16A34A`) + "Remind 🔔" small button (border 1px `#E7E5E4`, radius 10px, 11px text)

---

#### Section 7 — You Owe

Same layout as above but:
- Amount in `#DC2626` (red)
- Action button: "Settle →" in `#FF6B35` text, light orange bg

---

#### Section 8 — Recent Activity

**Header:** "Recent Activity" + "See all" link

**List:** 3–5 items max on home screen.

Each row:
- Icon circle (32×32px, light bg): 💸 for expense, ✅ for settlement
- Text: description (Inter 700, 13px) + "via [Group]" (Inter 400, 11px, gray)
- Right: Date (Inter 400, 11px, gray)

---

#### FAB Button

(See shared component 2.12)

---

### 5.2 Activity Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" button (top-left) + "Activity" title (Playfair 800, 24px, centered or left)

**FlatList** — each row:
- Icon circle (40×40px, `#F3F4F6` bg, radius 12px): 💸 or ✅ emoji (18px)
- Description: Inter 700, 14px, `#111827`
- Meta: Inter 400, 12px, `#6B7280` — "[Group name] · [Date]"
- Right: Amount (Inter 800, 14px) — green if you were paid, red if you owe
- Your share: Inter 400, 11px, `#9CA3AF` — "Your share: ₹XX"

Row: white card, border-radius 14px, margin-bottom 8px, padding 14px ×16px, 1px border.

**Empty state:** 📋 icon + "No activity yet" + "Add your first expense"

---

### 5.3 Balances Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "Balances" title

**Summary Stats Bar** (3 columns with 1px dividers):
- "Owed to you" — Inter 600, 11px, gray / amount Inter 800, 16px, `#16A34A`
- "You owe" — / amount in `#DC2626`
- "Net balance" — / amount in green or red

**Two sections:**

**Section: "Owed to you (X)"**
- Section label: Inter 700, 13px, `#374151`
- Rows: Avatar (44×44px) + name (Inter 700, 14px) + "owes you ₹XXX" (12px green) + amount (Inter 800, 16px, green)

**Section: "You owe (Y)"**
- Rows: Avatar + name + "you owe ₹XXX" (12px red) + amount (16px red) + "Settle" button (small, dark green, right)

**Empty state:** ⚖️ icon + "All settled up!" + "You have no outstanding balances"

---

### 5.4 Add Expense Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "Add Expense" (Playfair 800, 24px) + "Save" button (orange, 36px height, right)

---

**Amount Card** (full-width, dark green gradient, border-radius 24px, padding 24px):
- Currency symbol: "₹" — Inter 700, 32px, `rgba(255,255,255,0.5)`, left of input
- Amount input: Inter 800, 48px, white, text-align center
- Hint text (equal split): "₹XX.XX each · X people" — Inter 500, 13px, `#FF6B35`, margin-top 8px, centered

---

**Form Fields** (ScrollView, 16px horizontal padding, 20px vertical gap between fields):

**Description**
- Label: "What's this for?" — 13px Inter 600, `#374151`
- Input: standard text input
- Placeholder: "e.g. Dinner at Barbeque Nation"

**Category**
- Label: "Category"
- Dropdown trigger: full-width row, border 1.5px, radius 14px, showing emoji + label + ‹› arrows
- Dropdown menu: overlaid list of categories (see Category Selector Grid)

**Group** (optional)
- Label: "Add to group (optional)"
- Dropdown trigger showing group name or "No group (personal)"

**Paid By**
- Label: "Paid by"
- Row: Avatar (28×28px) + name (Inter 700, 14px) + dropdown (›) if multiple participants

**Split With**
- Label: "Split with"
- Horizontal scroll of chips:
  - Each person: `#F0FDF4` bg, `#1B4332` text (name), × close in `#1B4332`, radius 20px, height 32px
  - "+ Add" chip: dashed 1px border `#E7E5E4`, `#9CA3AF` text, same height

**Split Type**
- Label: "How to split"
- 4-button toggle row (flex, gap 8px):
  - "Equal" · "Exact ₹" · "%" · "Shares"
  - Inactive: white bg, 1px border `#E7E5E4`, `#374151` text
  - Active: `#F0FDF4` bg, 1.5px border `#1B4332`, `#1B4332` text, Inter 700

**Per-Person Inputs** (shown for Exact/Percentage/Shares split):
- One row per participant: Avatar (28×28) + name (flex-grow) + input (100px wide, right-aligned)
- Input: number keyboard, right-aligned text

**Scan Receipt Button**
- Full-width, dashed 1.5px border `#E7E5E4`, radius 14px, padding 14px, white bg
- Content: "📷 Scan Receipt to Pre-fill Amount" — Inter 600, 13px, `#FF6B35`

**Date**
- Label: "Date"
- Tap target showing "📅 June 8, 2026" — same as dropdown styling

**Notes** (optional)
- TextArea: min-height 60px, multiline, placeholder "Any notes…"

**Recurring Toggle**
- Label row: "Recurring expense" + Switch (iOS-style, green when on)
- Expanded (if on): Frequency row — "Weekly" · "Monthly" · "Yearly" toggle buttons

---

**Date Picker Modal:**
- Overlay: full screen, `rgba(0,0,0,0.5)`, centered content
- Box: 85% width, white bg, radius 20px, padding 24px
- Title: "Select Date" — Playfair 700, 16px, centered
- 3-column row (Day | Month | Year):
  - Column label: 12px Inter 500, gray, centered
  - Input: 48px height, `#F3F4F6` bg, radius 12px, Inter 700, 18px, centered
- Button row: "Cancel" (secondary) + "Confirm" (dark green primary), 10px gap

---

**User Picker Modal:**
- Sheet from bottom, drag handle, title "Select Participants"
- Rows: Avatar (36×36) + name (Inter 700, 14px) + email (12px gray) + custom checkbox (right)
- Active checkbox: `#1B4332` fill + white ✓
- Buttons: "Cancel" + "Confirm (X)" — full width, gap 10px

---

### 5.5 Expense Detail Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "Expense Detail" (Playfair 800) + "Delete" (red text, 14px) — only shown if user is payer

---

**Hero Section** (white card, radius 20px, margin 16px, padding 20px):
- Category box: 68×68px, `#F3F4F6` bg, radius 18px, category emoji 32px centered
- Description: Playfair 700, 20px, `#111827`, margin-top 12px
- Amount: Inter 800, 32px, `#1B4332`
- Per-person hint (orange): "₹XX each" — Inter 700, 14px, `#FF6B35`
- Meta: "Rohan paid · June 8, 2026" — Inter 400, 13px, `#6B7280`
- **Badge row** (flex-wrap, gap 6px, margin-top 8px):
  - "You paid" — `#F0FDF4` bg, `#16A34A` text, radius 20px, 11px Inter 700
  - Group name — same style
  - "Overdue" (if applicable) — `#FEF2F2` bg, `#DC2626` text

---

**Reactions Section:**
- Title: "Reactions" (Inter 700, 14px, margin-bottom 8px)
- 5 emoji buttons in a row: 👍 ❤️ 😂 😮 😢
- Each: 38×36px, radius 10px, `#F3F4F6` bg, 1px border
- Active (tapped): `#FFFBEB` bg + count shown (Inter 700, 13px)

---

**Split Section:**
- Title: "Split (X people)"
- Rows: Avatar (36×36) + name (Inter 700, 14px) + "owes ₹XX" (12px gray) — right: status badge
  - Settled: "Settled ✓" — `#F0FDF4` bg, `#16A34A` text
  - Pending: "Pending" — `#F3F4F6` bg, `#6B7280` text

---

**Receipt/Notes Section:**
- Title: "Receipt" or "Notes"
- If receipt: emoji 🧾 + OCR text block (13px, `#374151`)
- If no receipt: dashed button "📎 Attach Receipt"
- Notes: plain text, 14px, `#374151`

---

**Comments Section:**
- Title: "Comments (X)"
- Each comment: Avatar (32×32) + name (Inter 700, 12px) + time (10px gray) + comment bubble (white card, 1px border, radius 12px, 13px text)
- Empty: "No comments yet. Be the first!"

**Comment Input Bar** (sticky bottom, white bg, top border):
- TextInput (light bg, radius 20px, padding 10px ×16px) + Send button (orange circle 40px)

---

### 5.6 Settle Up Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "Settle Up" (Playfair 800)

---

**Friend Card** (white, border-radius 20px, padding 16px, border 1px):
- Avatar (48×48px) + name (Inter 700, 16px) + balance label (13px, color-coded)
- Balance: "Devanshu owes you ₹500" (green) / "You owe Devanshu ₹500" (red)

---

**AI Suggestion Card** (margin-top 12px):
- Background: `#F0FDF4`, border `#BBF7D0`, radius 14px, padding 12px
- "💡 Settle in 1 payment to close all outstanding balances" — Inter 600, 13px, `#166534`

---

**Payment Method Tabs** (horizontal scroll, gap 8px, margin-top 16px):

| Method | Emoji | 
|--------|-------|
| GPay | 🟢 |
| PhonePe | 💜 |
| Paytm | 🔵 |
| Cash | 💵 |
| Other | 💳 |

Each tab: min-width 70px, height 44px, radius 12px, emoji (20px) + label (11px Inter 600), centered.
- Inactive: `#F3F4F6` bg, `#374151` text
- Active: `#F0FDF4` bg, `#1B4332` text, 1.5px border `#1B4332`

---

**Amount Card** (same as Add Expense — dark green gradient, large ₹ input)

---

**Open in App Button** (if UPI method selected + UPI ID exists):
- `#F0FDF4` bg, 1px `#BBF7D0` border, radius 14px, padding 14px
- "Open in GPay →" — Inter 700, 15px, `#1B4332`

**No UPI Warning** (if no UPI ID on friend):
- `#FFFBEB` bg, `#FDE68A` border, radius 14px, padding 12px
- "⚠️ Friend hasn't added a UPI ID yet" — Inter 600, 13px, `#92400E`

---

**Notes + UPI Txn Row** (flex row, 2 columns, gap 8px):
- Notes input (flex 1): placeholder "e.g. Cash payment"
- UPI Txn input (flex 1): placeholder "Txn ID (optional)"

---

**Record Settlement Button:** Dark green primary, full-width, height 52px, "Record Settlement" text

---

**Success View** (replaces form after submit):
- ✅ emoji (52px), centered
- "Payment Recorded!" — Playfair 800, 22px, `#1B4332`
- "You settled ₹500 with Devanshu" — Inter 400, 14px, `#6B7280`
- QR code image (200×200px, if available)
- "Done" button — dark green primary, centered, width 160px

---

### 5.7 Scan Screen

**Background:** Black (camera view).

**Full-screen camera preview** (fills screen).

**Overlay elements:**
- **Scan frame:** 260×340px white border (2px), centered on screen, radius 12px
- **Corner brackets:** Small L-shapes at each corner of frame (orange `#FF6B35`)
- **Instruction text:** "Position receipt inside the frame" — white, 14px, centered, 20px below frame
- **Flash toggle** (top-right): 40×40px circle, `rgba(0,0,0,0.5)` bg, ⚡ emoji
- **Close button** (top-left): 40×40px circle, `rgba(0,0,0,0.5)` bg, "×" white

**Bottom Bar** (`rgba(0,0,0,0.7)` bg, height 120px):
- Center: Capture button — 64px circle, white border 3px, white fill
- Right: Gallery button — 44×44px rounded square, `rgba(255,255,255,0.2)` bg, 📁 emoji

---

### 5.8 Split Screen (OCR Review)

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "Review Receipt" (Playfair 800) + "Next →" button (orange, top-right)

**Receipt Image Preview** (100px tall, full-width, rounded 16px, object-fit cover)

**Extracted Items** (editable list):
Each item row (white card, radius 12px, margin-bottom 8px, padding 12px ×16px):
- Item name: editable text input (left, flex-grow)
- Amount: editable number input (right, 80px, Inter 700)
- × delete button (right edge, `#EF4444` text)

**+ Add Item** row: dashed border, "+ Add item" in `#1B4332`, centered

**Total bar** (fixed bottom, white bg, top border):
- "Total: ₹XXX" — Playfair 700, 18px, left
- "Next →" button — orange primary (right)

---

### 5.9 Review Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "Confirm Expense" (Playfair 800)

**Summary card** (white, radius 20px, padding 20px):
- All expense details displayed as key-value rows
- Amount (large, `#1B4332`, Playfair 800, 28px), centered
- Description (16px)
- Category emoji + label
- Date
- Paid by: avatar + name
- Split: per-person list

**Edit buttons** on each row: small "Edit" link in `#1B4332`

**Submit Button:** "Add Expense ✓" — Orange primary, full-width

---

### 5.10 OCR History Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "Scan History" (Playfair 800)

**List of scanned receipts:**
Each card (white, radius 16px, margin-bottom 10px, padding 14px):
- Thumbnail preview: 56×56px, rounded 12px, left
- Title: Inter 700, 14px (description or "Untitled Receipt")
- Date: Inter 400, 12px, gray
- Amount: Inter 800, 14px, right
- Status badge: "Submitted" (green) / "Pending" (gray)

---

## 6. Friends Stack

### 6.1 Friends Screen

**Background:** `#FFFDF9`

**Header Row:** "Friends" (Playfair 800, 24px, left) + Filter button + Add button
- Filter button: 36px height, radius 12px, "⚙ Filter" text, 13px
  - Inactive: `#F3F4F6` bg, `#374151` text
  - Active: `#F0FDF4` bg, `#1B4332` text, 1px border `#1B4332`
- Add button: 36px height, radius 12px, `#FF6B35` bg, "Add +" text, 13px Inter 700, white

**Balance Summary Chips** (shown if any balance exists):
- Two side-by-side chips (flex, gap 12px):
  - Left: "You're owed" — label (11px gray) + "₹XXX" (16px Inter 800, `#16A34A`)
  - Right: "You owe" — label + amount in `#DC2626`

**Search Bar** (see component 2.7)

**Pending Requests Banner** (yellow, shown if any pending):
- `#FFFBEB` bg, `#FDE68A` border, radius 14px, padding 14px
- "1 pending request" — Inter 700, 13px, `#92400E`
- Request row: Avatar (36×36) + name/email + "Accept" button (dark green, small)

**Friends FlatList** (Swipeable rows):

Each friend row (white card, radius 16px, margin-bottom 8px, padding 14px ×16px):
- Avatar (44×44px, radius 12px)
- Name: Inter 700, 14px, `#111827`
- Email: Inter 400, 12px, `#6B7280`
- Right: Amount (Inter 700, 12px) + Status chip (see Badge component)

**Swipe-right reveals (4 buttons):**
| Button | Emoji | Color | Label |
|--------|-------|-------|-------|
| Add Expense | ➕ | `#1B4332` | "Add" |
| Settle | 💸 | `#FF6B35` | "Settle" |
| Remind | 🔔 | `#F59E0B` | "Remind" |
| Remove | ✕ | `#EF4444` | "Remove" |
Width 70px each, label 9px white below emoji.

**Empty State:** 👥 icon + "No friends yet" + "Add your first friend"

---

### 6.2 Add Friend Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "Add Friend" (Playfair 800)

**Tab Bar** (2 tabs):
- "Email / Name" | "Scan QR"
- Active tab: white bg, `#1B4332` bottom border 2px
- Container: `#F3F4F6` bg, radius 12px, padding 4px

**Email Tab:**

Search bar (full-width): 🔍 prefix + "Search by name or email…" placeholder + loading spinner (right, shows while typing).

Hint text: "Type at least 2 characters to search" — 13px Inter 400, gray, centered

**Results list:**
Each user row:
- Avatar (44×44) + Name (Inter 700, 14px) + email (12px gray, ellipsis)
- Right: "Add +" button (dark green, 11px, height 32px) / "Sent ✓" (light green bg, `#16A34A` text) once sent

**QR Scan Tab:**

Permission not yet requested:
- Centered: 🔐 emoji + "Camera needed to scan QR codes" (14px gray) + "Allow Camera" button (dark green)

Permission denied:
- Centered: "Camera permission denied. Open Settings to enable." (14px gray)

Camera active:
- Full camera view
- Centered overlay frame: 240×240px white-border square
- Text below: "Scan a friend's QuickSplit QR code" — white, 14px
- "Scan Again" button (if already scanned): white bg, dark text, centered below frame

---

### 6.3 Friend Detail Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "Friend Detail" (Playfair 800)

---

**Hero Profile Card** (white, radius 20px, padding 20px, shadow):
- Avatar (72×72px, radius 20px), centered
- Name: Playfair 700, 20px, `#111827`, margin-top 12px
- Email: Inter 400, 13px, `#6B7280`
- Status badge (centered, below email):
  - "All settled up ✓" — `#F0FDF4` bg, `#16A34A` text
  - "Devanshu owes you ₹500" — same green
  - "You owe Devanshu ₹500" — `#FEF2F2` bg, `#DC2626` text
- "Settle Up" button (dark green, 44px height, width 160px, centered) — shown if balance exists

---

**Tab Bar** (2 tabs): "Expenses (X)" | "Settlements (Y)"

**Expenses Tab:**
- Same expense rows as Activity Screen
- Empty: "No shared expenses yet"

**Settlements Tab:**
Each row (white card, radius 14px, margin-bottom 8px):
- Icon circle (40×40): 📥 green bg (received) / 📤 red bg (paid)
- "Devanshu paid you" / "You paid Devanshu" — Inter 700, 14px
- Date + notes — 12px gray
- Amount right: "+₹500" green / "-₹500" red, Inter 800

Empty: "No settlements yet"

---

## 7. Groups Stack

### 7.1 Groups Screen

**Background:** `#FFFDF9`

**Header Row:** "Groups" (Playfair 800) + Filter button + "New" button (same pattern as Friends screen)

**Search Bar** — full width

**Category Pills** (horizontal scroll, gap 8px, margin-bottom 16px):
Each pill: radius 20px, height 34px, padding horizontal 14px

| Pill | Emoji | Label |
|------|-------|-------|
| All | — | "All" |
| Home | 🏠 | "Home" |
| Trip | ✈️ | "Trip" |
| Couple | 💑 | "Couple" |
| Work | 💼 | "Work" |
| Other | 🎉 | "Other" |

Inactive: `#F3F4F6` bg, `#374151` text.
Active: `#F0FDF4` bg, `#1B4332` text, 1.5px border `#1B4332`, Inter 700.

**Group Cards** (FlatList, margin-bottom 10px):

Each card (white bg, radius 16px, 1px border, padding 16px):
- **Left:** Category badge 48×48px, radius 14px, tinted category color (20% opacity), emoji 22px centered
- **Middle (flex-grow):**
  - Group name: Inter 700, 15px, `#111827`
  - Member avatars row: up to 4 overlapping circles (24×24px, radius 7px, -6px margin), then "+X" badge if more
  - "X members" — Inter 400, 12px, `#6B7280`
- **Right:** Balance chip (see Badge component)

**Empty state:** 🏝️ icon + "No groups yet" + "Create your first group"

---

### 7.2 Create Group Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "New Group" (Playfair 800)

**Step Indicator** (see component 2.14) — 3 steps: Details · Members · Settings

---

**Step 1 — Details:**

Group Name field (required):
- Label: "Group Name *"
- Placeholder: "e.g. Goa Trip 2025"

Description field (optional):
- Label: "Description (optional)"
- Placeholder: "What's this group for?"

Category selection:
- Label: "Category"
- 5-cell grid (see Category Selector Grid): 🏠 Home · ✈️ Trip · 💑 Couple · 💼 Work · 🎉 Other

**"Next →" button** — orange primary, full-width, bottom

---

**Step 2 — Members:**

Hint text: "Add friends by email. They'll get an invitation." — 13px gray, margin-bottom 16px

Email input row:
- TextInput (flex-grow, email keyboard) + "Add" button (dark green, 40px height, margin-left 8px)

Chips row (wrap, gap 8px, shown when members added):
- Each chip: `#F0FDF4` bg, `#1B4332` text (email), × button, radius 20px, height 32px

Empty note (if no members): light bg box, centered "Invite friends by email"

**"Next →" button** — orange primary, full-width, bottom

---

**Step 3 — Settings:**

Hint text: "Choose how expenses are split by default." — 13px gray

3 method cards (each: white bg, 1.5px border, radius 16px, padding 14px, margin-bottom 10px):

| Method | Emoji | Title | Description |
|--------|-------|-------|-------------|
| Equal Split | ⚖️ | "Equal Split" | "Everyone pays the same amount" |
| Proportional | 📊 | "Proportional" | "Split based on each person's earnings" |
| Custom | ✏️ | "Custom" | "Set amounts manually each time" |

Row layout: emoji (26px, in 44×44px circle bg) + title (Inter 700, 15px) + description (Inter 400, 12px gray) + radio button (right)

Active card: `#F0FDF4` bg, `#1B4332` border.
Radio button: 22×22px circle, 2px border — active: `#1B4332` border + 10×10 green dot inside.

**"Create Group" button** — orange primary, full-width, bottom

---

### 7.3 Group Detail Screen

**Background:** `#FFFDF9`

---

**Hero Section** (dark gradient — category-specific):
- **Background:** Linear gradient of category color (darkened) → `#1B4332`
- **Safe area top padding**
- Back button: 36×36px rounded, `rgba(255,255,255,0.2)` bg, "‹" white
- Group name: Playfair 700, 20px, white
- Category emoji + name: 12px `rgba(255,255,255,0.65)`

**Quick Actions Row** (horizontal scroll, gap 8px, margin-top 16px):
5 action pills (each 60×40px, `rgba(255,255,255,0.15)` bg, radius 12px):

| Action | Emoji | Label |
|--------|-------|-------|
| Add | ➕ | "Add" |
| Settle | 💸 | "Settle" |
| Insights | 📊 | "Insights" |
| Chat | 💬 | "Chat" |
| Invite | 🔗 | "Invite" |

Emoji 20px + label 10px white, stacked.

**Analytics Row** (3 stats, 1px dividers, margin-top 16px):
- "₹X,XXX" total spent + "Total" label
- "X" member count + "Members" label
- "X" expense count + "Expenses" label

Font: values Inter 800, 16px, white; labels Inter 600, 10px, `rgba(255,255,255,0.55)`

---

**Tab Bar** (below hero, white bg, border-bottom):
3 tabs: "Expenses" | "Members (X)" | "Chat 💬"
- Inactive: Inter 600, 13px, `#6B7280`
- Active: Inter 700, 13px, `#1B4332`, 2px bottom border `#1B4332`

---

**Expenses Tab:**

Simplified Debts Block (if debts exist):
- `#FFFBEB` bg, `#FDE68A` border, radius 14px, padding 14px
- Title: "Who owes who" — Inter 700, 13px, `#92400E`
- Debt rows: Avatar (28×28) + "Name owes Name" (13px) + amount (Inter 700, right)

Expenses list:
- Section title: "Expenses (X)" — Inter 700, 14px
- Each expense row (white card, radius 14px, margin-bottom 8px, padding 14px):
  - Category circle (40×40, `#F3F4F6` bg): category emoji (18px)
  - Description: Inter 700, 14px
  - Meta: "Payer paid · Date" — 11px gray
  - Right: Total amount (Inter 800, 14px) + "Your share: ₹XX" (11px, `#FF6B35`)

Empty expenses: "No expenses yet" + "Add first expense" button

---

**Members Tab:**

Header row: "Members" + "Add Member" button (admin only)

Each member row (white card, radius 14px, margin-bottom 8px, padding 14px):
- Avatar (44×44) + name (Inter 700, 14px) + email (12px gray)
- Right: "Admin" badge (`#F0FDF4` bg, `#16A34A` text, 11px) if admin
- "Remove" button (red text, `#FEF2F2` bg, small) for non-self members (admin only)

---

**Chat Tab:**

Full-screen chat (KeyboardAvoidingView):

Message bubbles (FlatList):
- **Me (right-aligned):**
  - `#1B4332` bg bubble, white text (14px, line-height 20px)
  - Radius: 18px all corners, bottom-right 4px
  - Max-width: 72% of screen
  - Time: 10px gray below bubble, right-aligned

- **Them (left-aligned):**
  - White bg, 1px `#E7E5E4` border bubble, `#111827` text
  - Radius: 18px all corners, bottom-left 4px
  - Avatar (28×28px, radius 8px) to left of bubble
  - Name above bubble: 11px Inter 600, `#374151`
  - Time below: 10px gray

**Empty state:** Centered "No messages yet. Say hi! 👋" (14px gray)

**Input Bar** (bottom, white bg, 1px top border, padding 8px ×16px):
- TextInput: flex-grow, `#F3F4F6` bg, radius 20px, padding 10px ×16px, 14px, multiline, max-height 100px
- Send button: 44×44px circle, `#1B4332` bg, "↑" arrow white, 18px

---

**Add Member Modal:**
- Same as User Picker modal but with email input at top
- Title: "Add Member"
- Email input → search results → select → Add button

---

### 7.4 Group Insights Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "Group Insights" (Playfair 800)

**Top summary card** (dark green gradient):
- "Total Spent" label + large amount (Playfair 800, 32px, white)
- "X expenses · X members" sub-label

**Category Breakdown:**
- Donut/pie chart placeholder area (200×200px, centered)
- Category legend below: each row shows color dot + category + ₹amount + percentage

**Member Contributions:**
- Section title: "Who spent what"
- Each member row: Avatar + name + bar (proportional width, green) + amount

**Time Period Selector:**
- Pills: "This month" · "Last month" · "All time" (toggle)

---

### 7.5 Import Group Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "Import Group" (Playfair 800)

**Center content:**
- 📥 emoji (64px)
- "Import from Splitwise" — Playfair 700, 22px
- "Connect your Splitwise account to import groups and expenses" — 14px gray, centered
- "Connect Splitwise" button (dark green primary, 200px wide, centered)

**Progress state** (after connecting):
- Loading spinner + "Importing your data…" text
- "Do not close the app" hint in gray

**Success state:**
- ✅ large + "X groups, Y expenses imported!" — Playfair 700, 20px
- "View Groups" button (orange primary)

---

## 8. Personal Stack

### 8.1 Personal Screen

**Background:** `#FFFDF9`

**Header:** "Personal Finance" (Playfair 800, 24px) + subtitle "Your financial hub" (14px gray)

---

**Weekly Spending Card** (full-width, dark green gradient, radius 24px, padding 20px):

Top row:
- Left: "THIS WEEK" — Inter 600, 11px, `rgba(255,255,255,0.55)`, letter-spacing 1.5
- Left below: Amount — Playfair 800, 26px, white
- Right: "Last 7 days" — Inter 400, 12px, `rgba(255,255,255,0.65)`

**Bar Chart** (margin-top 20px):
- 7 equal-width bars with gaps
- Bar height proportional to daily spend (max height 48px)
- Today's bar: `#FF6B35` (orange)
- Other bars: `rgba(255,255,255,0.25)` (semi-transparent white)
- Bar border-radius: 4px top corners
- Day labels below: "Su Mo Tu We Th Fr Sa" — 9px Inter 400, `rgba(255,255,255,0.55)`, centered below each bar

---

**Feature Cards** (vertical list, gap 12px, margin-top 20px):

4 cards (each: white bg, radius 16px, 1px border, padding 16px, flex row):

| Card | Emoji | Icon BG | Title | Subtitle |
|------|-------|---------|-------|----------|
| AI Assistant | 🤖 | `#EFF6FF` (light blue) | "AI Assistant" | "Ask anything about your expenses" |
| Budget Dashboard | 📊 | `#F0FDF4` (light green) | "Budget Dashboard" | "Track spending against your budget" |
| Subscriptions | 🔄 | `#FFF7ED` (light orange) | "Subscriptions" | "Manage recurring payments" |
| Spending Insights | ✨ | `#FAF5FF` (light purple) | "Spending Insights" | "See where your money goes" |

Each card layout:
- Icon box: 52×52px, radius 14px, colored bg, emoji 26px centered
- Text stack: Title (Inter 700, 16px, `#111827`) + subtitle (Inter 400, 13px, `#6B7280`)
- Arrow: "›" — 18px, same hue as icon bg (darker)

---

### 8.2 AI Chat Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "AI Assistant" (Playfair 800) + status indicator (right)
- Status dot: 8×8px circle
  - Online: `#22C55E`
  - Unavailable: `#9CA3AF`
- Status text: "Online" / "Unavailable" / "Powered by Claude" — 11px Inter 500, `#6B7280`

---

**Message Area** (FlatList, flex-grow):

**User message:**
- Right-aligned container
- Bubble: `#1B4332` bg, radius 18px bottom-right 4px, padding 12px ×16px
- Text: white, 14px Inter 400, line-height 20px

**AI message:**
- Left-aligned container
- Robot avatar: 28×28px, `#F0FDF4` bg, radius 8px, 🤖 emoji (16px)
- Bubble: white bg, 1px `#E7E5E4` border, radius 18px bottom-left 4px, padding 12px ×16px
- Text: `#111827`, 14px Inter 400, line-height 20px

**Typing indicator:**
- 3 circles (8×8px each), `#9CA3AF`, gap 4px
- Bouncing animation (staggered)
- Shown in AI bubble shell

**Suggestion Chips** (shown on empty chat — 4 example prompts):
- Wrap row, gap 8px
- Each: `#F0FDF4` bg, `#1B4332` text, 1px border `#BBF7D0`, radius 20px, padding 8px ×14px, 13px Inter 600
- Examples: "What do I owe?" · "Summarize this month" · "Who owes me most?" · "Split ₹1200 3 ways"

---

**Input Bar** (sticky bottom, white bg, 1px top border, padding 8px ×16px, KeyboardAvoidingView):
- TextInput: flex-grow, `#F3F4F6` bg, radius 20px, padding 10px ×16px, 14px, multiline, max-height 100px
- Send button: 40×40px circle, `#1B4332` bg, "↑" white 18px — disabled opacity 0.4

---

### 8.3 Budget Dashboard Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "Budget Dashboard" (Playfair 800) + "+" add button (right, orange)

---

**Overall Progress Card** (dark green gradient, radius 24px, padding 20px):
- "TOTAL BUDGET" label (uppercase, 10px, semi-transparent)
- Budget amount (Playfair 800, 28px, white): "₹X,XXX spent of ₹XX,XXX"
- Ring progress bar: 120px diameter, white stroke (5px), percentage fill in orange `#FF6B35`
- "XX% used" below ring

---

**Budget Category Cards** (FlatList):

Each card (white bg, radius 16px, 1px border, padding 16px, margin-bottom 10px):
- Top row: Category emoji (in colored circle, 40×40px) + category name (Inter 700, 15px) + status badge (right)
  - Status badges:
    - "On Track" — `#F0FDF4` bg, `#16A34A` text
    - "Near Limit" — `#FFFBEB` bg, `#92400E` text
    - "Over Budget" — `#FEF2F2` bg, `#DC2626` text
- Progress bar: full width, height 8px, radius 4px
  - Track: `#F3F4F6`
  - Fill: green (< 75%) → orange (75–99%) → red (≥ 100%)
- Bottom row: "₹X,XXX spent" (13px Inter 600) + "₹X,XXX left" (13px Inter 400, gray)

---

**Add Budget Modal:**
- Sheet from bottom
- Category selector (dropdown)
- Budget amount input
- "Set Budget" button (dark green primary)

---

### 8.4 Subscription Tracker Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "Subscriptions" (Playfair 800) + "+" button (right)

**Total card** (dark green gradient, radius 20px, padding 16px):
- "MONTHLY TOTAL" label + amount (Playfair 800, 28px, white)
- "X active subscriptions" (12px, semi-transparent)

**Subscriptions List:**

Each card (white bg, radius 14px, 1px border, padding 14px, margin-bottom 8px):
- Service icon/emoji (40×40px circle, colored bg) + name (Inter 700, 15px) + status dot (active = green, paused = gray)
- Amount: Inter 800, 16px, `#1B4332`, right
- "Next billing: [date]" — 12px gray
- "Manage" button (small, secondary style)

**Empty state:** 🔄 icon + "No subscriptions tracked" + "Add your first"

---

### 8.5 Spending Insights Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "Spending Insights" (Playfair 800)

**Time Period Pills** (row, gap 8px): "Week" · "Month" · "Year" (same toggle pill style)

**Chart Card** (white, radius 20px, padding 20px):
- Donut/pie chart (200×200px)
- Center text: total amount (Playfair 800, 22px)

**Category Breakdown List:**
Each row (margin-bottom 8px):
- Color dot (12×12px circle) + category emoji + name (Inter 700, 14px) + percentage (right, 12px gray) + amount (Inter 800, 14px, right)

**Top Spending Card:**
- "Your top spend: [Category]" — highlighted row with colored background

---

## 9. Account Stack

### 9.1 Account Screen

**Background:** `#FFFDF9`

**Header:** "Account" (Playfair 800, 24px)

---

**Profile Card** (white bg, radius 20px, 1px border, padding 16px):
- Flex row:
  - Avatar (56×56px, radius 16px)
  - Text stack (flex-grow, margin-left 14px):
    - Name: Inter 700, 17px, `#111827`
    - Email: Inter 400, 13px, `#6B7280`
    - UPI ID: Inter 400, 11px, `#9CA3AF` (if exists)
  - "Edit" button: `#F3F4F6` bg, `#374151` text, 13px Inter 600, radius 10px, padding 6px ×12px

---

**Pro Upgrade Banner** (dark green bg `#1B4332`, radius 16px, padding 16px, margin-top 16px):
- Flex row:
  - ⚡ emoji (20px)
  - Text stack: "Upgrade to Pro" (Inter 700, 15px, white) + "AI insights, unlimited groups & more" (12px, `rgba(255,255,255,0.7)`)
  - "FREE →" badge: `#FF6B35` bg, white text (12px Inter 700), radius 20px, padding 4px ×10px

---

**Settings Sections** (white cards, radius 16px, 1px border, margin-top 16px):

**Section 1: Profile**
| Row | Emoji | Label |
|-----|-------|-------|
| Edit Profile | 🪪 | "Edit Profile" |
| My QR Code | 📱 | "My QR Code" |

**Section 2: Preferences**
| Row | Emoji | Label |
|-----|-------|-------|
| Appearance | 🎨 | "Appearance" |
| Notifications | 🔔 | "Notifications" |
| Security | 🔒 | "Security" |

**Section 3: More**
| Row | Emoji | Label |
|-----|-------|-------|
| Refer a Friend | 🎁 | "Refer a Friend" |
| Import from Splitwise | 📥 | "Import from Splitwise" |

**Section 4: Danger**
| Row | Emoji | Label | Style |
|-----|-------|-------|-------|
| Sign Out | 🚪 | "Sign Out" | Red text `#EF4444` |

**Row styling:**
- Height: 52px, padding horizontal 16px
- Top hairline border (not first row)
- Emoji: 18px
- Label: Inter 600, 15px, `#111827` (or red for sign out)
- Arrow: "›" Inter 400, 16px, `#9CA3AF` (not on sign out)

---

### 9.2 Edit Profile Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "Edit Profile" (Playfair 800) + "Save" button (orange, right)

---

**Avatar Preview** (centered, margin-top 20px):
- Circle: 80×80px, radius 40px, user's selected color bg
- Initials: Inter 800, 28px, white
- Hint text: "Tap a color to change your avatar" — 13px gray, centered, margin-top 8px

---

**Color Picker** (8 circles in flex-wrap row, margin-top 12px, centered):
- Each circle: 40×40px, radius 20px
- 8 colors: `#1B4332` · `#0EA5E9` · `#8B5CF6` · `#EF4444` · `#F59E0B` · `#EC4899` · `#10B981` · `#6366F1`
- Active: 3px dark border + white ✓ checkmark (14px) centered

---

**Form Fields:**
1. Full Name — editable, placeholder "Your full name"
2. Email — read-only display (`#F3F4F6` bg), no cursor, "Email can't be changed" hint
3. UPI ID — placeholder "yourname@upi", hint "Used for payment links"
4. Phone Number — numeric keyboard

All fields: label (13px Inter 600, `#374151`) + standard input styling

---

### 9.3 QR Code Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "My QR Code" (Playfair 800)

**Center content:**
- White card (radius 24px, padding 24px, shadow):
  - QR code image: 200×200px, centered
  - User's name: Playfair 700, 20px, below QR
  - Email: Inter 400, 14px, gray

**Action buttons (below card, flex row, gap 12px):**
- "Download" — secondary button
- "Share" — dark green primary button

**Instruction text:** "Friends can scan this to add you instantly" — 13px gray, centered, margin-top 16px

---

### 9.4 Appearance Settings Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "Appearance" (Playfair 800)

**Theme Options** (3 cards, margin-bottom 10px each):
Each card (white bg, radius 16px, 1px border, padding 16px, flex row):
- Icon: 44×44px circle, colored bg, emoji (20px)
- Text: Title (Inter 700, 15px) + subtitle (12px gray)
- Radio button (right): 22×22px

| Option | Emoji | Icon BG | Title | Subtitle |
|--------|-------|---------|-------|----------|
| Light | ☀️ | `#FFF7ED` | "Light" | "Clean and bright interface" |
| Dark | 🌙 | `#0F1F17` | "Dark" | "Easy on the eyes at night" |
| System | 📱 | `#F3F4F6` | "System Default" | "Follows your phone settings" |

Active card: `#F0FDF4` bg, `#1B4332` border.

---

### 9.5 Notification Settings Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "Notifications" (Playfair 800)

**Toggle rows** (white card, radius 16px):

| Label | Emoji | Sublabel |
|-------|-------|----------|
| New Expense Added | 💸 | "When someone adds an expense with you" |
| Payment Received | ✅ | "When a friend settles up" |
| Reminders | 🔔 | "Nudges to settle outstanding balances" |
| Group Invites | 🏝️ | "When someone adds you to a group" |
| Weekly Summary | 📊 | "Your weekly spending recap" |

Each row: emoji (18px) + text stack (flex-grow) + iOS Toggle switch (green when on)
Row height 64px, hairline top borders.

---

### 9.6 Security Settings Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "Security" (Playfair 800)

**Change Password section** (white card, radius 16px, padding 16px):
- Title: "Change Password" (Inter 700, 16px)
- Fields: Current password · New password · Confirm new password
- "Update Password" button (dark green, full-width)

**Two-Factor Auth section** (white card, radius 16px, padding 16px, margin-top 16px):
- Row: "Two-Factor Authentication" + Toggle (off by default)
- Sublabel: "Add an extra layer of security"

**Active Sessions section** (white card):
- "Active Sessions" title
- Each session: device name + last seen + "Revoke" button (red text)
- "Sign Out All Devices" button (full-width, `#FEF2F2` bg, `#DC2626` text, radius 14px)

---

### 9.7 Pro Upgrade Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "QuickSplit Pro" (Playfair 800)

**Hero Banner** (dark green gradient, radius 24px, padding 24px, centered):
- ⚡ emoji (48px)
- "Go Pro" — Playfair 800, 28px, white
- "Unlock the full QuickSplit experience" — 14px, semi-transparent white

**Feature Comparison Table** (white card, radius 16px):

| Feature | Free | Pro |
|---------|------|-----|
| Friends | 5 | Unlimited |
| Groups | 3 | Unlimited |
| AI Chat | — | ✓ |
| Spending Insights | — | ✓ |
| Receipt Scanning | 5/mo | Unlimited |
| Budget Tools | — | ✓ |

Free column: `#9CA3AF` text; Pro column: `#1B4332` text, Inter 700.

**Pricing card** (centered, margin-top 24px):
- "₹99/month" — Playfair 800, 36px, `#1B4332`
- "or ₹799/year (save 33%)" — 14px gray
- "Subscribe to Pro" button — orange primary, full-width
- "Cancel anytime" fine print — 12px gray, centered

---

### 9.8 Referral Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "Refer a Friend" (Playfair 800)

**Hero card** (dark green gradient, centered, radius 24px, padding 24px):
- 🎁 emoji (48px)
- "Give ₹50, Get ₹50" — Playfair 800, 24px, white
- "Invite friends and you'll both get ₹50 off" — 14px semi-transparent white

**Referral Code Box** (white card, radius 16px, padding 16px, dashed 2px border `#E7E5E4`):
- "YOUR CODE" label — 11px Inter 600, `#9CA3AF`, letter-spacing 1.5
- Code: Playfair 800, 28px, `#1B4332`, centered, letter-spacing 4
- "Copy" button (orange, small, right)

**Share buttons row** (flex, gap 12px):
- "Copy Link" — secondary
- "Share" — dark green primary

**Stats row** (3 stats, 1px dividers):
- Friends referred: number (Inter 800, 20px) + label (11px gray)
- Rewards earned: ₹amount + label
- Pending: number + label

---

### 9.9 Import Splitwise Screen

See section 7.5 (same screen is used from both Groups and Account).

---

### 9.10 Permission Setup Screen

**Background:** `#FFFDF9`

**Header:** "‹ Back" + "App Permissions" (Playfair 800)

**Intro:** "QuickSplit needs a few permissions to work its best." — 14px gray

**Permission cards** (each: white bg, radius 16px, 1px border, padding 16px, margin-bottom 10px):

| Permission | Emoji | Title | Reason | Button |
|-----------|-------|-------|--------|--------|
| Camera | 📷 | "Camera" | "Scan receipts and QR codes" | "Allow" |
| Photo Library | 🖼️ | "Photo Library" | "Upload receipt images from your gallery" | "Allow" |
| Contacts | 👥 | "Contacts" | "Quickly add friends already in your phone" | "Allow" |

Each card: emoji in 48×48px colored circle (left) + title (Inter 700, 15px) + reason (12px gray) + status right.

Granted state: ✓ in `#16A34A`.
Not granted: "Allow" button in dark green (small).

**Footer button:** "Continue →" — orange primary, full-width

---

## Appendix: Consistent UI Rules

### Layout Rules (apply to all screens)
- Screen horizontal padding: **16px**
- Status bar height: system default (safe area inset)
- Bottom safe area: respected on all scroll views and fixed bottom bars
- Scroll views: `showsVerticalScrollIndicator: false`
- Section gap (between distinct content areas): **20–24px**

### Interaction States (apply to all interactive elements)
- **Tap feedback:** `activeOpacity: 0.85` on all touchable elements
- **Disabled state:** `opacity: 0.5–0.6`, cursor: not-allowed
- **Loading state:** Replace button text with spinner, disable button
- **Empty state:** Always show icon + title + subtitle + optional CTA

### Color Consistency Rules
- **Every positive amount** (money coming to you): `#16A34A` or `#22C55E`
- **Every negative amount** (money you owe): `#DC2626` or `#EF4444`
- **Every primary action button:** `#FF6B35` (orange)
- **Every secondary/navigation action:** `#1B4332` (dark green)
- **Every destructive action** (delete, remove, sign out): `#EF4444` (red)

### Typography Consistency Rules
- **Screen titles:** Playfair Display 800, 24–28px
- **Card headings:** Playfair Display 700, 16–20px, OR Inter 700, 15–16px
- **Body text:** Inter 400–600, 13–15px
- **All amounts:** Inter 800, size varies by context
- **Labels/badges:** Inter 600–700, 10–13px

### Icon System
- All icons are **emoji** (no icon font / SVG library)
- Emoji sizes: 10–11px (tiny chips) · 14–16px (list rows) · 20–24px (feature cards) · 28–36px (hero) · 48–80px (hero states, empty states)

---

*Document generated: June 2026 · QuickSplit v1 — React Native (iOS/Android)*

---

## Appendix B: ASCII Wireframes

> Each wireframe represents a 390×844px iPhone screen (iPhone 14 standard).
> Device chrome: status bar (44px top) + home indicator (34px bottom).
> All sizes are approximate and proportional.

---

### SCREEN: Splash

```
┌─────────────────────────────────┐  ← status bar (time, icons) white
│           9:41 AM               │
├─────────────────────────────────┤
│                                 │
│                                 │
│                                 │
│                                 │
│          ┌─────────┐            │
│          │         │            │  ← 80×80px frosted glass box
│          │    Q    │            │    white/15% opacity, radius 24px
│          │         │            │    "Q" = Playfair 700, 36px white
│          └─────────┘            │
│                                 │
│         QuickSplit               │  ← Playfair 700, 32px, white
│                                 │
│     Split Smart. Live More.     │  ← Inter 400, 14px, white/65%
│                                 │
│                                 │
│                                 │
│                                 │  ← entire background #1B4332
│                                 │
└─────────────────────────────────┘
     ▬   (home indicator)
```

---

### SCREEN: Onboarding (Slide 1 of 5)

```
┌─────────────────────────────────┐
│  9:41 AM                  Skip  │  ← "Skip" top-right, #1B4332
├─────────────────────────────────┤
│                                 │
│                                 │
│                                 │
│               🍕                │  ← 80px emoji, centered
│                                 │
│                                 │
│      Split bills effortlessly   │  ← Playfair 700, 26px, #111827
│                                 │
│   Add expenses and split them   │  ← Inter 400, 16px, #6B7280
│   instantly with friends and    │    centered, max-width 300px
│   groups                        │
│                                 │
│                                 │
│        ●  ○  ○  ○  ○            │  ← pagination dots
│        ↑ active = orange pill   │    inactive = gray 8px circle
│                                 │
│  ┌─────────────────────────────┐│
│  │         Next →              ││  ← orange #FF6B35, h=52px
│  └─────────────────────────────┘│
│                                 │
└─────────────────────────────────┘
```

---

### SCREEN: Login

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│                                 │
│        ┌──────┐                 │
│        │  Q   │                 │  ← 56×56px, #1B4332 bg
│        └──────┘                 │    orange glow shadow
│                                 │
│  Welcome back                   │  ← Playfair 800, 28px
│  Sign in to your QuickSplit     │  ← Inter 400, 14px, gray
│  account                        │
│                                 │
│  ┌─────────────────────────────┐│
│  │ ✕  Wrong credentials        ││  ← error box (red/pink bg)
│  └─────────────────────────────┘│    only shown on error
│                                 │
│  Email or phone number          │  ← label 13px
│  ┌─────────────────────────────┐│
│  │ you@example.com             ││  ← input, radius 16px
│  └─────────────────────────────┘│
│                                 │
│  Password          Forgot?      │  ← label + right link
│  ┌─────────────────────────────┐│
│  │ ••••••••••           👁     ││  ← password + eye toggle
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │           Sign In           ││  ← orange primary button
│  └─────────────────────────────┘│
│                                 │
│    Don't have an account?       │
│    Sign up free                 │  ← #1B4332 link
└─────────────────────────────────┘
```

---

### SCREEN: Register

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│        ┌──────┐                 │
│        │  Q   │                 │
│        └──────┘                 │
│  Create account                 │  ← Playfair 800, 28px
│  Join thousands splitting smart │  ← Inter 400, 14px, gray
│                                 │
│  Full Name                      │
│  ┌─────────────────────────────┐│
│  │ e.g. Rohan Mehta            ││
│  └─────────────────────────────┘│
│  Phone Number                   │
│  ┌─────────────────────────────┐│
│  │ 10-digit mobile number      ││
│  └─────────────────────────────┘│
│  Email (optional)               │
│  ┌─────────────────────────────┐│
│  │ you@example.com             ││
│  └─────────────────────────────┘│
│  Password                       │
│  ┌─────────────────────────────┐│
│  │ ••••••••••           👁     ││
│  └─────────────────────────────┘│
│  Confirm Password               │
│  ┌─────────────────────────────┐│
│  │ ••••••••••           👁     ││
│  └─────────────────────────────┘│
│                                 │
│  ☑  I agree to Terms of Service │  ← checkbox + 13px text
│     and Privacy Policy          │
│                                 │
│  ┌─────────────────────────────┐│
│  │       Create Account        ││  ← orange primary
│  └─────────────────────────────┘│
│    Already have an account?     │
│    Sign in                      │
└─────────────────────────────────┘
```

---

### SCREEN: Home

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤  ← bg #FFFDF9
│                                 │
│  ╔═══════════════════════════╗  │
│  ║ Good morning, Devanshu 👋 ║  │  ← dark green gradient card
│  ║ Monday, June 9            ║  │    Playfair 700, 18px, white
│  ║                        [D]║  │  ← avatar circle top-right
│  ║ ▌ "A penny saved is a    ║  │  ← quote block, left border
│  ║ ▌  penny earned"         ║  │
│  ║ ▌  — Benjamin Franklin   ║  │
│  ╚═══════════════════════════╝  │
│                                 │
│  ╔═══════════════════════════╗  │
│  ║ YOU ARE OWED          🟢  ║  │  ← balance card, dark green
│  ║ ₹1,250                    ║  │    Playfair 800, 30px, white
│  ║ ─────────────────────── ║  │
│  ║ Owed ₹1,850│Owe ₹600│Net ║  │  ← 3-stat row with dividers
│  ╚═══════════════════════════╝  │
│                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──┐│
│  │  💸  │ │  📷  │ │  ✅  │ │👥││  ← 4 quick action buttons
│  │  Add │ │ Scan │ │Settle│ │Fr││    equal flex, 64px height
│  └──────┘ └──────┘ └──────┘ └──┘│    orange/yellow/green/purple
│                                 │
│  ┌─────────────────────────────┐│
│  │ 🤖 AI INSIGHT               ││  ← AI card, 1.5px border
│  │ You've spent ₹200 more on   ││
│  │ food than last week.  Chat→ ││
│  └─────────────────────────────┘│
│                                 │
│  Your Groups           See all→ │  ← section header
│  ┌──────┐ ┌──────┐ ┌──────┐     │
│  │  🏠  │ │  ✈️  │ │  💑  │     │  ← horizontal scroll cards
│  │ Home │ │ Goa  │ │Couple│     │    140×110px each
│  │ owed │ │+₹500 │ │ Setld│     │    balance badges below
│  └──────┘ └──────┘ └──────┘     │
│                                 │
│  Who owes you (2)      See all→ │
│  ┌─────────────────────────────┐│
│  │[D] Devanshu    ₹500  Remind ││  ← white list card
│  │─────────────────────────── ││    green amount
│  │[R] Rahul       ₹350  Remind ││
│  └─────────────────────────────┘│
│                                 │
│  You owe (1)                    │
│  ┌─────────────────────────────┐│
│  │[P] Priya       ₹200  Settle ││  ← red amount
│  └─────────────────────────────┘│
│                                 │
│  Recent Activity       See all→ │
│  ┌─────────────────────────────┐│
│  │ 💸 Dinner · Goa Trip  Today ││
│  │ ✅ Rahul settled     Jun 8  ││
│  └─────────────────────────────┘│
│                                 │
│                         ┌───┐   │
│                         │ + │   │  ← FAB, bottom-right
│                         └───┘   │    56px circle, #1B4332
├─────────────────────────────────┤
│  🏠    👥    🏝️    ✨    👤    │  ← bottom tab bar
│ Home Friends Groups Persnl Acct │    active = #FF6B35
└─────────────────────────────────┘
```

---

### SCREEN: Friends

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  Friends         [⚙Filter] [Add+]│  ← header row
│                                 │
│  ╔════════════╗ ╔═════════════╗  │
│  ║ Owed ₹1,850║ ║  Owe ₹600  ║  │  ← balance summary chips
│  ╚════════════╝ ╚═════════════╝  │    green / red
│                                 │
│  ┌─────────────────────────────┐│
│  │🔍 Search friends…           ││  ← search bar
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│  ← pending request banner
│  │ ⚠️ 1 pending request         ││    yellow bg
│  │ [D] Dev  dev@m.com  [Accept]││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │[R] Rahul Sharma             ││  ← friend row (swipeable)
│  │    rahul@gmail.com   +₹350  ││    avatar + name + email
│  │                  [Owes you] ││    green badge
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │[P] Priya Nair               ││
│  │    priya@gmail.com    -₹200 ││  ← red amount
│  │                   [You owe] ││    red badge
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │[A] Aman Singh               ││
│  │    aman@gmail.com      ₹0   ││
│  │                    [Settled]││  ← gray badge
│  └─────────────────────────────┘│
│                                 │
│    ← swipe right on row to see: │
│    [➕Add][💸Settle][🔔Remind][✕]│
│                                 │
├─────────────────────────────────┤
│  🏠    👥    🏝️    ✨    👤    │
└─────────────────────────────────┘
```

---

### SCREEN: Groups

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  Groups          [⚙Filter] [New+]│
│                                 │
│  ┌─────────────────────────────┐│
│  │🔍 Search groups…            ││
│  └─────────────────────────────┘│
│                                 │
│  ●All  🏠Home  ✈️Trip  💑Couple │  ← category pills (scroll)
│  💼Work  🎉Other                │    active = light green + border
│                                 │
│  ┌─────────────────────────────┐│
│  │[🏠]  Home Crew       ●●●+2  ││  ← group card
│  │      home · 5 members       ││    category badge left
│  │                       +₹800 ││    balance chip right
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │[✈️]  Goa Trip 2025   ●●●●   ││
│  │      trip · 4 members       ││
│  │                      -₹600  ││  ← red = you owe
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │[💑]  Me & Priya       ●●    ││
│  │      couple · 2 members     ││
│  │                    Settled  ││  ← gray = settled
│  └─────────────────────────────┘│
│                                 │
├─────────────────────────────────┤
│  🏠    👥    🏝️    ✨    👤    │
└─────────────────────────────────┘
```

---

### SCREEN: Group Detail — Expenses Tab

```
┌─────────────────────────────────┐
│  9:41 AM            (white text)│
├─────────────────────────────────┤  ← dark gradient hero (trip amber)
│ [←]  Goa Trip 2025              │  ← back btn + group name (Playfair)
│       ✈️ trip                   │    category label
│                                 │
│  [➕Add][💸Settle][📊][💬][🔗]  │  ← quick action pills (scroll)
│                                 │
│  ₹4,200   4      12            │  ← analytics row
│  Total  Members  Expenses       │    3 stats with dividers
├─────────────────────────────────┤
│  Expenses │ Members (4) │ Chat  │  ← tab bar, active underline
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐│  ← simplified debts (yellow)
│  │ Who owes who                ││
│  │ [D] Dev owes Priya  ₹350   ││
│  └─────────────────────────────┘│
│                                 │
│  Expenses (12)                  │
│  ┌─────────────────────────────┐│
│  │ [🍔] Dinner at BBQ Nation   ││  ← expense row
│  │       Devanshu paid · Jun 8 ││    category circle + description
│  │                  ₹1,200     ││    amount right
│  │            Your share: ₹300 ││    orange share text
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ [🚗] Taxi to airport        ││
│  │       Rahul paid · Jun 7    ││
│  │                    ₹480     ││
│  │            Your share: ₹120 ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ [🏨] Hotel booking          ││
│  │       Priya paid · Jun 6    ││
│  │                  ₹6,000     ││
│  │          Your share: ₹1,500 ││
│  └─────────────────────────────┘│
│                                 │
├─────────────────────────────────┤
│  🏠    👥    🏝️    ✨    👤    │
└─────────────────────────────────┘
```

---

### SCREEN: Group Detail — Members Tab

```
┌─────────────────────────────────┐
│  9:41 AM            (white text)│
├─────────────────────────────────┤
│ [←]  Goa Trip 2025              │
│       ✈️ trip                   │
│  [➕Add][💸Settle][📊][💬][🔗]  │
│  ₹4,200   4      12             │
├─────────────────────────────────┤
│  Expenses │ Members (4) │ Chat  │
├─────────────────────────────────┤
│                                 │
│  Members              [Add +]   │  ← "Add" only visible to admin
│                                 │
│  ┌─────────────────────────────┐│
│  │[D] Devanshu Patil    [Admin]││  ← you, admin badge (green)
│  │    dev@gmail.com            ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │[R] Rahul Sharma             ││
│  │    rahul@gmail.com  [Remove]││  ← remove btn (red text, pink bg)
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │[P] Priya Nair               ││
│  │    priya@gmail.com  [Remove]││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │[A] Aman Singh               ││
│  │    aman@gmail.com   [Remove]││
│  └─────────────────────────────┘│
│                                 │
├─────────────────────────────────┤
│  🏠    👥    🏝️    ✨    👤    │
└─────────────────────────────────┘
```

---

### SCREEN: Group Detail — Chat Tab

```
┌─────────────────────────────────┐
│  9:41 AM            (white text)│
├─────────────────────────────────┤
│ [←]  Goa Trip 2025              │
│       ✈️ trip                   │
│  [➕Add][💸Settle][📊][💬][🔗]  │
│  ₹4,200   4      12             │
├─────────────────────────────────┤
│  Expenses │ Members (4) │ Chat  │
├─────────────────────────────────┤
│                                 │
│  Jun 8                          │  ← date separator
│                                 │
│  [R] Rahul                      │
│  ╔═══════════════╗              │  ← their msg (white bubble, left)
│  ║ Hey who paid  ║              │
│  ║ for the taxi? ║              │
│  ╚═══════════════╝              │
│  10:42 AM                       │
│                                 │
│              ╔═════════════════╗│  ← my msg (dark green, right)
│              ║ I did! ₹480.   ║│
│              ║ Split equally? ║│
│              ╚═════════════════╝│
│                          10:43 │
│                                 │
│  [P] Priya                      │
│  ╔════════════╗                 │
│  ║ Yes please ║                 │
│  ╚════════════╝                 │
│  10:44 AM                       │
│                                 │
├─────────────────────────────────┤
│ ┌───────────────────────┐  [↑] │  ← input bar + send btn
│ │ Type a message…       │      │    send = dark green circle
│ └───────────────────────┘      │
└─────────────────────────────────┘
```

---

### SCREEN: Add Expense

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  [←]  Add Expense        [Save] │  ← Save = orange, top-right
│                                 │
│  ╔═══════════════════════════╗  │
│  ║         ₹  1,200          ║  │  ← dark green card
│  ║    (large amount input)   ║  │    48px white Playfair
│  ║   ₹300.00 each · 4 people ║  │  ← orange hint
│  ╚═══════════════════════════╝  │
│                                 │
│  What's this for?               │
│  ┌─────────────────────────────┐│
│  │ e.g. Dinner at BBQ Nation   ││
│  └─────────────────────────────┘│
│                                 │
│  Category                       │
│  ┌─────────────────────────────┐│
│  │ 🍔 Food & Drink           ▾ ││  ← dropdown, shows emoji
│  └─────────────────────────────┘│
│                                 │
│  Add to group (optional)        │
│  ┌─────────────────────────────┐│
│  │ No group (personal)       ▾ ││
│  └─────────────────────────────┘│
│                                 │
│  Paid by                        │
│  ┌─────────────────────────────┐│
│  │ [D] Devanshu (you)        ▾ ││
│  └─────────────────────────────┘│
│                                 │
│  Split with                     │
│  [Devanshu ×] [Rahul ×] [+ Add] │  ← green chips + add chip
│                                 │
│  How to split                   │
│  [Equal] [Exact ₹] [%] [Shares] │  ← toggle row, active=green
│                                 │
│  ┌─────────────────────────────┐│
│  │ 📷 Scan Receipt to Pre-fill ││  ← dashed orange text
│  └─────────────────────────────┘│
│                                 │
│  📅 June 8, 2026                │  ← date picker row
│                                 │
│  Notes (optional)               │
│  ┌─────────────────────────────┐│
│  │ Any notes…                  ││  ← multiline textarea
│  └─────────────────────────────┘│
│                                 │
│  Recurring expense        [ ○ ] │  ← toggle switch (off)
│                                 │
├─────────────────────────────────┤
│  🏠    👥    🏝️    ✨    👤    │
└─────────────────────────────────┘
```

---

### SCREEN: Expense Detail

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  [←]  Expense Detail    [Delete]│  ← Delete = red text (payer only)
│                                 │
│  ┌─────────────────────────────┐│  ← white hero card, shadow
│  │     ┌──────┐                ││
│  │     │  🍔  │                ││  ← 68×68px category box
│  │     └──────┘                ││
│  │  Dinner at BBQ Nation       ││  ← Playfair 700, 20px
│  │         ₹1,200              ││  ← Inter 800, 32px, #1B4332
│  │       ₹300 each             ││  ← orange, 14px
│  │  Devanshu paid · Jun 8      ││  ← meta, 13px gray
│  │                             ││
│  │  [You paid] [Goa Trip]      ││  ← green badges
│  └─────────────────────────────┘│
│                                 │
│  Reactions                      │
│  [👍 2] [❤️ 1] [😂] [😮] [😢] │  ← emoji reaction buttons
│          active = yellow bg     │
│                                 │
│  Split (4 people)               │
│  ┌─────────────────────────────┐│
│  │[D] Devanshu (you)   Settled ││  ← green "Settled ✓"
│  │[R] Rahul           ₹300 ·  ││  ← gray "Pending"
│  │[P] Priya           ₹300 ·  ││
│  │[A] Aman            ₹300 ·  ││
│  └─────────────────────────────┘│
│                                 │
│  Notes                          │
│  ┌─────────────────────────────┐│
│  │ Great dinner, paid by card  ││
│  └─────────────────────────────┘│
│                                 │
│  Comments (2)                   │
│  ┌─────────────────────────────┐│
│  │[R] Rahul  • 10m             ││
│  │  Thanks for paying first!   ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │[P] Priya  • 5m              ││
│  │  Will settle by weekend     ││
│  └─────────────────────────────┘│
├─────────────────────────────────┤
│ ┌──────────────────────┐  [→]  │  ← comment input + send
│ │ Add a comment…       │       │
│ └──────────────────────┘       │
└─────────────────────────────────┘
```

---

### SCREEN: Settle Up

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  [←]  Settle Up                 │
│                                 │
│  ┌─────────────────────────────┐│  ← white friend card
│  │  [R]  Rahul Sharma          ││    avatar + name
│  │       You owe ₹350          ││    red balance label
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│  ← AI suggestion (light green)
│  │ 💡 Settle in 1 payment to   ││
│  │    close all balances        ││
│  └─────────────────────────────┘│
│                                 │
│  [🟢GPay] [💜PhonePe] [🔵Paytm]│  ← payment tabs (scroll)
│  [💵Cash]  [💳Other]            │    active = light green + border
│                                 │
│  ╔═══════════════════════════╗  │
│  ║         ₹  350            ║  │  ← dark green amount card
│  ╚═══════════════════════════╝  │
│                                 │
│  ┌─────────────────────────────┐│  ← open in GPay button
│  │ Open in GPay →              ││    light green bg
│  └─────────────────────────────┘│
│                                 │
│  ┌────────────────┐ ┌──────────┐│
│  │ e.g. Cash pay  │ │ Txn ID   ││  ← 2-col: notes + txn id
│  └────────────────┘ └──────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │     Record Settlement       ││  ← dark green primary
│  └─────────────────────────────┘│
│                                 │
├─────────────────────────────────┤
│  🏠    👥    🏝️    ✨    👤    │
└─────────────────────────────────┘
```

---

### SCREEN: Settle Up — Success State

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  [←]  Settle Up                 │
│                                 │
│                                 │
│                                 │
│               ✅                │  ← 52px emoji
│                                 │
│        Payment Recorded!        │  ← Playfair 800, 22px, #1B4332
│                                 │
│  You settled ₹350 with Rahul    │  ← Inter 400, 14px, gray
│                                 │
│         ┌──────────┐            │
│         │  QR Code │            │  ← 200×200px QR (if available)
│         │  Image   │            │
│         └──────────┘            │
│                                 │
│         ┌──────────┐            │
│         │   Done   │            │  ← dark green, 160px wide
│         └──────────┘            │
│                                 │
│                                 │
└─────────────────────────────────┘
```

---

### SCREEN: Personal

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  Personal Finance               │  ← Playfair 800, 24px
│  Your financial hub             │  ← 14px gray
│                                 │
│  ╔═══════════════════════════╗  │
│  ║ THIS WEEK        Last 7d  ║  │  ← dark green gradient card
│  ║ ₹3,450                    ║  │    Playfair 800, 26px, white
│  ║                           ║  │
│  ║  ▁  ▃  █  ▂  ▅  ▇  ▂     ║  │  ← bar chart (7 bars)
│  ║ Su Mo Tu We Th Fr Sa      ║  │    today = orange, rest = white/25%
│  ╚═══════════════════════════╝  │
│                                 │
│  ┌─────────────────────────────┐│  ← feature card
│  │ ┌──────┐  AI Assistant     ││
│  │ │  🤖  │  Ask anything     ││    52×52px icon box (light blue)
│  │ └──────┘  about expenses  ›││    title 16px + subtitle 13px
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ ┌──────┐  Budget Dashboard ││
│  │ │  📊  │  Track spending   ││    icon box (light green)
│  │ └──────┘  vs. your budget ›││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ ┌──────┐  Subscriptions    ││
│  │ │  🔄  │  Manage recurring ││    icon box (light orange)
│  │ └──────┘  payments        ›││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ ┌──────┐  Spending Insights││
│  │ │  ✨  │  See where your   ││    icon box (light purple)
│  │ └──────┘  money goes      ›││
│  └─────────────────────────────┘│
│                                 │
├─────────────────────────────────┤
│  🏠    👥    🏝️    ✨    👤    │
└─────────────────────────────────┘
```

---

### SCREEN: AI Chat

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  [←]  AI Assistant      🟢Online│  ← status dot + label
│                                 │
│  ─────────────── Jun 9 ──────── │  ← date divider
│                                 │
│  [🤖]                           │  ← AI avatar (28px circle)
│  ╔══════════════════════╗       │  ← white bubble, left
│  ║ Hi Devanshu! I'm your ║      │
│  ║ AI money assistant.   ║      │
│  ║ How can I help?       ║      │
│  ╚══════════════════════╝       │
│  9:40 AM                        │
│                                 │
│             ╔════════════════╗  │  ← dark green bubble, right
│             ║ What do I owe  ║  │
│             ║ this month?    ║  │
│             ╚════════════════╝  │
│                       9:41 AM   │
│                                 │
│  [🤖]                           │
│  ╔══════════════════════════╗   │
│  ║ You owe ₹950 this month: ║   │
│  ║ • Rahul: ₹350            ║   │
│  ║ • Priya: ₹400            ║   │
│  ║ • Goa Trip: ₹200         ║   │
│  ╚══════════════════════════╝   │
│  9:41 AM                        │
│                                 │
│  ← suggestion chips (first msg) │
│  [What do I owe?]               │
│  [Summarize this month]         │
│  [Who owes me most?]            │
│  [Split ₹1200 3 ways]           │
│                                 │
├─────────────────────────────────┤
│ ┌──────────────────────┐  [↑]  │  ← input + dark green send btn
│ │ Ask me anything…     │       │
│ └──────────────────────┘       │
└─────────────────────────────────┘
```

---

### SCREEN: Account

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  Account                        │  ← Playfair 800, 24px
│                                 │
│  ┌─────────────────────────────┐│  ← profile card (white, border)
│  │ [D]  Devanshu Patil  [Edit] ││    avatar 56px + name + edit btn
│  │      dev@gmail.com          ││
│  │      devanshu@upi           ││    UPI in muted gray
│  └─────────────────────────────┘│
│                                 │
│  ╔═══════════════════════════╗  │  ← pro banner (dark green)
│  ║ ⚡ Upgrade to Pro  [FREE→]║  │    lightning + text + orange badge
│  ║   AI insights, unlimited  ║  │
│  ╚═══════════════════════════╝  │
│                                 │
│  ┌─────────────────────────────┐│  ← section card (white, border)
│  │ 🪪 Edit Profile           › ││
│  │─────────────────────────────││  ← hairline border
│  │ 📱 My QR Code             › ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ 🎨 Appearance             › ││
│  │─────────────────────────────││
│  │ 🔔 Notifications          › ││
│  │─────────────────────────────││
│  │ 🔒 Security               › ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ 🎁 Refer a Friend         › ││
│  │─────────────────────────────││
│  │ 📥 Import from Splitwise  › ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ 🚪 Sign Out                 ││  ← red text, no arrow
│  └─────────────────────────────┘│
│                                 │
├─────────────────────────────────┤
│  🏠    👥    🏝️    ✨    👤    │
└─────────────────────────────────┘
```

---

### SCREEN: Edit Profile

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  [←]  Edit Profile       [Save] │
│                                 │
│          ┌──────────┐           │  ← 80px avatar preview
│          │    DP    │           │    initials, chosen color bg
│          └──────────┘           │
│   Tap a color to change avatar  │  ← 13px gray hint
│                                 │
│   🟢  🔵  🟣  🔴  🟡  🩷  🟩  🔷  │  ← 8 color circles, 40px each
│         ↑ active = dark border  │
│                                 │
│  Full Name                      │
│  ┌─────────────────────────────┐│
│  │ Devanshu Patil              ││
│  └─────────────────────────────┘│
│                                 │
│  Email  (can't be changed)      │
│  ┌─────────────────────────────┐│
│  │ dev@gmail.com               ││  ← read-only, gray bg
│  └─────────────────────────────┘│
│                                 │
│  UPI ID                         │
│  ┌─────────────────────────────┐│
│  │ devanshu@upi                ││
│  └─────────────────────────────┘│
│                                 │
│  Phone Number                   │
│  ┌─────────────────────────────┐│
│  │ 9876543210                  ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │        Save Changes         ││  ← orange primary
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

---

### SCREEN: Create Group — Step 1

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  [←]  New Group                 │
│                                 │
│     ●━━━━━○━━━━━○               │  ← step indicator: 1 active
│   Details  Members  Settings    │    circles + labels + lines
│                                 │
│  Group Name *                   │
│  ┌─────────────────────────────┐│
│  │ e.g. Goa Trip 2025          ││
│  └─────────────────────────────┘│
│                                 │
│  Description (optional)         │
│  ┌─────────────────────────────┐│
│  │ What's this group for?      ││
│  └─────────────────────────────┘│
│                                 │
│  Category                       │
│  ┌──────┐ ┌──────┐ ┌──────┐     │
│  │  🏠  │ │  ✈️  │ │  💑  │     │  ← 5-cell category grid
│  │ Home │ │ Trip │ │Couple│     │    active = light green bg
│  └──────┘ └──────┘ └──────┘     │
│  ┌──────┐ ┌──────┐              │
│  │  💼  │ │  🎉  │              │
│  │ Work │ │ Other│              │
│  └──────┘ └──────┘              │
│                                 │
│  ┌─────────────────────────────┐│
│  │           Next →            ││  ← orange primary
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

---

### SCREEN: Create Group — Step 2

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  [←]  New Group                 │
│                                 │
│     ✓━━━━━●━━━━━○               │  ← step 1 done, step 2 active
│   Details  Members  Settings    │
│                                 │
│  Add friends by email. They'll  │  ← 13px gray hint
│  get an invitation.             │
│                                 │
│  ┌───────────────────┐ ┌──────┐ │  ← email input + Add btn
│  │ friend@email.com  │ │ Add  │ │    Add = dark green
│  └───────────────────┘ └──────┘ │
│                                 │
│  [rahul@gmail.com ×]            │  ← added member chips
│  [priya@nair.com ×]             │    green bg, × to remove
│                                 │
│  ┌─────────────────────────────┐│  ← empty note if no members
│  │  Invite friends by email    ││    light bg, centered
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │           Next →            ││  ← orange primary
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

---

### SCREEN: Create Group — Step 3

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  [←]  New Group                 │
│                                 │
│     ✓━━━━━✓━━━━━●               │  ← steps 1 & 2 done
│   Details  Members  Settings    │
│                                 │
│  Choose how expenses are split  │  ← 13px gray
│  by default.                    │
│                                 │
│  ┌─────────────────────────────┐│  ← method card (active = green bg)
│  │ [⚖️] Equal Split       (●) ││    radio button right
│  │      Everyone pays same     ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ [📊] Proportional       ( ) ││  ← inactive
│  │      Based on earnings      ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ [✏️] Custom             ( ) ││
│  │      Set amounts manually   ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │       Create Group          ││  ← orange primary (final step)
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

---

### SCREEN: Budget Dashboard

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  [←]  Budget Dashboard     [+] │
│                                 │
│  ╔═══════════════════════════╗  │
│  ║  TOTAL BUDGET             ║  │  ← dark green gradient
│  ║                           ║  │
│  ║       ╭───────╮           ║  │
│  ║      ╱  72%   ╲           ║  │  ← ring progress (orange fill)
│  ║     │  ₹7,200  │          ║  │    center text: amount
│  ║      ╲  of ₹10k╱          ║  │
│  ║       ╰───────╯           ║  │
│  ╚═══════════════════════════╝  │
│                                 │
│  ┌─────────────────────────────┐│
│  │ [🍔]  Food & Drink [On Track]│  ← category budget card
│  │  ████████████░░░░          ││  ← progress bar (green, 70%)
│  │  ₹2,100 spent  ₹900 left   ││    bottom row: spent + left
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ [🚗]  Transport [Near Limit]│  ← yellow badge
│  │  ████████████████░         ││  ← orange bar (85%)
│  │  ₹850 spent    ₹150 left   ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ [🎬]  Entertainment[Over!] ││  ← red badge
│  │  ████████████████████████  ││  ← red bar (100%+)
│  │  ₹1,200 spent    ₹0 left   ││
│  └─────────────────────────────┘│
│                                 │
└─────────────────────────────────┘
```

---

### SCREEN: Add Friend — QR Scan Tab

```
┌─────────────────────────────────┐
│  9:41 AM                    (w) │
├─────────────────────────────────┤
│  [←]  Add Friend                │
│                                 │
│  ┌────────────────┬────────────┐│
│  │  Email / Name  │  Scan QR   ││  ← tab bar, active underline
│  └────────────────┴────────────┘│
│                                 │
│ ████████████████████████████████│
│ █                              █│  ← full camera preview (black)
│ █                              █│
│ █      ┌──────────────┐        █│
│ █      │              │        █│  ← 240×240 scan frame
│ █      │   (camera    │        █│    white border, L-brackets
│ █      │    preview)  │        █│    orange corner brackets
│ █      │              │        █│
│ █      └──────────────┘        █│
│ █                              █│
│ █  Scan a friend's QR code     █│  ← white text below frame
│ █                              █│
│ █                              █│
│ ████████████████████████████████│
│                                 │
│  [⚡ Flash]              (top)  │  ← flash toggle (top-right of cam)
│                                 │
└─────────────────────────────────┘
```

---

### SCREEN: Scan Receipt

```
┌─────────────────────────────────┐
│  9:41 AM                    (w) │
├─────────────────────────────────┤
│  [×]                     [⚡]   │  ← close + flash (white, semi-trans)
│                                 │
│ ████████████████████████████████│
│ █                              █│  ← full-screen black camera view
│ █                              █│
│ █    ┌─────────────────────┐   █│
│ █    │  L                  L   │  ← 260×340 receipt frame
│ █    │                     │   █│    white 2px border
│ █    │                     │   █│    orange L-brackets at corners
│ █    │  (camera preview)   │   █│
│ █    │                     │   █│
│ █    │                     │   █│
│ █    └─────────────────────┘   █│
│ █                              █│
│ █  Position receipt inside     █│  ← white 14px text
│ █  the frame                   █│
│ █                              █│
│ ████████████████████████████████│
│                                 │
├─────────────────────────────────┤  ← bottom bar, dark bg
│             ┌───┐               │
│   [📁]      │ ◉ │               │  ← gallery left, capture center
│             └───┘               │    64px circle, white fill+border
└─────────────────────────────────┘
```

---

### SCREEN: FAB Action Sheet (overlay)

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│                                 │
│  (dimmed home screen beneath)   │  ← semi-transparent dark overlay
│                                 │
│                                 │
│                                 │
│                                 │
│                                 │
│         ▬                       │  ← drag handle 36×4px gray
│  ┌─────────────────────────────┐│  ← sheet slides up from bottom
│  │ ╔════╗ Add Expense        › ││    white bg, radius 24px top
│  │ ║ 💸 ║ Split a bill manually││    icon 48×48 circle + text
│  │ ╚════╝                      ││
│  │─────────────────────────────││
│  │ ╔════╗ Scan Bill          › ││    icon bg colors:
│  │ ║ 📷 ║ Auto-fill from receipt│    💸=orange 💸
│  │ ╚════╝                      ││    📷=yellow
│  │─────────────────────────────││    ✅=green
│  │ ╔════╗ Settle Up          › ││
│  │ ║ ✅ ║ Record a payment     ││
│  │ ╚════╝                      ││
│  └─────────────────────────────┘│
├─────────────────────────────────┤
│  🏠    👥    🏝️    ✨    👤    │
└─────────────────────────────────┘
```

---

### SCREEN: Balances

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  [←]  Balances                  │
│                                 │
│  ┌──────────┬──────────┬───────┐│  ← 3-col stats row
│  │ Owed you │ You owe  │  Net  ││    dividers between
│  │  ₹1,850  │   ₹600  │+₹1,250││    green / red / green
│  └──────────┴──────────┴───────┘│
│                                 │
│  Owed to you (2)                │  ← section label
│  ┌─────────────────────────────┐│
│  │[R] Rahul Sharma             ││
│  │    owes you ₹350   +₹350  ►││  ← green amt + settle btn
│  │─────────────────────────────││
│  │[A] Aman Singh               ││
│  │    owes you ₹1,500 +₹1,500 ►││
│  └─────────────────────────────┘│
│                                 │
│  You owe (1)                    │
│  ┌─────────────────────────────┐│
│  │[P] Priya Nair               ││
│  │    you owe ₹600    -₹600 [Settle]│  ← red + Settle btn
│  └─────────────────────────────┘│
│                                 │
├─────────────────────────────────┤
│  🏠    👥    🏝️    ✨    👤    │
└─────────────────────────────────┘
```

---

### SCREEN: QR Code

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  [←]  My QR Code                │
│                                 │
│                                 │
│  ┌─────────────────────────────┐│  ← white card, shadow
│  │                             ││
│  │   ┌─────────────────────┐   ││
│  │   │                     │   ││
│  │   │  ██ ▀█▀ ██ ██ ██   │   ││  ← 200×200 QR code image
│  │   │  ▀  ██  ▄▄ ██ ▀▀   │   ││
│  │   │  ██ ██  ██ ▄▄ ██   │   ││
│  │   └─────────────────────┘   ││
│  │                             ││
│  │      Devanshu Patil         ││  ← Playfair 700, 20px
│  │      dev@gmail.com          ││  ← 14px gray
│  └─────────────────────────────┘│
│                                 │
│  ┌──────────────┐ ┌────────────┐│
│  │   Download   │ │   Share    ││  ← secondary + dark green
│  └──────────────┘ └────────────┘│
│                                 │
│  Friends can scan this to add   │  ← 13px gray, centered
│  you instantly                  │
│                                 │
└─────────────────────────────────┘
```

---

### SCREEN: Notification Settings

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  [←]  Notifications             │
│                                 │
│  ┌─────────────────────────────┐│  ← white card, border
│  │ 💸 New Expense Added        ││
│  │    When someone adds with   ││  ← 12px gray sublabel
│  │    you                [  ●] ││  ← iOS toggle (green = on)
│  │─────────────────────────────││
│  │ ✅ Payment Received         ││
│  │    When a friend settles up ││
│  │                    [  ●]   ││
│  │─────────────────────────────││
│  │ 🔔 Reminders                ││
│  │    Nudges to settle         ││
│  │                    [●  ]   ││  ← off state (gray)
│  │─────────────────────────────││
│  │ 🏝️ Group Invites            ││
│  │    Added to a group         ││
│  │                    [  ●]   ││
│  │─────────────────────────────││
│  │ 📊 Weekly Summary           ││
│  │    Your spending recap      ││
│  │                    [  ●]   ││
│  └─────────────────────────────┘│
│                                 │
└─────────────────────────────────┘
```

---

### SCREEN: Pro Upgrade

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  [←]  QuickSplit Pro            │
│                                 │
│  ╔═══════════════════════════╗  │
│  ║           ⚡              ║  │  ← 48px emoji
│  ║        Go Pro             ║  │  ← Playfair 800, 28px, white
│  ║ Unlock the full experience║  │  ← 14px semi-white
│  ╚═══════════════════════════╝  │    dark green gradient
│                                 │
│  ┌─────────────────────────────┐│  ← comparison table card
│  │ Feature        Free   Pro   ││
│  │─────────────────────────────││
│  │ Friends          5    Unlim ││
│  │ Groups           3    Unlim ││
│  │ AI Chat          —     ✓   ││
│  │ Spending Insights—     ✓   ││
│  │ Receipt Scanning 5/mo  Unlim││
│  │ Budget Tools     —     ✓   ││
│  └─────────────────────────────┘│
│                                 │
│         ₹99/month               │  ← Playfair 800, 36px, #1B4332
│    or ₹799/year (save 33%)      │  ← 14px gray
│                                 │
│  ┌─────────────────────────────┐│
│  │      Subscribe to Pro       ││  ← orange primary
│  └─────────────────────────────┘│
│                                 │
│         Cancel anytime          │  ← 12px gray, centered
│                                 │
└─────────────────────────────────┘
```

---

### SCREEN: Friend Detail

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  [←]  Friend Detail             │
│                                 │
│  ┌─────────────────────────────┐│  ← hero profile card (white)
│  │                             ││
│  │          ┌──────┐           ││
│  │          │  RS  │           ││  ← 72×72px avatar, radius 20px
│  │          └──────┘           ││
│  │       Rahul Sharma          ││  ← Playfair 700, 20px
│  │       rahul@gmail.com       ││  ← 13px gray
│  │                             ││
│  │   [You owe Rahul ₹350]      ││  ← red status badge, centered
│  │                             ││
│  │   ┌─────────────────────┐   ││
│  │   │      Settle Up      │   ││  ← dark green btn (160px wide)
│  │   └─────────────────────┘   ││
│  └─────────────────────────────┘│
│                                 │
│  ┌──────────────┬───────────────┤  ← tab bar
│  │ Expenses (5) │Settlements (2)│
│  └──────────────┴───────────────┤
│                                 │
│  ┌─────────────────────────────┐│  ← expense row
│  │ [🍔] Dinner at BBQ  ₹1,200 ││
│  │       Jun 8 · Goa Trip      ││
│  │                 Your: ₹300  ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ [🚗] Taxi to airport  ₹480 ││
│  │       Jun 7 · Goa Trip      ││
│  │                 Your: ₹120  ││
│  └─────────────────────────────┘│
│                                 │
├─────────────────────────────────┤
│  🏠    👥    🏝️    ✨    👤    │
└─────────────────────────────────┘
```

---

### SCREEN: Appearance Settings

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  [←]  Appearance                │
│                                 │
│  ┌─────────────────────────────┐│  ← active card (light green bg)
│  │ ┌──────┐ Light          (●) ││    radio = active, green border
│  │ │  ☀️  │ Clean and bright   ││    52×52 icon circle (#FFF7ED)
│  │ └──────┘ interface          ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│  ← inactive card (white)
│  │ ┌──────┐ Dark           ( ) ││    radio = empty
│  │ │  🌙  │ Easy on the eyes   ││    icon circle (#0F1F17)
│  │ └──────┘ at night           ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ ┌──────┐ System Default ( ) ││
│  │ │  📱  │ Follows your phone ││    icon circle (#F3F4F6)
│  │ └──────┘ settings           ││
│  └─────────────────────────────┘│
│                                 │
└─────────────────────────────────┘
```

---

### SCREEN: Referral

```
┌─────────────────────────────────┐
│  9:41 AM                        │
├─────────────────────────────────┤
│  [←]  Refer a Friend            │
│                                 │
│  ╔═══════════════════════════╗  │
│  ║           🎁              ║  │  ← 48px emoji
│  ║    Give ₹50, Get ₹50      ║  │  ← Playfair 800, 24px, white
│  ║ Invite friends and you'll ║  │
│  ║ both get ₹50 off          ║  │  ← dark green gradient
│  ╚═══════════════════════════╝  │
│                                 │
│  ┌─────────────────────────────┐│  ← referral code box (dashed)
│  │ YOUR CODE                   ││  ← 11px uppercase label
│  │                             ││
│  │         QS-DEV50            ││  ← Playfair 800, 28px, #1B4332
│  │                      [Copy] ││  ← orange small button
│  └─────────────────────────────┘│
│                                 │
│  ┌──────────────┐ ┌────────────┐│
│  │  Copy Link   │ │   Share    ││  ← secondary + dark green
│  └──────────────┘ └────────────┘│
│                                 │
│  ┌──────────┬──────────┬───────┐│  ← stats row
│  │ Referred │ Earned   │Pending││
│  │    3     │  ₹150   │   1   ││
│  └──────────┴──────────┴───────┘│
│                                 │
└─────────────────────────────────┘
```

---

### COMPONENT: Filter Sheet (bottom sheet)

```
┌─────────────────────────────────┐
│  (screen content behind overlay)│
│                                 │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  ← dark overlay rgba(0,0,0,0.4)
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│         ────────                │  ← drag handle (36×4px, gray)
│  ┌─────────────────────────────┐│  ← sheet (radius 24px top corners)
│  │  Filter                     ││  ← title 16px Inter 700
│  │─────────────────────────────││
│  │ All Friends            (●)  ││  ← active option: green dot
│  │─────────────────────────────││
│  │ Outstanding Only       ( )  ││  ← inactive: empty circle
│  │─────────────────────────────││
│  │ They owe you           ( )  ││
│  │─────────────────────────────││
│  │ You owe them           ( )  ││
│  │─────────────────────────────││
│  │ ┌─────────────────────────┐ ││
│  │ │         Cancel          │ ││  ← secondary full-width button
│  │ └─────────────────────────┘ ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

---

### COMPONENT: Toast Notification

```
┌─────────────────────────────────┐
│  ┌─────────────────────────────┐│  ← toast at top, 56px from top
│  │ ✅ Expense added!           ││  ← success: green bg + border
│  └─────────────────────────────┘│  ← radius 16px, shadow
│                                 │
│  or                             │
│                                 │
│  ┌─────────────────────────────┐│
│  │ ✕  Failed to save expense   ││  ← error: red/pink bg
│  └─────────────────────────────┘│
│                                 │
│  or                             │
│                                 │
│  ┌─────────────────────────────┐│
│  │ ⚠️ No internet connection   ││  ← warning: yellow bg
│  └─────────────────────────────┘│
│                                 │
│  or                             │
│                                 │
│  ┌─────────────────────────────┐│
│  │ ℹ️ Friend request sent      ││  ← info: light green bg
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

---

### COMPONENT: Empty State

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│                                 │
│           ┌──────────┐          │  ← 80×80px circle
│           │    👥    │          │    radius 24px, gray bg
│           └──────────┘          │    36px emoji centered
│                                 │
│         No friends yet          │  ← Playfair 800, 18px, #111827
│                                 │
│  Add friends to start splitting │  ← Inter 400, 14px, #9CA3AF
│  expenses together              │    max-width 240px, centered
│                                 │
│       ┌───────────────┐         │
│       │ + Add Friend  │         │  ← orange primary button
│       └───────────────┘         │
│                                 │
│                                 │
└─────────────────────────────────┘
```

---

*End of UI Reference — QuickSplit v1 — React Native (iOS/Android)*

