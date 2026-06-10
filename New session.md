Ready for review
Select text to add comments on the plan
QuickSplit — Close All Partial Gaps + Docs
Context
QuickSplit mobile is at ~87% parity with the web. The goal is to make every non-V2 feature fully functional with real API data (no static mocks or placeholders), so the only pending items are the 21 intentional V2 new features. We also need two new docs: an API keys reference and a developer onboarding guide.

AI Provider Recommendation
Use Groq — it's free. Sign up at console.groq.com → API Keys → Create Key.

Provider	Cost	Quality	Notes
Groq	Free (rate-limited)	Good (Llama 3.1 70B)	Already in backend fallback chain; fastest option
Google Gemini	Free tier (Flash)	Very good	aistudio.google.com → Get API key
Anthropic	Paid ($5 trial)	Best	console.anthropic.com
OpenAI	Paid (no free tier)	Good	Skip for now
The backend already supports Groq as the 3rd fallback. We'll reorder it to be primary so only a Groq key is required to run the AI chat.

Phase A — Mobile: Partial → Complete (Functional Gaps)
A1. Swipe Actions on Friend Rows (Important gap)
File: mobile/src/screens/FriendsScreen.tsx
Use react-native-gesture-handler's Swipeable (already installed via react-navigation)
Right swipe reveals 4 actions: Add Expense / Settle / Remind / Remove
Add → navigate to AddExpense with friend pre-filled
Settle → navigate to SettleUp with friend pre-filled
Remind → POST to /expenses/{id}/comments/ with a reminder message, or show a Toast (backend has no push-notification endpoint)
Remove → call DELETE /friends/requests/{id}/cancel/ (or equivalent remove endpoint in friendsAPI)
A2. Skeleton Loading on Home + GroupDetail
Files: mobile/src/screens/HomeScreen.tsx, mobile/src/screens/GroupDetailScreen.tsx
Reuse existing SkeletonLoader at mobile/src/components/SkeletonLoader.tsx
HomeScreen: replace raw ActivityIndicator in balance strip and friends sections
GroupDetailScreen: wrap the expenses FlatList and stats row with skeleton rows while loading
A3. Remind Button → Real Action (HomeScreen)
File: mobile/src/screens/HomeScreen.tsx
Current: Alert.alert('Reminder sent!') (fake)
Real: call POST /expenses/{expense_id}/comments/ body {content: "Reminder: please settle up 🙏"} using the payer's expense ID, or use expo-notifications to schedule a local notification as a fallback if no shared expense exists
Show a Toast via toastStore on success/failure
A4. OCR History Page
Files: mobile/src/navigation/RootNavigator.tsx, mobile/src/screens/RemainingScreens.tsx
Add OCRHistoryScreen that calls GET /splits/history via splitAPI
Register screen in HomeStack as <Stack.Screen name="OCRHistory" component={OCRHistoryScreen} />
Display results as a date-grouped FlatList with amount and participants
A5. Expense Detail — Comments Section
File: mobile/src/screens/ExpenseDetailScreen.tsx
Backend endpoints exist: GET /expenses/{id}/comments/ + POST /expenses/{id}/comments/
Add a comments FlatList below the split table: avatar initials + comment text + timestamp
Add a sticky input bar at the bottom (TextInput + Send button) that posts via API
A6. Expense Detail — Emoji Reactions
File: mobile/src/screens/ExpenseDetailScreen.tsx
Backend has no reactions endpoint; implement client-side with AsyncStorage keyed by expense_{id}_reactions
Show 5 emoji pills (👍 ❤️ 😂 😮 😢) in a row; tap to toggle; show count per reaction
Counts are local-only (acceptable for now — document limitation in code comment)
A7. Expense Detail — Receipt Attachment CTA
File: mobile/src/screens/ExpenseDetailScreen.tsx
"Attach Receipt" button opens expo-image-picker
On image selected: upload via POST /ocr/upload (multipart), store returned URL in expense notes via PATCH /expenses/{id}/
Show thumbnail of attached image if notes contains an image URL
A8. Scan Receipt Button in Add Expense Form
File: mobile/src/screens/AddExpenseScreen.tsx
Add a 📷 camera icon button in the bottom toolbar row (Date / Group / Scan / Notes)
On press: navigate to Scan screen passing a callback param; on return, pre-fill the amount field
A9. Phone Number in Edit Profile
File: mobile/src/screens/EditProfileScreen.tsx
Backend change needed: backend/api/models.py — add phone_number = models.CharField(max_length=20, blank=True, default=''); run makemigrations && migrate; update serializer + PATCH handler to accept phone_number
Add a "Phone Number" TextInput in EditProfileScreen, PATCH on save
A10. Security Settings — Active Sessions
File: mobile/src/screens/RemainingScreens.tsx (SecuritySettingsScreen)
Backend has no session management endpoint
Implement: decode the stored JWT from userStore (it contains iat + exp), display "This Device — Current Session" with login time
Add "Sign out all devices" button that clears the token and navigates to Login
A11. Import Group CSV — Backend Pipeline Connection
File: mobile/src/screens/RemainingScreens.tsx (ImportGroupScreen)
Check backend/api/views.py for a Splitwise CSV import endpoint (it's likely there in the 43k-line file)
Connect the existing file picker to POST /groups/import/ via multipart upload
Show progress indicator + success/error Toast on response
Phase B — V2 Rebrand: Partial → Complete
B1. Primary CTA Buttons → Orange (#FF6B35) Consistently
Audit all screens: any primary action button (Save / Add / Confirm / Settle / Continue) that is still forest green (#1B4332) should switch to #FF6B35
Secondary/destructive actions stay green or red
Most impacted: CreateGroupScreen, AddExpenseScreen, RegisterScreen, LoginScreen CTAs
B2. Badge System — Add Overdue + "You paid" Badges
Files: FriendsScreen.tsx, ExpenseDetailScreen.tsx, GroupDetailScreen.tsx
Overdue badge: if expense date < today - 7 days and balance unpaid → show red "Overdue" chip
"You paid" badge: if paid_by === currentUser.id → show green "You paid" chip next to expense
B3. Illustrated Empty States
Create mobile/src/components/EmptyState.tsx — reusable component accepting icon, title, subtitle, optional actionLabel + onAction
Design: large emoji/icon in a soft circular background + bold title + subtitle text (no plain emoji+text inline)
Replace all current inline empty state Text blocks across Friends, Groups, Activity, Expenses lists
B4. Sparkline Trend Charts
Files: mobile/src/screens/PersonalScreen.tsx
Implement a MiniBarChart using plain View elements (no external library) — 7 bars, proportional height, accent color
Show last 7 days of spending pulled from GET /activity/ feed, summed per day
Display inline next to the monthly spend hero card
B5. Per-Person Amount on Cards ("₹310 each")
Files: mobile/src/screens/AddExpenseScreen.tsx, ExpenseDetailScreen.tsx
When split type is Equal, compute amount / participantCount and display ₹X each in #FF6B35 accent color under the total amount
Show it live in AddExpense as the user types the amount
Phase C — Navigation Polish
C1. Page Transition Animations
File: mobile/src/navigation/RootNavigator.tsx
In every Stack.Navigator screenOptions, add:
animation: 'slide_from_right',
animationDuration: 220,
This is a native stack built-in — single config change, no library needed
Phase D — Backend Changes
D1. Reorder AI Fallback Chain → Groq First
File: backend/api/views.py (AI chat endpoint)
Change provider attempt order from: Anthropic → OpenAI → Groq to: Groq → Anthropic → OpenAI
This makes the free GROQ_API_KEY sufficient to run the AI chat
D2. Phone Number Field Migration
File: backend/api/models.py — add phone_number field to User model
Run python manage.py makemigrations api + python manage.py migrate
Update backend/api/serializers.py to include phone_number in the User serializer
Update the PATCH /auth/me/ view to accept and save phone_number
Phase E — New Documentation Files
E1. /API_KEYS.md — API Keys Reference
Contents:

Table of all keys needed, where to get them, which are free
Step-by-step: Get Groq key → paste into backend/.env as GROQ_API_KEY=gsk_...
Minimum viable setup: only GROQ_API_KEY is required for AI features
Full setup: Anthropic + OpenAI + Groq for fallback chain
OCR note: Tesseract is local, no API key needed
Database note: PostgreSQL connection string format
E2. /GUIDE.md — Developer Onboarding Guide
Sections:

Prerequisites — Python 3.11+, Node 18+, PostgreSQL 14+, Tesseract OCR, Expo Go app on device
Clone & Setup — one-time setup steps
Backend — cd backend → python -m venv venv → pip install -r requirements.txt → copy .env.example to .env → python manage.py migrate → python manage.py runserver
Web Frontend — cd frontend → npm install → npm run dev → opens at localhost:5173
Mobile Frontend — cd mobile → npm install → npx expo start → scan QR with Expo Go
Running Tests — cd backend && pytest
API Keys — reference API_KEYS.md
Common Issues — Pillow/Tesseract install, PostgreSQL connection errors, Expo tunnel mode for physical device
File Change Summary
File	Change
mobile/src/screens/FriendsScreen.tsx	Swipeable row actions (Add/Settle/Remind/Remove)
mobile/src/screens/HomeScreen.tsx	Skeleton loading on balance/groups/friends + Remind API
mobile/src/screens/GroupDetailScreen.tsx	Skeleton loading on expenses + stats
mobile/src/screens/ExpenseDetailScreen.tsx	Comments (real API) + Reactions (AsyncStorage) + Receipt CTA + per-person amount + badges
mobile/src/screens/AddExpenseScreen.tsx	Scan button in toolbar + per-person amount display
mobile/src/screens/EditProfileScreen.tsx	Phone number field
mobile/src/screens/RemainingScreens.tsx	SecuritySettings sessions + ImportGroup CSV pipeline + OCRHistoryScreen
mobile/src/navigation/RootNavigator.tsx	Register OCRHistory screen + page transition animations
mobile/src/components/EmptyState.tsx	New reusable illustrated empty state component
backend/api/models.py	Add phone_number field to User
backend/api/views.py	Reorder AI provider chain: Groq first
backend/api/serializers.py	Include phone_number in User serializer
API_KEYS.md	New: API key instructions
GUIDE.md	New: Developer onboarding guide
V2 New Features — Intentionally Pending (Do NOT implement)
Guest mode · Phone OTP login · Voice AI assistant · Multi-currency live rates · Export reports (CSV/PDF) · Haptic feedback · Home screen widgets · Recurring auto-detection · Global expense search · Gamification/badges · Smart auto-categorization · AI fraud detection · Long-term ledger · Travel mode · Bank SMS detection · Spending heatmap · Advanced batch settlement · Multi-device session management · Email parsing · Analytics tab · Wallet section

Verification Steps
cd backend && python manage.py runserver 127.0.0.1:9000 — backend on port 9000
cd mobile && npx expo start — scan with Expo Go
Test each fixed feature:
FriendsScreen → swipe a friend row → 4 actions appear
HomeScreen → verify skeleton shows while balance loads
ExpenseDetail → open any expense → comments load from API, type + send a comment
Complete OCR flow (Scan → Split → Review) → navigate to OCR History → entry appears
AI Chat → works with only GROQ_API_KEY set, Anthropic/OpenAI keys absent
EditProfile → add phone number → save → reload → phone number persists
cd backend && pytest — all 10 tests pass
Update features_checklist.md and web_mobile_feature_comparison.md to mark completed items ✅
