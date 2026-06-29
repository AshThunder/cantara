# Cantara — Progress Log

**Hackathon:** [Build on Canton](https://forum.canton.network/t/build-on-canton-hackathon/8635) by Encode Club  
**Team repo:** https://github.com/AshThunder/cantara  
**Last updated:** June 29, 2026

---

## Summary

Cantara is a privacy-first financial platform on Canton Network combining **private P2P payments** and **invoice financing** in one product.

| Module | Track | Status |
|--------|-------|--------|
| Payments | Track 3 — Payments & Neobanking | Daml ✅ · Deployed ✅ · Payment + Refund proven ✅ |
| Invoices | Track 1 — Private DeFi & Capital Markets | Daml ✅ · Deployed ✅ · UI ready · On-ledger demo pending |
| Frontend | — | React app with teal/amber theme ✅ |
| Backend | — | Demo REST API ✅ · Sandbox API wiring pending |

---

## Milestones

### Week 1 — Foundation
- [x] Chose product name: **Cantara**
- [x] Defined dual-track scope (Payments + InvoiceVault)
- [x] Built Daml contracts for payments and invoices
- [x] `dpm build` produces `cantara-0.1.0.dar`

### Week 2 — Application & Deployment
- [x] React frontend (Landing, Dashboard, Send, Invoices, Activity)
- [x] TypeScript demo backend with in-memory ledger
- [x] Joined Encode Hackathon org on Seaport
- [x] Deployed DAR to **5N Sandbox** validator
- [x] Created live **Payment** contract on Canton
- [x] Exercised **Payment_Refund** → **RefundedPayment** on-ledger

### In progress
- [ ] Full invoice workflow demo on Seaport
- [ ] Loop Party ID allocation on 5N Sandbox
- [ ] Backend wired to JSON Ledger API
- [ ] Checkpoint 2 submission

### Planned
- [ ] PaymentRequest, Subscription demos on-ledger
- [ ] Merchant SDK
- [ ] Production deploy with real party auth

---

## On-ledger proof (5N Sandbox)

| Item | Value |
|------|--------|
| Package name | `cantara` |
| Package version | `0.1.0` |
| Package ID | `b011f10b002d597291b67192a3c6c036a5ea9c7387726718292833d2c3cf3f58` |
| Validator | 5N Sandbox (`devnet.sandbox.fivenorth.io`) |
| Template tested | `Cantara.Payments.Payment:Payment` |
| Refund tested | `Payment_Refund` → `RefundedPayment` |
| Ledger offset (example) | `3675051` |

---

## Daml modules

```
Cantara.Payments
  ├── Payment          — P2P payment + refund
  ├── PaymentRequest   — Request money + proposals
  ├── Subscription     — Recurring payments
  └── PaymentBatch     — Multi-send (up to 10)

Cantara.Invoices
  ├── InvoiceProposal  — Supplier submits invoice
  ├── Invoice          — Buyer confirms
  ├── AttestedInvoice  — Buyer attests to financier
  ├── FinancingOffer   — Confidential financing terms
  ├── FinancedInvoice  — Active financing
  └── SettledInvoice   — Settlement record
```

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   React UI  │────▶│  REST API    │────▶│  Canton Ledger  │
│  (frontend) │     │  (backend)   │     │  5N Sandbox     │
└─────────────┘     └──────────────┘     └─────────────────┘
                           │                      ▲
                           │ demo mode            │ production
                           ▼                      │
                    In-memory ledger        JSON Ledger API v2
```

---

## Privacy model

Canton uses **party-based visibility** — not public-chain transparency or FHE:

- Payment amounts: visible to **sender** and **recipient** only
- Financing terms: visible to **supplier** and **financier** only
- Invoice details: shared selectively per workflow stage

---

## Known blockers

| Issue | Workaround | Fix |
|-------|------------|-----|
| Loop Party ID not on 5N Sandbox | Use `5nsandbox-devnet-2::1220...` operator party | Request allocation from Canton Foundation (Discord) |
| Backend uses demo ledger | Seaport for on-ledger proofs | Wire JSON Ledger API with PDF credentials |

---

## Links

- Seaport: https://app.devnet.seaport.io/encode-hackathon
- Seaport Guide: https://github.com/Jatinp26/Seaport-Guide
- Canton Docs: https://docs.canton.network
