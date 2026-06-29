# Cantara — Checkpoint 2 Presentation

**Local only** — generate deck with `cd docs && node generate-slides.mjs`  
Output: `docs/Cantara-Checkpoint-2.pptx` (gitignored — upload to Google Slides for submission)

Place screenshots in `docs/presentation-assets/` before generating.

---

## Slide 1 — Title

**Cantara**  
*Private payments & trade finance on Canton*

Build on Canton Hackathon · Encode Club  
Tracks: Payments (T3) + Private DeFi (T1)

AshThunder / Chris Gold  
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
- Institutional validators (5N Sandbox, Global Synchronizer)
- We deployed `cantara-0.1.0.dar` and exercised real choices on-ledger

*Privacy by party membership beats encryption on a transparent chain for B2B finance.*

---

## Slide 4 — Solution

**One platform, two hackathon tracks**

| Payments (T3) | Invoices (T1) |
|---------------|---------------|
| P2P send, refund, requests | Supplier proposes invoice |
| Subscriptions & multi-send | Buyer confirms & attests |
| Private balances per party | Financier offers confidential terms |
| Activity & dashboard | Settlement on maturity |

*Same counterparty graph, same privacy model.*

---

## Slide 5 — Architecture

- React UI — party connect, payments, invoices
- TypeScript REST API → JSON Ledger API (5N Sandbox)
- Daml: 12 templates in `cantara-0.1.0.dar`
- Deployed via Seaport — package `b011f10b…cf3f58`

---

## Slide 6 — Smart contracts

- Payments: Payment, RefundedPayment, Request, Subscription, Batch
- Invoices: full lifecycle (6 templates)
- **Proven on-ledger:** Payment create + Refund ✅

---

## Slide 7 — Screenshot: Dashboard

![Dashboard](presentation-assets/dashboard.png)

*Unified UI — private balance, send/request/invoice, live API stats*

---

## Slide 8 — Screenshot: Activity

![Activity](presentation-assets/activity.png)

*Alice → Bob $100 — Track 3 payments deliverable*

---

## Slide 9 — Screenshot: Payment on-ledger

![Execution log](presentation-assets/execution-log.png)

*Seaport CreatedEvent — PaymentActive, USD 100, 5N Sandbox*

---

## Slide 10 — Screenshot: Refund on-ledger

![Refunded payment](presentation-assets/refunded-payment.png)

*Payment_Refund → RefundedPayment — full lifecycle proven*

---

## Slide 11 — Privacy in action

- Payment: sender signs, recipient observes
- Financing offer: financier + supplier only
- Invoice stages reveal more as workflow progresses

---

## Slide 12 — Roadmap & links

| Phase | Deliverable |
|-------|-------------|
| ✅ Done | Daml, deploy, payment+refund, full UI |
| 🔄 Next | Invoice on Seaport, Loop party allocation |
| Final | JSON Ledger API wiring, demo video |

**github.com/AshThunder/cantara** — Questions welcome
