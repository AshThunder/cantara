# Cantara — Final Submission Readiness

**Deadline:** Monday 13 July 2026 · 12:59 BST (UK)  
**Repo:** https://github.com/AshThunder/cantara  
**Tracks:** T1 Private DeFi (invoices) · T3 Payments

Encode requires **DevNet deployment via Seaport on 5N Validator** — not LocalNet or localhost-only.  
Canton Foundation (Jatin): *no Testnet; use Seaport on provided 5N DevNet.*

---

## Submission checklist

| # | Requirement | Status | Owner / notes |
|---|-------------|--------|----------------|
| 1 | Public repository | ✅ Done | GitHub public, README polished |
| 2 | Presentation deck | 🟡 Local | Generate pptx → Google Slides → share link |
| 3 | 3‑minute video pitch + demo | ❌ Todo | Script below |
| 4 | Link to live product | ❌ Todo | **Vercel** (frontend) + API host (see below) |
| 5 | Deployed on Canton DevNet | 🟡 Partial | Payment + Refund ✅ · Invoice on-ledger ❌ |

**Definition of done:** All five rows green before Monday 12:59 BST.

---

## What we already have

- Daml contracts built (`cantara-0.1.0.dar`, SDK 3.5.1)
- Package on **5N Sandbox DevNet** via Seaport
- On-ledger proof: `Payment` create + `Payment_Refund` → `RefundedPayment`
- Full-stack demo: React UI + Express demo API
- Presentation with UI + Seaport screenshots (local pptx)

---

## Workstream A — On-ledger (Seaport / DevNet)

**Step-by-step guide:** [SEAPORT-INVOICE-DEMO.md](SEAPORT-INVOICE-DEMO.md)  
**Daml zip for copy:** `docs/seaport-daml-sync.zip` (regenerate: `zip -r docs/seaport-daml-sync.zip daml.yaml daml/`)

**Why:** Judges require contracts running on DevNet, not just local demo.

### A1. Sync Seaport workspace with real Daml

Your Seaport project is still a stub (`0.0.1`, empty `daml/`). Copy from local repo:

```
daml.yaml          → sdk 3.5.1, version 0.1.0
daml/Cantara/      → entire tree (Payments/, Invoices/, Scripts/)
```

In Seaport: **Save → Build Project → Deploy**

### A2. Demo invoice workflow on-ledger

Minimum for T1 credibility (pick one path):

1. **InvoiceProposal** — supplier submits to buyer  
2. **Accept** — buyer confirms → `Invoice`  
3. (Stretch) **Attest** → **FinancingOffer** → **Settle**

Use sandbox operator party `5nsandbox-devnet-2::1220a14ca128063b8dc9d1ebb0bd22633be9f2168500f4dbc1ecaeb1855b14e5acf8` until Loop party is allocated.

### A3. Capture proof for video + deck

- [ ] Screenshot: Packages list showing `cantara` v0.1.0  
- [ ] Screenshot: Invoice contract created  
- [ ] Screenshot: Execution log (CreatedEvent)  
- [ ] Note package ID: `b011f10b002d597291b67192a3c6c036a5ea9c7387726718292833d2c3cf3f58`

### A4. Optional — Loop party on sandbox

Ask in **#canton** Discord for your Loop party on 5N Sandbox (removes 403 on `actAs`).

---

## Workstream B — Vercel (live product — frontend)

**Full guide:** [DEPLOY.md](DEPLOY.md)

**Why:** Submission needs a public URL, not `localhost:5173`.

Vercel hosts the **React frontend**. The demo API is a separate Express server (see Workstream C).

### B1. Vercel project setup

1. Go to [vercel.com](https://vercel.com) → Import `AshThunder/cantara`  
2. **Root Directory:** `frontend`  
3. **Framework Preset:** Vite  
4. **Build Command:** `npm run build`  
5. **Output Directory:** `dist`  
6. Deploy

`frontend/vercel.json` is included for React Router (SPA rewrites).

### B2. Environment variables (Vercel dashboard)

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://YOUR-API-HOST/api` |

Set this **after** Workstream C so the live site talks to the hosted API.

Redeploy after adding env vars (Vite bakes them at build time).

### B3. Verify live frontend

- [ ] Landing page loads  
- [ ] No blank page after Get Started (API must be up)  
- [ ] Connect Party shows Alice, Bob, Carol, Financier  
- [ ] Dashboard / Send / Activity work  
- [ ] Copy Vercel URL for submission form (e.g. `https://cantara.vercel.app`)

---

## Workstream C — API hosting (backend)

**Why:** Vercel runs static/Vite builds well; our **Express** demo API needs a Node host.

`frontend` calls `VITE_API_URL` (see `src/lib/api.ts`). Local dev uses Vite proxy `/api` → `:3001`.

### Recommended: Railway or Render (free tier, minimal changes)

**Railway example:**

1. New project → Deploy from GitHub → select `cantara` repo  
2. **Root Directory:** `backend`  
3. **Start command:** `npm run build && npm start`  
4. Public URL e.g. `https://cantara-api.up.railway.app`  
5. In Vercel: `VITE_API_URL=https://cantara-api.up.railway.app/api`  
6. Redeploy Vercel frontend

**Render:** same pattern (Web Service, root `backend`, build `npm install && npm run build`, start `npm start`).

### CORS

Backend already uses `cors()`. If needed, restrict to your Vercel domain in production.

### Alternative (later)

Wire backend to Canton JSON Ledger API (5N Sandbox credentials) instead of in-memory ledger — not required for submission if Seaport proofs exist.

---

## Workstream D — 3‑minute video

**Why:** Required for final submission.

### Suggested script (~3:00)

| Time | Content |
|------|---------|
| 0:00–0:25 | Problem: institutional payments + invoice finance need privacy |
| 0:25–0:45 | Cantara: two modules, one platform, Canton party-based privacy |
| 0:45–1:30 | **Live Vercel URL:** landing → connect Alice → dashboard → send payment |
| 1:30–2:15 | **Seaport:** package deployed, Payment + Refund contracts, execution log |
| 2:15–2:45 | Invoice module (UI + on-ledger if done) |
| 2:45–3:00 | GitHub link, tracks T1+T3, thank you |

### Recording checklist

- [ ] 1080p screen recording (OBS / Loom)  
- [ ] Mic clear, no long pauses  
- [ ] Upload to YouTube (unlisted) or Loom  
- [ ] Add link to README + submission form  

---

## Workstream E — Presentation

- [ ] `cd docs && node generate-slides.mjs`  
- [ ] Import `Cantara-Checkpoint-2.pptx` → Google Slides  
- [ ] Add any new Seaport invoice screenshots  
- [ ] Share → Anyone with link  
- [ ] Paste URL in submission form  

---

## Workstream F — Repository polish

- [ ] README: live demo URL, video URL, Seaport/DevNet proof section  
- [ ] README: final submission links block at top  
- [ ] `docs/PROGRESS.md` updated with final status  
- [ ] Remove any secrets (`.env`, PDF credentials) — already gitignored  
- [ ] Confirm `main` builds: `dpm build`, `frontend npm run build`, `backend npm run build`  

### README snippet to add after deploy

```markdown
## Live demo

| Resource | URL |
|----------|-----|
| App | https://YOUR-APP.vercel.app |
| API | https://YOUR-API.railway.app |
| Video | https://youtube.com/... |
| Deck | https://docs.google.com/presentation/d/... |
| DevNet | cantara v0.1.0 on 5N Sandbox via Seaport |
```

---

## Workstream G — Submit on Encode

Final form fields (typical):

- [ ] Public repo URL  
- [ ] Presentation URL (Google Slides)  
- [ ] Video URL  
- [ ] Live product URL (Vercel)  
- [ ] Tracks: T1 + T3  
- [ ] Project image (dashboard screenshot or `cantara.svg`)  
- [ ] Short description emphasizing DevNet + privacy  

---

## Suggested schedule (deadline Mon 13 Jul)

| Day | Focus |
|-----|--------|
| **Thu 10 Jul** | Seaport: sync daml, deploy, invoice on-ledger demo |
| **Fri 11 Jul** | Railway/Render API + Vercel frontend, verify full live stack |
| **Sat 12 Jul** | Record video, finalize deck, README links |
| **Sun 12 Jul** | Buffer: fix bugs, re-record if needed |
| **Mon 13 Jul** | Submit before 12:59 BST |

---

## Quick commands reference

```bash
# Daml
export PATH="$HOME/.dpm/bin:$PATH"
cd cantara && dpm build

# Local full stack
cd cantara/backend && npm run dev    # :3001
cd cantara/frontend && npm run dev   # :5173

# Frontend production build (same as Vercel)
cd cantara/frontend && npm run build

# Presentation
cd cantara/docs && node generate-slides.mjs
```

### Vercel CLI (optional)

```bash
npm i -g vercel
cd cantara/frontend
vercel          # preview
vercel --prod   # production
```

---

## Risk register

| Risk | Mitigation |
|------|------------|
| Live app broken (API down) | Health check `/api/health`; monitor Railway |
| Judges say “not on DevNet” | Point to Seaport package + execution logs on 5N Sandbox |
| Demo ledger resets on API restart | Acceptable for hackathon; seed parties on boot (already done) |
| Only Payment on-ledger | Prioritize one invoice flow this week |

---

## Links

- Seaport: https://app.devnet.seaport.io/encode-hackathon  
- Seaport Guide: https://github.com/Jatinp26/Seaport-Guide  
- Encode hackathon: https://forum.canton.network/t/build-on-canton-hackathon/8635  
- Canton docs: https://docs.canton.network  
