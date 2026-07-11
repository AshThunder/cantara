# Cantara — Final Presentation

**Generate deck:** `cd docs && node generate-slides.mjs`  
**Output:** `docs/Cantara-Final.pptx` (gitignored — upload to Google Slides for Encode)

Screenshots live in `docs/presentation-assets/` (landing, dashboard, activity + Seaport proofs).

---

## Slide 1 — Title

**Cantara**  
*Private payments & trade finance on Canton*

Build on Canton Hackathon · Encode Club  
Tracks: Payments (T3) + Private DeFi (T1)

Live: https://cantara-hackathon.vercel.app  
https://github.com/AshThunder/cantara

---

## Slide 2 — Problem

**The gap: public chains vs. institutional reality**

- Banks and SMEs cannot put payment flows and invoice terms on a public ledger
- Trade finance needs 3+ parties — each with different visibility requirements
- Fragmented tools, 30–90 day delays, no shared private source of truth
- Costly intermediaries, leaked competitive terms, trapped working capital

*Cantara targets the overlap: everyday payments + receivables financing — both need privacy.*

---

## Slide 3 — Why Canton

**Privacy is a first-class primitive**

- Daml defines who sees what: signatories, observers, controllers
- Multi-party workflows are native — not bolted on
- Institutional validators (5N Sandbox DevNet via Seaport)
- Deployed `cantara-0.1.0.dar` and exercise real choices on-ledger — live today

---

## Slide 4 — Solution

**One platform, two hackathon tracks**

| Payments (T3) | Invoices (T1) |
|---------------|---------------|
| P2P send, refund, requests | Supplier proposes invoice |
| Subscriptions & multi-send | Buyer confirms & attests |
| Merchant checkout + SDK | Financier offers confidential terms |
| Wallet & activity | Settlement on maturity |

---

## Slide 5 — Architecture

- React UI on Vercel — live app
- Express API on Railway — `LEDGER_MODE=canton` → JSON Ledger API v2
- Daml: 12 templates in `cantara-0.1.0.dar` on 5N Sandbox
- Package ID `b011f10b…cf3f58`

---

## Slide 6 — Smart contracts

- Payments: Payment, RefundedPayment, Request, Subscription, Batch
- Invoices: full lifecycle (propose → settle)
- Proven on-ledger via live API + Seaport
- Merchant SDK (`cantara-sdk`)

---

## Slides 7–11 — Screenshots

- Landing (live Vercel)
- Dashboard (private balance, quick actions)
- Activity (payments + contract links)
- Seaport Payment CreatedEvent
- Seaport Payment_Refund → RefundedPayment

---

## Slide 12 — Privacy

Selective disclosure by party membership on Canton.

---

## Slide 13 — Links

| Resource | URL |
|----------|-----|
| App | https://cantara-hackathon.vercel.app |
| API | https://cantara-api-production.up.railway.app/api/health |
| Repo | https://github.com/AshThunder/cantara |
| DevNet | cantara v0.1.0 on 5N Sandbox |

---

## Upload to Google Slides

1. Open [Google Slides](https://slides.google.com) → Blank presentation  
2. File → Import slides → Upload `Cantara-Final.pptx`  
3. Share → Anyone with the link  
4. Paste URL into README + Encode form  
