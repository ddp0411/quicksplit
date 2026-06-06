Ready for review
Select text to add comments on the plan
QuickSplit — Splitwise Import in CreateGroup + Features Checklist
Context
Two tasks requested:

Splitwise Import in CreateGroup — When creating a group, add an "Import from Splitwise" path. The user uploads a Splitwise CSV export; the app parses it in the browser, pre-fills the group name and members, creates the group via the existing API, then batch-creates the parsed expenses. No new backend endpoint needed — uses existing groupsAPI.createGroup() and expensesAPI.createExpense().

features_checklist.md — A new file at the project root listing every feature from Quicksplit UI and features guide.md, marked ✅ Complete / 🟡 Partial / ❌ Missing. This is a living document for tracking what's shipped vs. what's left.

Key constraint found: The backend has NO Splitwise CSV import endpoint. The /api/v1/dataset/submit endpoint is for OCR receipt images only. All parsing must happen client-side (browser FileReader + string splitting). Expenses are then created one-by-one via POST /api/v1/expenses/.

Task 1 — Splitwise Import inside CreateGroup
File to modify
frontend/src/pages/CreateGroup.tsx

UI Flow (new Step 0 added before existing 3 steps)
Step 0 (NEW): Choice screen
  ┌─────────────────────┐  ┌─────────────────────┐
  │  🆕 Start fresh     │  │  📥 Import from     │
  │  Create a new group │  │     Splitwise       │
  └─────────────────────┘  └─────────────────────┘
         ↓                          ↓
  Steps 1→2→3 (existing)    Import sub-flow:
                              ① File picker (CSV/Excel)
                              ② Parse → preview card
                                 (group name detected,
                                  N members, N expenses)
                              ③ "Looks good" → pre-fill
                                 steps 1→2→3 and advance
                                 to Step 3 directly
When "Import from Splitwise" is chosen:

Show a file picker accepting .csv only
Parse the CSV in-browser (FileReader API, no external library)
Show a preview card: detected group name, member list, expense count
User confirms → sets name, memberEmails, advances to Step 3 (preferences)
On final "Create Group" → creates group via API → then batch-creates expenses via expensesAPI.createExpense() one-by-one with a progress indicator
On success → navigates to /groups/${group.id}
CSV Parsing Logic (browser-side, inline in CreateGroup.tsx)
Splitwise exports two CSV variants. Handle both:

Variant A — Group export (most common):

Date,Description,Category,Cost,Currency,"Paid by [Name]","Owed by [Name1]","Owed by [Name2]",...
Headers containing "Paid by" or "Owed by" → extract names as members
Each data row → one expense: {date, description, amount, currency, paidByName}
Variant B — Individual export:

Date,Description,Category,Cost,Currency,Name1,Name2,...
Column headers after Currency → member names
Positive values = paid, negative = owed
Parse function signature (add inline at top of CreateGroup.tsx):

interface ParsedSplitwiseData {
  groupName: string;          // from filename (strip .csv, titlecase)
  members: string[];          // unique names extracted from headers
  expenses: ParsedExpense[];
}

interface ParsedExpense {
  date: string;               // YYYY-MM-DD
  description: string;
  amount: number;
  currency: string;
  paidByName: string;
}

function parseSplitwiseCSV(csvText: string, filename: string): ParsedSplitwiseData
Member extraction: Names from "Paid by [Name]" and "Owed by [Name]" column headers, deduped, lowercased if they look like emails, skipped if "Total balance" or empty.

Note on member emails: Splitwise exports contain names, not emails. Since groupsAPI.createGroup() expects member_emails[], the extracted names will be shown as a note ("Members detected — enter their emails to invite them") and the email input on Step 2 will be pre-populated with an empty list but with a banner showing the detected names.

State additions to CreateGroup.tsx
const [mode, setMode] = useState<'choice' | 'fresh' | 'import'>('choice');
const [importFile, setImportFile] = useState<File | null>(null);
const [parsedData, setParsedData] = useState<ParsedSplitwiseData | null>(null);
const [importedExpenses, setImportedExpenses] = useState<ParsedExpense[]>([]);
const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null);
Expense creation after group creation
In createMutation.onSuccess, if importedExpenses.length > 0:

Loop through importedExpenses sequentially
Call expensesAPI.createExpense({ group_id: group.id, description, amount, category: 'other', paid_by_user_id: currentUser.id, split_type: 'equal', date, participant_ids: [currentUser.id] })
Update importProgress counter
After all done → navigate to /groups/${group.id}
The paid_by_user_id defaults to current user (since names in CSV can't be matched to user IDs without a lookup). Show a note: "Expenses imported — update 'paid by' in each expense if needed."

Step number display
Mode = 'choice': No step indicator shown
Mode = 'fresh' or 'import': Steps 1–3 shown (existing progress bar)
Import mode adds a small "📥 Imported from Splitwise" banner on Step 1 so user knows data was pre-filled
Task 2 — features_checklist.md
File to create
/Users/devanshupatil/Documents/QuickSplit/quicksplit test/features_checklist.md

Structure
Two sections: Complete (✅) then Remaining (❌/🟡). Grouped by feature area matching the UI guide sections.

Complete features ✅ (32 items)
Splash Screen — animated logo, auto-redirect (authed → /friends, unauthed → /onboarding)
Onboarding — 5 slides, progress dots, skip, localStorage qs_onboarded flag
Login — Google/Apple UI buttons, email+password, show/hide password, teal CTA
Register — name, email, password, confirm, terms checkbox
Permission Setup — Contacts / Notifications / Camera cards with skip
Bottom Nav — 5 tabs: Friends | Groups | +FAB | Personal | Account
Action Sheet — FAB opens: Add Expense / Scan Bill / Settle Up
Filter Sheet — slide-up radio sheet, reused across Friends + Groups
Desktop Navbar — left sidebar, teal brand
Dark Mode — CSS variables, ThemeProvider, system/light/dark toggle
Friends Tab — search, FilterSheet, balance summary chips, all-settled banner
Friend swipe actions — drag="x" to reveal Settle / Remind / Remove
Friend Detail — hero, balance, expense tabs + settlement tabs
Add Friend — search by name/email with live results, QR tab placeholder
Groups Tab — search, FilterSheet, category emoji icons, balance chips, category quick-filter row
Create Group — 3-step wizard: name+type → members (email chips) → split defaults + currency
Group Detail — gradient hero by category, 4-button quick actions, group analytics mini card, collapsible members
Group Insights — member bar chart, category SVG donut, settlement plan
Add Expense — Splitwise-style chip picker, ₹ amount field, expandable split panel (Equal/Exact/%/Shares), bottom toolbar
Expense Detail — teal gradient hero, emoji reactions, receipt attachment CTA, comments section
Settle Up — 5 UPI method tabs (GPay/PhonePe/Paytm/Cash/Other), AI suggestion card, success screen with QR
Personal Tab — monthly spend hero, budget ring, AI insight card, quick links, recent expenses
AI Chat — mock AI with keyword replies, suggestion prompts, "thinking" animation
Budget Dashboard — SVG ring, category bars, OVER/NEAR/ON TRACK badges, localStorage
Spending Insights — SVG donut, date filters (Jun/May/All/Custom), category breakdown
Subscription Tracker — list, add/delete, localStorage
Account Tab — user card, QR row, Pro banner, all settings rows, logout with confirm dialog
Edit Profile — 8-color avatar picker, name field, UPI ID field, PATCH /auth/me/
Appearance Settings — light/dark/system toggle, instantly applies
Notification Settings — grouped toggles, localStorage
Security Settings — biometrics placeholder
Pro Upgrade — plan picker (Monthly/Quarterly/Yearly), timeline, try free CTA
Referral Page — progress bar (X/3), how-it-works, share + copy link
Import Splitwise — standalone page at /account/import with CSV file upload
OCR Scan flow — Scan → Split → Review → History (existing pages kept)
Skeleton loading — SkeletonCard + SkeletonRow used on Friends, Groups, GroupInsights
Remaining features ❌/🟡
Immediate (Phase 9 + this session):

🟡 Import from Splitwise inside CreateGroup flow — CSV upload pre-fills group + batch-creates expenses ← THIS SESSION
❌ QRSheet component — AccountTab "QR Code" row currently navigates nowhere; needs Scan tab + My Code tab bottom sheet
❌ Page transition animations — AnimatePresence on route change (slide/fade between pages)
❌ Pull-to-refresh — Friends, Groups, Activity (touch gesture → refetch)
❌ Enhanced empty states — illustration + CTA on Friends, Groups, Activity, ExpenseDetail comments
V2 / Post-launch:

❌ Guest mode — use app without login
❌ Phone OTP login
❌ Voice AI assistant — "Split ₹1200 dinner with Rahul"
❌ Real AI (Claude API) — /personal/ai-chat currently uses mock keyword replies
❌ Multi-currency with live exchange rates
❌ Export (CSV / PDF / Excel reports)
❌ Group Chat — threaded messages in groups
❌ Haptic feedback — on settlement, success, add expense
❌ Home screen widgets — live balance widget
❌ Recurring expenses auto-detection from SMS/bank
❌ Expense search engine — global search with filters
❌ Gamification — badges (Best Saver, Fast Settler)
❌ Smart auto-categorization — ML-based merchant → category
❌ AI fraud detection — unusual expense / duplicate detection
❌ Long-term ledger — persistent couple/roommate history
❌ Travel mode — trip budget, itinerary, shared docs
❌ Bank SMS detection / email parsing
❌ Spending heatmap
❌ Advanced settlement batching (minimize transactions algorithm shown, full batching not wired)
Implementation Order
Write features_checklist.md first (read-only, no build risk)
Modify CreateGroup.tsx:
Add inline parseSplitwiseCSV() utility function
Add ParsedSplitwiseData + ParsedExpense interfaces
Add mode state + import state variables
Insert Step 0 choice screen before existing JSX
Add import sub-flow (file picker → parse → preview card → confirm)
Modify createMutation.onSuccess to batch-create expenses if any were imported
Run npm run build — verify zero TypeScript errors
Verification
npm run build → zero TS errors
Navigate to /groups/new:
"Start fresh" → existing 3-step wizard unchanged
"Import from Splitwise" → file picker appears
Upload a .csv file → preview card shows group name + member count + expense count
Confirm → form pre-filled, advances to Step 3
"Create Group" → group created → expenses batch-created → navigate to group page
features_checklist.md opens in editor — ✅ items at top, ❌ at bottom