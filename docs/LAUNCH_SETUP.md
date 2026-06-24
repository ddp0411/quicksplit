# QuickSplit — Launch Setup Runbook (from scratch)

A step-by-step guide to standing up every account/service needed to ship QuickSplit V1:
**backend on Railway, database on Supabase, mobile builds via Expo/EAS, internal testing on
TestFlight + Google Play, and the landing page on Vercel/Netlify.**

This assumes you have **none** of these accounts yet. Do the steps roughly in the order below —
later steps depend on values produced by earlier ones (the Railway API URL, the EAS `projectId`,
the bundle ID, etc.).

> Companion docs: [`supabase-setup.md`](supabase-setup.md) (connection-string detail),
> [`../landing/README.md`](../landing/README.md) (landing deploy), and the per-app `CLAUDE.md` files.

---

## 0. Costs at a glance

| Service | Plan | Cost | Needed for |
|---|---|---|---|
| Supabase | Free | ₹0 | Postgres database |
| Railway | Hobby | ~$5/mo (incl. usage credit) | Always-on backend API |
| Expo / EAS | Free | ₹0 | Mobile builds (queued) |
| Vercel **or** Netlify | Free | ₹0 | Landing page |
| Groq (AI) | Free | ₹0 | AI assistant (recommended provider) |
| **Apple Developer Program** | Annual | **$99 / yr** | TestFlight + App Store |
| **Google Play Console** | One-time | **$25** | Play internal testing + Play Store |
| Domain (optional) | Annual | ~$10–15/yr | `quicksplit.app` for landing/API/store links |

**Start the two paid store accounts first** — Apple enrollment and Google identity verification
can take **1–3 days**, so kick them off on day 1 while you build everything else.

---

## 1. Domain (optional, do early if you want one)

A custom domain makes the landing page, API, and store listings look legit, and the stores want a
public Privacy/Support URL anyway (the landing page provides these).

1. Register `quicksplit.app` (or similar) at **Cloudflare Registrar**, **Namecheap**, or **Porkbun**.
2. You'll point DNS records later: `quicksplit.app` → landing host, optionally
   `api.quicksplit.app` → Railway.

If you skip this, you'll use the free `*.vercel.app` / `*.up.railway.app` subdomains instead — fine
for internal testing.

---

## 2. Supabase (Postgres database) — free

1. Sign up at **https://supabase.com** (GitHub login is easiest).
2. **New project** → name `quicksplit`, generate + **save a strong DB password**, region
   **Mumbai (ap-south-1)** (closest to Indian users).
3. Wait for it to provision (~2 min).
4. Click **Connect** (top bar) → **Session pooler** tab → copy the connection string.
5. Replace `[YOUR-PASSWORD]` with your saved password. URL-encode special chars (`@ # / :`).
   You'll paste this into Railway as `DATABASE_URL` in step 3.

```
postgresql://postgres.PROJECT_REF:DB_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require
```

Detail and pooler-mode notes: [`supabase-setup.md`](supabase-setup.md).
(Use port `5432` session pooler with `DATABASE_POOL_MODE=session`, or `6543` transaction pooler with
`DATABASE_POOL_MODE=transaction`.)

---

## 3. Railway (backend API) — ~$5/mo

The backend is already prod-ready: `Dockerfile` runs migrate → collectstatic → gunicorn;
WhiteNoise serves static; `settings.py` reads everything from env.

1. Sign up at **https://railway.app** (GitHub login).
2. **New Project → Deploy from GitHub repo** → pick this repo.
3. In the service **Settings**:
   - **Root Directory:** `backend`
   - **Builder:** Dockerfile (Railway auto-detects `backend/Dockerfile`).
   - Railway provides `$PORT` automatically; the Dockerfile already binds to it.
4. **Variables** → add these (names must match exactly — verified against `backend/quicksplit/settings.py`):

   | Variable | Value |
   |---|---|
   | `SECRET_KEY` | a long random secret (see below) |
   | `DEBUG` | `false` |
   | `ALLOWED_HOSTS` | `your-service.up.railway.app` (+ `api.quicksplit.app` if using a domain) |
   | `DATABASE_URL` | the Supabase session-pooler URL from step 2 |
   | `DATABASE_POOL_MODE` | `session` |
   | `DATABASE_SSL` | `true` |
   | `CORS_ORIGINS` | landing origin(s), e.g. `https://quicksplit.app,https://www.quicksplit.app` |
   | `CSRF_TRUSTED_ORIGINS` | `https://your-service.up.railway.app` (+ your domain) |
   | `GROQ_API_KEY` | from step 7 (AI). Optional but recommended |

   Generate the secret locally:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(48))"
   ```

5. Deploy. The release runs migrations automatically. Watch the build logs.
6. **Create your admin user** — open the service shell (Railway → service → … → "Shell"/"Run command") or
   add a one-off command:
   ```bash
   python manage.py createsuperuser
   ```
7. **Generate a public domain:** Settings → Networking → **Generate Domain**. This URL (e.g.
   `https://quicksplit-production.up.railway.app`) is your **prod API host**. The API base is that
   `+ /api/v1`.

**Smoke test:**
```bash
curl https://YOUR-RAILWAY-DOMAIN/api/v1/        # API reachable
# open https://YOUR-RAILWAY-DOMAIN/docs          # Swagger UI (static served by WhiteNoise)
# open https://YOUR-RAILWAY-DOMAIN/admin/         # Django admin, log in with the superuser
```

> Note: uploads/dataset write to ephemeral disk on Railway (wiped on redeploy). Fine for V1 — OCR is
> app-side. Move to Supabase Storage / S3 later if you need persistent receipt images.

> Redis/Celery are **not** needed for V1 (no tasks defined). Don't add a Redis service.

---

## 4. Point the mobile app + landing at prod

Now that you have the Railway URL, wire it in (these are repo edits, not accounts):

1. **`mobile/eas.json`** — replace `REPLACE_WITH_RAILWAY_URL` in the `preview` and `production`
   profiles' `EXPO_PUBLIC_API_URL` with `https://YOUR-RAILWAY-DOMAIN/api/v1`.
2. **Landing CORS** — make sure your landing origin is in Railway's `CORS_ORIGINS` (step 3).

---

## 5. Expo / EAS (mobile builds) — free

1. Create an account at **https://expo.dev**.
2. Locally:
   ```bash
   npm install -g eas-cli
   eas login
   cd mobile
   eas init           # creates the EAS project, writes extra.eas.projectId into app.json
   ```
   `app.json` already has name/slug/scheme and bundle IDs (`com.quicksplit.app`); `eas.json` already
   has `development` / `preview` (internal) / `production` profiles.
3. **Build internal test binaries:**
   ```bash
   eas build -p android --profile preview     # produces an installable APK
   eas build -p ios --profile preview         # needs the Apple account from step 6
   ```
   The Android APK can be shared/sideloaded immediately. iOS requires the Apple Developer account.

---

## 6. Apple Developer Program ($99/yr) — start day 1

1. Have an **Apple ID** with two-factor on. Decide **Individual** (your name) vs **Organization**
   (needs a D-U-N-S number, takes longer).
2. Enroll at **https://developer.apple.com/programs/enroll/** → pay $99 → wait for approval
   (often hours, sometimes 1–2 days).
3. In **App Store Connect** (https://appstoreconnect.apple.com):
   - **My Apps → +** → new app, platform iOS, bundle ID **`com.quicksplit.app`** (EAS can also
     register this for you on first iOS build).
   - Fill the minimum metadata; for **App Privacy** you'll point to the landing **Privacy Policy** URL.
4. **Internal TestFlight:**
   ```bash
   cd mobile
   eas submit -p ios --profile production     # or submit the preview build
   ```
   In App Store Connect → TestFlight → add yourself/team as **internal testers** (up to 100, no
   review needed). They install via the **TestFlight** app.

---

## 7. Google Play Console ($25 one-time) — start day 1

1. Sign up at **https://play.google.com/console** → pay $25.
2. Complete **identity/address verification** — now mandatory and can take **1–3 days**.
   (For a personal/individual developer account, expect extra account-age/testing requirements
   before public launch; **internal testing works immediately**, which is our V1 path.)
3. **Create app** → name "QuickSplit", app/free, fill the **Data safety** form and link the landing
   **Privacy Policy** URL.
4. **Internal testing track:** create the track, add tester emails (a Google Group or email list).
5. Build + submit:
   ```bash
   cd mobile
   eas build -p android --profile production
   eas submit -p android --profile production
   ```
   Testers get an opt-in link and install from Play.

> First Play upload must be an **AAB** (the `production` profile builds an app bundle). The
> `preview` profile's APK is for direct sideloading / quick sharing, not the Play track.

---

## 8. AI provider key (for the assistant) — Groq is free

The backend tries providers in order **Groq → Gemini → Anthropic → OpenAI**; set at least one.

1. **Groq (recommended, free):** sign up at **https://console.groq.com**, create an API key, set it
   as `GROQ_API_KEY` in Railway (step 3).
2. Alternatives: `GEMINI_API_KEY` (must start with `AIza`), `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`.

---

## 9. Landing page (Vercel or Netlify) — free

The static site lives in `landing/` (separate from the unused `frontend/` app).

- **Netlify:** drag the `landing/` folder onto https://app.netlify.com/drop, or
  `cd landing && npx netlify deploy --prod --dir .`
- **Vercel:** import the repo, set **Root Directory = `landing`**, framework **Other**, no build
  command.
- Point your domain at it and confirm the **Privacy** (`/privacy`) and **Support** (`/support`) URLs
  resolve — you'll paste those into both stores.

Full steps: [`../landing/README.md`](../landing/README.md).

---

## 10. Recommended order / day plan

1. **Day 1 (kick off the slow ones):** enroll Apple Developer (§6) + Google Play + verification (§7).
2. **Same day (fast):** Supabase project (§2) → Railway deploy + env + superuser + domain (§3) →
   wire prod URL into `eas.json` (§4) → Groq key (§8) → deploy landing (§9).
3. **When approvals land:** `eas init` + `eas build` (§5) → `eas submit` to TestFlight internal (§6)
   and Play internal (§7).
4. Add testers, walk every core flow against the **prod** API, fix, re-build.

---

## 11. Pre-submission checklist (both stores require)

- [ ] Public **Privacy Policy** URL (landing `/privacy`) and **Support** URL (landing `/support`).
- [ ] Real, monitored support inbox (replace `hello@quicksplit.app` placeholders in `landing/`).
- [ ] App icon + screenshots (icon in `mobile/assets/icon.png`; capture device screenshots for the
      store listings).
- [ ] App Store: App Privacy questionnaire. Play: Data safety form.
- [ ] Bundle IDs match everywhere: `com.quicksplit.app` (`app.json` ↔ App Store Connect ↔ Play).
- [ ] `mobile/eas.json` prod/preview `EXPO_PUBLIC_API_URL` points at the Railway domain (not the
      `REPLACE_WITH_RAILWAY_URL` placeholder).
- [ ] Railway `ALLOWED_HOSTS` / `CSRF_TRUSTED_ORIGINS` include the real domain; `DEBUG=false`;
      `SECRET_KEY` set.
