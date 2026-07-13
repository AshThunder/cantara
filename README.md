# Cantara

**Private payments and invoice financing on Canton Network.**

[![Hackathon](https://img.shields.io/badge/Hackathon-Build%20on%20Canton-teal)](https://forum.canton.network/t/build-on-canton-hackathon/8635)
[![Track](https://img.shields.io/badge/Tracks-Payments%20%2B%20Private%20DeFi-blue)](#hackathon-tracks)

Cantara is a live financial app for the [Build on Canton Hackathon](https://forum.canton.network/t/build-on-canton-hackathon/8635) (Encode Club). It lets businesses and people **send money privately** and **finance invoices** with selective disclosure — without putting amounts on a public blockchain.

Banks and SMEs need to move money and get paid on invoices, but public chains expose counterparties and terms to everyone. Trade finance is worse: a supplier, buyer, and financier each need to see different data. Cantara runs that on **Canton**, where who sees what is written into the Daml contract.

The product is **deployed on Canton DevNet** (5N Sandbox via Seaport) — not LocalNet and not a mock ledger. The React app on Vercel talks to an Express API on Railway (`LEDGER_MODE=canton`), which submits real create/exercise commands to the JSON Ledger API. We’ve proven **payment create**, **refund**, and a **full invoice lifecycle** (propose → accept → attest → offer → settle) on-ledger.

**Repository:** https://github.com/AshThunder/cantara  
**Pitch video:** https://youtu.be/XAgWhw0iMaY

---

## Live links

| Resource | URL |
|----------|-----|
| **App** | https://cantara-hackathon.vercel.app |
| **API** | https://cantara-api-production.up.railway.app |
| **Health** | https://cantara-api-production.up.railway.app/api/health → `mode: "canton"` |
| **Repo** | https://github.com/AshThunder/cantara |
| **Video** | https://youtu.be/XAgWhw0iMaY |
| **Deck** | [Google Slides — Cantara-Final](https://docs.google.com/presentation/d/1grlqa0Dv2jX9DAKMiLxVaK2QJThOw_-r1N6VaXO84F4/edit?usp=sharing) |

---

## Key achievements

- Dual product on one stack: **private payments** and **invoice financing**, same Canton privacy model
- Live on **5N Sandbox DevNet** — API health returns `mode: "canton"`; package `cantara` v0.1.0 on Seaport
- On-ledger proof: Payment, Payment_Refund, and full invoice workflow
- Payments depth: send, refund, multi-send, payment requests, subscriptions (+ scheduler), checkout, wallet
- Merchant path: Checkout UI + TypeScript **SDK** (`createCheckout` → `/pay/:id` pay link)
- Pitch video with live walkthrough: https://youtu.be/XAgWhw0iMaY

---

## Hackathon tracks

| Module | Track | Description |
|--------|-------|-------------|
| **Payments** | Track 3 — Payments & Neobanking | Send, refund, requests, multi-send, subscriptions, checkout, wallet |
| **Invoices** | Track 1 — Private DeFi & Capital Markets | Propose → accept → attest → offer → settle |

---

## Live on 5N Sandbox DevNet

| Item | Value |
|------|--------|
| Package | `cantara` v0.1.0 |
| Package ID | `b011f10b002d597291b67192a3c6c036a5ea9c7387726718292833d2c3cf3f58` |
| Validator | 5N Sandbox via [Seaport](https://app.devnet.seaport.io/encode-hackathon) |
| Proven on-ledger | Payment · Refund · full invoice lifecycle |
| Frontend | [Vercel](https://cantara-hackathon.vercel.app) |
| Backend | [Railway](https://cantara-api-production.up.railway.app) → JSON Ledger API |

**5N Sandbox DevNet** is the shared Canton DevNet validator for this hackathon (Five North). Our API submits real Daml commands there. LocalNet alone does not qualify.

---

## Features

### Payments
- Private P2P payments (sender / recipient visibility)
- Payment requests with shareable `/pay/:id` links
- Subscriptions + auto-charge scheduler
- Multi-send (batch recipients)
- Refunds
- Wallet balance (opening credit ± payments)

### Merchant checkout + SDK
- In-app **Checkout** page
- TypeScript package [`sdk/`](sdk/) — `createCheckout` → shareable `/pay/:id` link  
  Full guide: [sdk/README.md](sdk/README.md)

### Invoice financing
- Supplier proposes → buyer accepts
- Buyer attests to financier
- Confidential financing offer
- Settlement on maturity

---

## Project structure

```
cantara/
├── daml/           # Daml contracts (payments + invoices)
├── backend/        # Express API → Canton JSON Ledger API
├── frontend/       # React app
├── sdk/            # Merchant SDK (cantara-sdk)
└── docs/           # Pitch, deploy, Seaport guides
```

---

## Quick start (local)

```bash
# Contracts
export PATH="$HOME/.dpm/bin:$PATH"
dpm build   # → .daml/dist/cantara-0.1.0.dar

# API (port 3001)
cd backend && npm install && npm run dev

# UI (port 5173)
cd frontend && npm install && npm run dev
```

Set `LEDGER_MODE=demo` for in-memory, or `canton` with 5N credentials — see [DEPLOY.md](docs/DEPLOY.md). **Never commit `backend/.env`.**

---

## Privacy (simple)

On Canton, only parties named on a contract can see it:

- Payment amounts → sender and recipient
- Financing terms → supplier and financier
- Invoice details → shared step by step in the workflow

---

## Architecture

```
React (Vercel)  →  Express (Railway, LEDGER_MODE=canton)  →  5N Sandbox JSON Ledger API
```

---

## Docs

| Doc | Purpose |
|-----|---------|
| [PITCH.md](docs/PITCH.md) | Spoken pitch (simple words) |
| [sdk/README.md](sdk/README.md) | Merchant SDK — create checkout + pay URL |
| [DEPLOY.md](docs/DEPLOY.md) | Vercel + Railway |
| [CANTON-INTEGRATION.md](docs/CANTON-INTEGRATION.md) | DevNet wiring |
| [SEAPORT-INVOICE-DEMO.md](docs/SEAPORT-INVOICE-DEMO.md) | On-ledger invoice walkthrough |
| [PROGRESS.md](docs/PROGRESS.md) | Build log |

---

## License

MIT
