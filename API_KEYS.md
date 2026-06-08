# QuickSplit — API Keys Reference

All API keys go into `backend/.env`. Copy `backend/.env.example` to `backend/.env` first.

---

## Minimum Required (AI Chat works with just this)

### Groq — Free
| Field | Value |
|-------|-------|
| Cost | Free (generous rate limits) |
| Models | Llama 3.1 70B, Mixtral 8x7B |
| Sign-up | https://console.groq.com |

**Steps:**
1. Create account at `console.groq.com`
2. Go to **API Keys** → **Create API Key**
3. Copy the key (starts with `gsk_...`)
4. Add to `backend/.env`:
   ```
   GROQ_API_KEY=gsk_YOUR_KEY_HERE
   ```

---

## Second Best — Also Free

### Google Gemini Flash — Free Tier
| Field | Value |
|-------|-------|
| Cost | **Free** (15 req/min, 1M tokens/min, 1500 req/day) |
| Models | Gemini 1.5 Flash (fast + smart) |
| Sign-up | https://aistudio.google.com |

**Steps:**
1. Go to `aistudio.google.com` → sign in with your Google account
2. Click **"Get API key"** → **"Create API key in new project"**
3. Copy the key (starts with `AIza...`)
4. Add to `backend/.env`:
   ```
   GEMINI_API_KEY=AIzaYOUR_KEY_HERE
   ```
5. Restart the backend — Gemini will be used automatically if Groq key is absent

> Gemini 1.5 Flash is excellent for financial Q&A, very fast, and has a generous free tier with no credit card required.

---

## Optional (for better AI quality or fallback)

### Anthropic Claude — Paid ($5 trial credits on signup)
| Field | Value |
|-------|-------|
| Cost | ~$3/M input tokens (Haiku is cheapest) |
| Models | Claude 3.5 Haiku, Claude 3.5 Sonnet |
| Sign-up | https://console.anthropic.com |

**Steps:**
1. Create account at `console.anthropic.com`
2. Go to **API Keys** → **Create Key**
3. Add to `backend/.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
   ```

### OpenAI — Paid (no free tier)
| Field | Value |
|-------|-------|
| Cost | Pay-per-use (starts ~$5 credit) |
| Models | GPT-4o mini, GPT-4o |
| Sign-up | https://platform.openai.com |

**Steps:**
1. Create account at `platform.openai.com`
2. Go to **API Keys** → **Create new secret key**
3. Add to `backend/.env`:
   ```
   OPENAI_API_KEY=sk-YOUR_KEY_HERE
   ```

---

## OCR (No API Key Needed)

Tesseract OCR runs **locally** on your machine. No API key required.

Install Tesseract:
- **macOS:** `brew install tesseract`
- **Ubuntu/Debian:** `sudo apt-get install tesseract-ocr`
- **Windows:** Download installer from https://github.com/UB-Mannheim/tesseract/wiki

---

## Database

QuickSplit uses **PostgreSQL**. No external API key, just a connection string.

```
DATABASE_URL=postgresql://USERNAME@localhost/quicksplit
```

Replace `USERNAME` with your macOS/Linux username (run `whoami` in terminal).

**Setup (first time):**
```bash
createdb quicksplit
```

---

## Complete backend/.env Template

```env
# Database
DATABASE_URL=postgresql://YOUR_USERNAME@localhost/quicksplit

# Django
SECRET_KEY=quicksplit-dev-secret-key-change-in-production
DEBUG=True

# CORS (frontend origins)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# AI Providers — priority: Groq → Gemini → Anthropic → OpenAI
# Only one key is needed. Groq and Gemini are both free.
GROQ_API_KEY=gsk_YOUR_GROQ_KEY_HERE
GEMINI_API_KEY=AIzaYOUR_GEMINI_KEY_HERE
ANTHROPIC_API_KEY=sk-ant-YOUR_ANTHROPIC_KEY_HERE
OPENAI_API_KEY=sk-YOUR_OPENAI_KEY_HERE
```

---

## AI Provider Priority

The backend tries providers in this order and uses the first one that works:

```
Groq → Gemini → Anthropic → OpenAI
```

**Recommended setup**: Set only `GROQ_API_KEY` (primary, fastest) + `GEMINI_API_KEY` (free fallback). Both are free with no credit card required.

The AI uses **real user data** in every request: last 20 expenses, total spend amount, and top spending category. No static data is shown.

---

## Providing Keys to Claude (AI assistant)

To give Claude Code your API keys during a session, create or update `backend/.env` with your actual keys. Claude will read them when running the backend. **Never commit `.env` to git** — it's in `.gitignore`.
