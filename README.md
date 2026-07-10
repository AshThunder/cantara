# Cantara

**Private payments and trade finance on Canton Network.**

[![Hackathon](https://img.shields.io/badge/Hackathon-Build%20on%20Canton-teal)](https://forum.canton.network/t/build-on-canton-hackathon/8635)
[![Track](https://img.shields.io/badge/Tracks-Payments%20%2B%20Private%20DeFi-blue)](#hackathon-tracks)

Cantara is a privacy-first financial platform for the [Build on Canton Hackathon](https://forum.canton.network/t/build-on-canton-hackathon/8635) by Encode Club. It combines confidential P2P payments with private invoice financing — all on institutional-grade Canton infrastructure.

**Repository:** https://github.com/AshThunder/cantara

---

## Hackathon tracks

| Module | Track | Description |
|--------|-------|-------------|
| **Payments** | Track 3 — Payments & Neobanking | P2P send, requests, subscriptions, refunds |
| **Invoices** | Track 1 — Private DeFi & Capital Markets | Multi-party invoice financing |

---

## Live deployment (5N Sandbox)

| Item | Value |
|------|--------|
| Package | `cantara` v0.1.0 |
| Package ID | `b011f10b002d597291b67192a3c6c036a5ea9c7387726718292833d2c3cf3f58` |
| Validator | 5N Sandbox via [Seaport](https://app.devnet.seaport.io/encode-hackathon) |
| Proven on-ledger | `Payment` create ✅ · `Payment_Refund` ✅ |

---

## Features

### Payments
- Private P2P payments (sender/recipient visibility only)
- Payment requests with shareable links
- Subscriptions (recurring payments + auto-charge scheduler)
- Multi-send (batch up to 10 recipients)
- Refunds
- Wallet / neobank balance (opening credit ± payments)

### Merchant SDK
TypeScript package in `sdk/` — `createCheckout`, `getWallet`, pay URLs for external apps.

### Invoice financing
- Supplier submits invoice → buyer confirms
- Buyer attests to financier
- Confidential financing offer (supplier + financier only)
- Settlement on maturity

---

## Project structure

```
cantara/
├── daml/                  # Daml smart contracts
│   └── Cantara/
│       ├── Payments/      # Payment, Request, Subscription, Batch
│       ├── Invoices/      # Invoice financing workflow
│       └── Scripts/       # Demo script
├── backend/               # TypeScript REST API
├── frontend/              # React app (teal & amber theme)
├── sdk/                   # Merchant SDK (cantara-sdk)
└── docs/
    ├── PROGRESS.md        # Development log
    └── PRESENTATION.md    # Slide content (deck generated locally)
```

---

## Quick start

### Daml contracts

```bash
export PATH="$HOME/.dpm/bin:$PATH"
cd cantara
dpm build
# Output: .daml/dist/cantara-0.1.0.dar
```

### Backend

```bash
cd backend
npm install
npm run dev    # http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

**Important:** Run the backend first (see above). The UI needs the API on port 3001 — without it, party connect will fail and pages may appear blank after clicking Get Started.

Open **http://localhost:5173** (not port 3001). Connect as a demo party (Alice, Bob, Carol, Financier). UI proxies `/api` to the backend.

---

## Privacy model

On Canton, privacy comes from **party-based visibility** in Daml:

- Payment amounts → visible only to sender and recipient
- Financing terms → visible only to supplier and financier
- Invoice details → shared selectively per workflow stage

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  React UI   │────▶│  REST API    │────▶│  Canton Ledger  │
│  frontend/  │     │  backend/    │     │  5N Sandbox     │
└─────────────┘     └──────────────┘     └─────────────────┘
                           │                      ▲
                    demo ledger            JSON Ledger API v2
```

---

## API endpoints (demo backend)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/parties` | List demo parties |
| POST | `/api/payments/send` | Send payment |
| GET | `/api/payments?party=` | List payments |
| GET | `/api/invoices?party=` | List invoices |
| POST | `/api/invoices` | Create invoice proposal |
| POST | `/api/invoices/proposals/:id/accept` | Buyer confirms |
| POST | `/api/invoices/:id/attest` | Buyer attests financier |
| POST | `/api/invoices/:id/offer` | Financier submits offer |
| POST | `/api/invoices/:id/settle` | Buyer settles |

---

## Documentation

- [Canton DevNet integration](docs/CANTON-INTEGRATION.md) — wire live API to 5N Sandbox
- [Deploy guide](docs/DEPLOY.md) — Vercel + Railway step-by-step
- [Final submission guide](docs/FINAL-SUBMISSION.md) — checklist, video, DevNet
- [Progress log](docs/PROGRESS.md)
- [Seaport invoice demo](docs/SEAPORT-INVOICE-DEMO.md)
- [Presentation outline](docs/PRESENTATION.md) — run `cd docs && node generate-slides.mjs` to build `.pptx` locally

---

## License

MIT
