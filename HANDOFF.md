# JustiXia — Handoff Document

## Goal

Build a legal AI assistant that helps people without access to a lawyer understand their rights and generate formal response letters in 30 seconds. Distribution via web app + Telegram bot. Target: people in precarious situations (expulsion, prefecture refusal, abusive contracts, etc.).

---

## Stack

- **Frontend**: Static HTML/CSS/JS (no framework, Inter font, DoNotPay-inspired design system)
- **Backend**: FastAPI (Python 3.13) + Anthropic SDK (claude-sonnet-4-6)
- **Bot**: python-telegram-bot
- **Deployment**: Vercel (static files + Python serverless via `api/`)
- **Repo**: https://github.com/lawalalao/justixIA

---

## Project Structure

```
justixIA/
├── index.html              # Landing page (served at / on Vercel)
├── app/
│   └── index.html          # Web app (upload + analysis + letter)
├── landing/
│   └── index.html          # Landing page source (kept in sync with root index.html)
├── api/
│   └── index.py            # FastAPI serverless function for Vercel
├── backend/
│   ├── main.py             # FastAPI app for local dev (includes static file serving)
│   ├── telegram_bot.py     # Telegram bot
│   └── requirements.txt    # Local dev dependencies
├── requirements.txt        # Root-level requirements for Vercel
├── vercel.json             # Vercel routing config
└── start.sh                # Local dev launcher
```

---

## Design System

Inspired by DoNotPay. Apply consistently to all new pages.

- **Background**: White `#FFFFFF`, section alt: `#F8F8FB`
- **Brand**: Pink gradient `linear-gradient(135deg, #FF2D78, #FF5CA8)`
- **Pink accent**: `#FF2D78`
- **Text**: Navy `#1A1A2E`, body `#333344`, muted `#6B6B7B`
- **Font**: Inter (400, 500, 600, 700, 800) — no other fonts
- **Buttons**: Pill-shaped (`border-radius: 9999px`), pink gradient, glow shadow
- **Cards**: White, `border-radius: 16px`, `box-shadow: 0 2px 20px rgba(0,0,0,0.06)`
- **Footer links**: Lavender `#7B5CF0`
- **Dark CTA section**: `#0D0D1F`
- **No emojis**, no decorative icons, no em dashes (—)
- **Mobile-first**: min touch target 44px, `100dvh`, camera access on mobile

---

## Current Progress

### Done

- [x] Landing page (full content, design system applied, scroll reveal animations)
- [x] Web app (upload PDF/photo + optional context textarea + language selector)
- [x] Camera access on mobile (`capture="environment"`)
- [x] Backend API (`POST /api/analyze`) — handles PDF, image, plain text
- [x] Claude integration with structured JSON response (type, irregularities, rights, deadlines, letter)
- [x] System prompt that understands document + user context together
- [x] Rate limit error handling (429 returns clean message)
- [x] Telegram bot (language selection, document upload, photo, plain text, result formatting)
- [x] Vercel deployment config (`vercel.json` with `framework: null`, `rewrites`)
- [x] GitHub repo: https://github.com/lawalalao/justixIA
- [x] Toast notifications replacing native `alert()`

### In Progress / Partial

- [ ] Vercel deployment — config fixed, awaiting confirmation it renders correctly
- [ ] Merchant/association dashboard — not started

---

## What Worked

- Keeping the backend stateless (no DB, no session) — fast, simple, Vercel-compatible
- Sending both the file AND the user context text together to Claude in the same request
- Improved system prompt that explicitly tells Claude to read document + context as one situation
- `framework: null` in vercel.json fixes the FastAPI auto-detection conflict
- Removing `builds`/`routes` keys in favor of `rewrites` — Vercel auto-detects `api/*.py`

## What Did Not Work

- `vercel.json` with `builds` + `routes` (old format) — conflicts with Vercel's FastAPI auto-detection, causes blank render
- Mounting StaticFiles in FastAPI for `/app` route — returns 404 without trailing slash; fixed by adding explicit `@app.get("/app")` route
- System prompt without context awareness — Claude analyzed the document type only, missed the user's described situation (e.g. bail + "being pressured to sell quickly" was not understood as one scenario)
- Using `alert()` for errors on mobile — replaced with toast

---

## API Response Format

```json
{
  "type_document": "Description of document + situation",
  "resume": "2-3 sentence summary from user's perspective",
  "irregularites": [
    { "article": "Art. L412-1 CCH", "description": "Clear explanation of the violation" }
  ],
  "droits": ["Right 1 in plain language", "Right 2..."],
  "delais": "Precise legal deadlines to act",
  "lettre": "Full formal letter ready to send",
  "langue": "language used"
}
```

---

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Vercel + local | Anthropic API key |
| `TELEGRAM_BOT_TOKEN` | local only | Telegram bot token (not on Vercel) |
| `JUSTIXIA_API_URL` | local bot | Backend URL for the Telegram bot |

---

## Local Dev

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...
uvicorn main:app --reload --port 8000
# App: http://localhost:8000/app
# Landing: http://localhost:8000
```

---

## Next Steps — Merchant / Association Dashboard

The dashboard is a B2B interface for associations (La Cimade, ADIL, Emmaüs Connect) and legal aid organizations to manage their beneficiaries' cases.

### What to build

**Route**: `/dashboard` (new static page + new API endpoints)

**Authentication**: Simple email/password or magic link (use Supabase or a lightweight JWT approach — no OAuth needed for hackathon)

**Pages to create**:

1. `/dashboard/login` — Login page (email + password, pink CTA)
2. `/dashboard` — Main dashboard: list of analyzed documents/cases
3. `/dashboard/case/[id]` — Detail view of a single case

**Dashboard main view should show**:
- Summary cards: total cases, pending cases, cases this week
- Table of cases: date, document type, beneficiary language, status (analyzed / letter sent)
- Search and filter by document type or language
- Button to start a new analysis on behalf of a beneficiary

**Case detail view should show**:
- All fields from the API response (type, summary, irregularities, rights, deadlines, letter)
- Download letter button
- Status management (open / in progress / resolved)
- Notes field (for the caseworker)

### Design rules (same system)
- White background, pink accents, Inter font
- Table rows with hover highlight (pink tint)
- Status badges: pill-shaped, color-coded (grey = open, yellow = in progress, green = resolved)
- Sidebar nav (desktop) or bottom nav (mobile)
- Same card/button/shadow system as landing + app

### API endpoints to add in `api/index.py`
- `POST /api/cases` — save a case (after analysis)
- `GET /api/cases` — list all cases (paginated)
- `GET /api/cases/{id}` — get one case
- `PATCH /api/cases/{id}` — update status or notes

### Storage for hackathon
Use **Supabase** (free tier, Postgres) — simple REST API, no server needed.
Add `supabase-py` to `requirements.txt`.

Table schema:
```sql
create table cases (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  type_document text,
  resume text,
  irregularites jsonb,
  droits jsonb,
  delais text,
  lettre text,
  langue text,
  status text default 'open',
  notes text
);
```

---

## Key Decisions

- No user accounts for the public app (freemium: 1 free analysis, then paywall)
- Dashboard is B2B only — separate auth, separate route
- All analysis is stateless on the public side (no storage)
- The Telegram bot shares the same `/api/analyze` endpoint
- Claude model: `claude-sonnet-4-6` (best quality/speed tradeoff for legal analysis)
