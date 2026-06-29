# Cantara — Checkpoint 2 Presentation

Copy each slide into Google Slides / Canva / Pitch. ~10 slides, 3–5 min pitch.

---

## Slide 1 — Title

**Cantara**  
*Private payments & trade finance on Canton*

Build on Canton Hackathon · Encode Club  
Track 3: Payments · Track 1: Private DeFi

AshThunder / Chris Gold  
https://github.com/AshThunder/cantara

---

## Slide 2 — Problem

**Institutional finance needs privacy, not publicity**

- Public blockchains expose every payment and balance
- Trade finance involves 3+ parties with different visibility needs
- SMEs wait 30–90 days for invoice payment with no shared source of truth

*Payments and receivables should be private by default.*

---

## Slide 3 — Solution

**Cantara — one platform, two modules**

| Payments | Invoices |
|----------|----------|
| P2P send & refund | Supplier issues invoice |
| Payment requests | Buyer confirms |
| Subscriptions | Financier bids confidentially |
| Multi-send | Settlement on maturity |

Built on **Canton Network** with **Daml** smart contracts.

---

## Slide 4 — Why Canton?

**Party-based privacy — built into the ledger**

- Only signatories & observers see contract data
- Multi-party workflows native to Daml
- Institutional-grade infrastructure (5N Sandbox, Global Synchronizer)

Unlike Ethereum: privacy by **who is on the contract**, not encryption on a public chain.

---

## Slide 5 — Architecture

```
React UI  →  REST API  →  Canton JSON Ledger API  →  5N Sandbox
                ↓
         Daml contracts (cantara-0.1.0.dar)
```

- **Frontend:** React + teal theme, party connect
- **Backend:** TypeScript API (demo + production path)
- **Contracts:** Daml templates for payments & invoices

---

## Slide 6 — What's built

**Smart contracts (Daml)**
- Payment, Refund, PaymentRequest, Subscription, PaymentBatch
- Full invoice financing lifecycle (6 templates)

**Application**
- Dashboard, Send, Invoices, Activity pages
- Demo backend with REST API

**Deployed & tested on 5N Sandbox**
- Package `cantara` v0.1.0 live on validator
- Payment created + refunded on-ledger ✅

---

## Slide 7 — Live demo proof

**On-ledger transactions (Seaport / 5N Sandbox)**

| Action | Template | Status |
|--------|----------|--------|
| Create payment | `Payment` | ✅ Done |
| Refund payment | `Payment_Refund` | ✅ Done |
| Invoice workflow | `InvoiceProposal` → `SettledInvoice` | In progress |

Package ID: `b011f10b...cf3f58`

*Screenshots + Seaport Contracts tab available*

---

## Slide 8 — Privacy in action

**Payment contract**
- Signatory: sender
- Observer: recipient
- Amount visible only to both parties

**Financing offer**
- Signatory: financier
- Observer: supplier
- Terms hidden from buyer until settlement

*Selective visibility per workflow stage.*

---

## Slide 9 — Roadmap

| Phase | Deliverable |
|-------|-------------|
| ✅ Now | Daml contracts, deploy, payment demo |
| 🔄 This week | Invoice on-ledger demo, checkpoint submission |
| Next | Backend → JSON Ledger API, Loop party allocation |
| Final | Full UI ↔ Canton integration, hackathon demo video |

---

## Slide 10 — Ask & links

**Cantara** — private finance that flows on Canton

- GitHub: https://github.com/AshThunder/cantara
- Deployed on 5N Sandbox via Seaport
- Tracks: Payments (T3) + Private DeFi (T1)

**Thank you** — questions welcome
