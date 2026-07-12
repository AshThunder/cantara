# Cantara — Pitch Script & Talking Points

**Use for:** 3‑minute video · Encode form short description · Q&A  
**Live app:** https://cantara-hackathon.vercel.app  
**Repo:** https://github.com/AshThunder/cantara  
**Tracks:** T3 Payments · T1 Private DeFi

---

## Areas you must cover

| # | Area | One-liner judges need to hear |
|---|------|-------------------------------|
| 1 | **Problem** | Public chains leak payment & invoice data; institutions can’t use them |
| 2 | **Why Canton** | Party-based privacy in Daml — who sees what is in the contract |
| 3 | **Product** | One app: private payments + invoice financing |
| 4 | **Track 3** | Send, refund, requests, subscriptions, multi-send, checkout, wallet |
| 5 | **Track 1** | Invoice: propose → accept → attest → offer → settle |
| 6 | **Privacy model** | Selective disclosure by party membership in Daml |
| 7 | **DevNet proof** | Live on 5N Sandbox; `mode: canton`; Lighthouse tx/contract links |
| 8 | **Architecture** | Vercel UI → Railway API → Canton JSON Ledger API |
| 9 | **Live demo** | Show the product working, not slides only |
| 10 | **Links / ask** | App + GitHub + tracks T1+T3 |

---

## Spoken script (~3:00)

### 0:00–0:25 — Hook / problem

> Hi — I’m [Name], and this is **Cantara**.
>
> Banks and SMEs need to move money and finance invoices — but they can’t put amounts and terms on a public blockchain. Trade finance also involves three or more parties, each of whom should see different data. Today that’s slow, fragmented, and full of intermediaries.
>
> **Cantara** is private payments and private invoice financing on **Canton Network**.

### 0:25–0:45 — Why Canton + what we built

> We chose Canton because privacy is built into Daml: **signatories and observers** decide who sees a payment amount or a financing offer.
>
> We’re submitting to **two tracks**: **Payments** and **Private DeFi**. Same privacy model, one product.

### 0:45–1:30 — Live demo: payments (Track 3)

*[Screen: open https://cantara-hackathon.vercel.app]*

> Here’s the live app on DevNet.
>
> I connect as **Alice**… open the **dashboard**… you see a private balance — party-visible on Canton.
>
> I **send** a payment to Bob… amount and note… confirm.
>
> Payment settles on the ledger. In **Activity** you get **Lighthouse** links to the transaction and contract on 5N — this isn’t a mock API.

*[Optional 10s: flash Multi-Send or Checkout if time]*

> We also support **multi-send**, **subscriptions**, **merchant checkout**, and a small **merchant SDK**.

### 1:30–2:15 — Invoices (Track 1) + privacy

*[Screen: Invoices UI, or skip UI and explain flow clearly]*

> For **trade finance**: a **supplier** proposes an invoice, the **buyer** accepts and can attest to a **financier**, the financier makes a **confidential offer** — only supplier and financier see the terms — then the buyer **settles**.
>
> That’s selective disclosure through the workflow: each stage reveals only what that party needs.

### 2:15–2:45 — Architecture / DevNet

> Architecture is simple: **React on Vercel**, **Express API on Railway** with `LEDGER_MODE=canton`, talking to the **5N Sandbox JSON Ledger API**. Package **cantara 0.1.0** is deployed via Seaport. We’ve proven **payment create**, **refund**, and the **full invoice lifecycle** on-ledger.

### 2:45–3:00 — Close

> Try it at **cantara-hackathon.vercel.app**. Code at **github.com/AshThunder/cantara**. Tracks **T3 Payments** and **T1 Private DeFi**.
>
> Thanks — happy to take questions.

---

## Demo click path (record this)

1. Landing → wait for **Get Started** (API cold start can take a few seconds)  
2. **Get Started** (Alice) → **Go to Dashboard**  
3. Show balance (**Hide** / reveal if needed)  
4. **Send** → Bob → small amount → note “Demo payment” → **Send Payment** → success + Lighthouse links  
5. **Activity** (optional)  
6. **Invoices** (optional — even opening the page helps)  
7. End on landing or GitHub in browser tab  

**Tip:** Warm the API first: open `/api/health` so Get Started isn’t stuck on Loading during the take.

---

## Encode form — short description (paste)

```
Cantara is private P2P payments and multi-party invoice financing on Canton Network (5N Sandbox DevNet). Party-based Daml privacy — amounts and financing terms visible only to contract parties. Live app: Vercel UI + Railway API (LEDGER_MODE=canton) exercising Payment, Refund, and full invoice lifecycle on-ledger. Tracks: T3 Payments + T1 Private DeFi.
```

**Even shorter (if character-limited):**

```
Private payments + invoice financing on Canton DevNet. Live Vercel app, Railway API → 5N ledger. Tracks T3 + T1.
```

---

## 30‑second backup (if cut short)

> Cantara brings private payments and invoice financing to Canton. Privacy is party-based in Daml — amounts visible only to contract parties. We’re live on 5N DevNet: send payments, refunds, and a full supplier–buyer–financier invoice flow. App: cantara-hackathon.vercel.app. Tracks T3 and T1.

---

## Q&A cheat sheet

| Question | Answer |
|----------|--------|
| How does privacy work? | **Canton party visibility** in Daml. Only parties on the contract see the payload. |
| Is it really on DevNet? | Yes — Railway health returns `mode: "canton"`; UI links to **5N Lighthouse**. |
| Why one operator party for Alice/Bob? | Sandbox shared operator for the hackathon; UI labels parties; real multi-party Loop allocation is next. |
| What’s on-ledger vs demo? | Payments, refunds, invoices go through the **JSON Ledger API**. Wallet balance is **derived** (opening ± payments), not a separate Wallet Daml template. |
| What’s the SDK? | TypeScript `cantara-sdk` for merchants: checkout create + pay URLs. |
| Package ID? | `b011f10b002d597291b67192a3c6c036a5ea9c7387726718292833d2c3cf3f58` |

---

## Recording checklist

- [ ] Warm API (`/api/health`) before recording  
- [ ] 1080p, clear mic, ~3:00  
- [ ] Show **live URL** in the browser bar  
- [ ] Say **tracks T1 + T3** out loud  
- [ ] End with app + GitHub  
- [ ] Upload YouTube (unlisted) or Loom → paste into README + Encode  
