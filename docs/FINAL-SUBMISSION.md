# Cantara — Final Submission Readiness

**Deadline:** Monday 13 July 2026 · 12:59 BST (UK)  
**Repo:** https://github.com/AshThunder/cantara  
**Tracks:** T1 Private DeFi (invoices) · T3 Payments

Encode requires **DevNet deployment via Seaport on 5N Validator** — not LocalNet or localhost-only.  
Canton Foundation (Jatin): *no Testnet; use Seaport on provided 5N DevNet.*

---

## Live product (ready for form)

| Resource | URL |
|----------|-----|
| **App** | https://cantara-hackathon.vercel.app |
| **API** | https://cantara-api-production.up.railway.app |
| **Health** | https://cantara-api-production.up.railway.app/api/health → `mode: "canton"` |
| **Repo** | https://github.com/AshThunder/cantara |
| **Video** | ✅ Edited locally — upload YouTube/Loom → paste URL here + README |
| **Deck** | ✅ [Google Slides](https://docs.google.com/presentation/d/1grlqa0Dv2jX9DAKMiLxVaK2QJThOw_-r1N6VaXO84F4/edit?usp=sharing) |
| **DevNet** | `cantara` v0.1.0 on 5N Sandbox via Seaport |

**Package ID:** `b011f10b002d597291b67192a3c6c036a5ea9c7387726718292833d2c3cf3f58`  
**Operator:** `5nsandbox-devnet-2::1220a14ca128063b8dc9d1ebb0bd22633be9f2168500f4dbc1ecaeb1855b14e5acf8`

---

## Submission checklist

| # | Requirement | Status | Owner / notes |
|---|-------------|--------|----------------|
| 1 | Public repository | ✅ Done | https://github.com/AshThunder/cantara |
| 2 | Presentation deck | ✅ Done | [Google Slides](https://docs.google.com/presentation/d/1grlqa0Dv2jX9DAKMiLxVaK2QJThOw_-r1N6VaXO84F4/edit?usp=sharing) |
| 3 | 3‑minute video pitch + demo | 🟡 Edited | Upload to YouTube (unlisted) or Loom → paste URL in Encode + README |
| 4 | Link to live product | ✅ Done | https://cantara-hackathon.vercel.app |
| 5 | Deployed on Canton DevNet | ✅ Done | Payments + refunds + full invoice lifecycle via Railway → 5N |

**Definition of done:** Rows 2–3 green (public links) before Monday 12:59 BST.

---

## What we already have

- Daml contracts built (`cantara-0.1.0.dar`, SDK 3.5.1)
- Package on **5N Sandbox DevNet** via Seaport
- On-ledger: `Payment`, `Payment_Refund`, full invoice lifecycle (propose → accept → attest → offer → settle)
- Live stack: Vercel frontend + Railway API (`LEDGER_MODE=canton`) → JSON Ledger API
- Features live: send, multi-send, subscriptions (+ scheduler), checkout/pay, wallet, invoices, merchant SDK
- Smoke verified (10 Jul 2026): health, parties, UI send Alice→Bob, API invoice settle

---

## Workstream A — On-ledger (Seaport / DevNet) ✅

**Step-by-step guide:** [SEAPORT-INVOICE-DEMO.md](SEAPORT-INVOICE-DEMO.md)

Package deployed; API exercises contracts on DevNet. Optional polish:

- [ ] Screenshot: Packages list showing `cantara` v0.1.0  
- [ ] Screenshot: Invoice / Payment in Lighthouse for video  
- [ ] Optional: distinct Loop parties (today all UI parties map to one operator)

---

## Workstream B — Vercel (frontend) ✅

**Live:** https://cantara-hackathon.vercel.app  
**Guide:** [DEPLOY.md](DEPLOY.md)

| Setting | Value |
|---------|--------|
| Root | `frontend` |
| Env | `VITE_API_URL=https://cantara-api-production.up.railway.app/api` |
| SSO | Disabled (public) |

Verified: landing → Get Started → Dashboard → Send → Lighthouse tx/contract links.

---

## Workstream C — Railway (API) ✅

**Live:** https://cantara-api-production.up.railway.app  
**Health:** `GET /api/health` → `"mode":"canton"`

Root `backend`, Canton env from 5N credentials (secret **not** in git).  
CORS via `FRONTEND_URLS` including the Vercel origin.

---

## Workstream D — 3‑minute video

### Suggested script (~3:00)

| Time | Content |
|------|---------|
| 0:00–0:25 | Problem: institutional payments + invoice finance need privacy |
| 0:25–0:45 | Cantara: two modules, one platform, Canton party-based privacy |
| 0:45–1:30 | **Live URL:** landing → connect Alice → dashboard → send payment |
| 1:30–2:15 | Multi-send / checkout or Lighthouse tx proof |
| 2:15–2:45 | Invoice module (UI + on-ledger settle) |
| 2:45–3:00 | GitHub + tracks T1+T3 + thank you |

### Recording checklist

- [ ] 1080p screen recording (OBS / Loom)  
- [ ] Mic clear, no long pauses  
- [ ] Upload to YouTube (unlisted) or Loom  
- [ ] Add link to README + this doc + Encode form  

---

## Workstream E — Presentation

- [x] `cd docs && node generate-slides.mjs` → `Cantara-Final.pptx`  
- [ ] Import pptx → Google Slides  
- [ ] Share → Anyone with link  
- [ ] Paste URL in submission form + README  

---

## Workstream F — Repository polish

- [x] README: live demo URLs  
- [x] This checklist updated with live status  
- [ ] `docs/PROGRESS.md` final pass  
- [x] No secrets in git (`backend/.env` gitignored)  
- [ ] Confirm `main` builds: `dpm build`, frontend/backend `npm run build`  

---

## Workstream G — Submit on Encode

- [x] Public repo URL  
- [ ] Presentation URL (Google Slides)  
- [ ] Video URL  
- [x] Live product URL (Vercel)  
- [ ] Tracks: T1 + T3  
- [ ] Project image (dashboard screenshot or `cantara.svg`)  
- [ ] Short description emphasizing DevNet + privacy  

---

## Suggested schedule (deadline Mon 13 Jul)

| Day | Focus |
|-----|--------|
| **Fri 10 Jul** | ✅ Live stack + smoke |
| **Sat 11 Jul** | Record video, finalize deck |
| **Sun 12 Jul** | Buffer: fix bugs, re-record if needed |
| **Mon 13 Jul** | Submit before 12:59 BST |

---

## Quick commands reference

```bash
# Health
curl https://cantara-api-production.up.railway.app/api/health

# Local full stack
cd cantara/backend && npm run dev    # :3001
cd cantara/frontend && npm run dev   # :5173

# Presentation
cd cantara/docs && node generate-slides.mjs
```

---

## Risk register

| Risk | Mitigation |
|------|------------|
| Live app broken (API cold start) | Health check; wait ~10s if Get Started stays on Loading |
| Judges say “not on DevNet” | Point to `mode:canton` + Lighthouse tx/contract links |
| Shared operator party UX | Labels via party ids (Alice/Bob); note in demo |
| Deck / video missing | Only blockers left — prioritize Sat |

---

## Links

- Live app: https://cantara-hackathon.vercel.app  
- Seaport: https://app.devnet.seaport.io/encode-hackathon  
- Seaport Guide: https://github.com/Jatinp26/Seaport-Guide  
- Encode hackathon: https://forum.canton.network/t/build-on-canton-hackathon/8635  
- Canton docs: https://docs.canton.network  
