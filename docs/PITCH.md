# Cantara — Pitch

**Video:** `docs/Cantara-Pitch-3min.mp4` (silent, 3:00 — speak over this)  
**App:** https://cantara-hackathon.vercel.app  
**Repo:** https://github.com/AshThunder/cantara  
**Tracks:** T3 Payments · T1 Private DeFi

Replace `[Name]` with your name. Speak slowly. Pause when the payment sends and when you switch to Bob.

---

## Full spoken pitch (~3:00)

### Deck — 0:00–1:12

Hi — I’m **[Name]**. This is **Cantara**.

Banks and small businesses need to send money and get paid on invoices. They can’t put that data on a public blockchain — everyone would see the amounts.

Trade finance is even harder. A seller, a buyer, and a bank each need to see different things. Today that’s slow and messy.

**Cantara** fixes that. Private payments and private invoice financing — on **Canton**.

We use Canton because privacy is built in. Only the people on a deal can see it. Who sees what is written into the contract.

We’re entering **two tracks**: **Payments**, and **Private DeFi**. One app for both.

It’s live right now. The website is on Vercel. The API is on Railway. It talks to the real Canton DevNet — the **5N Sandbox**.

We’ve already done real ledger work: create a payment, refund a payment, and run a full invoice from start to finish.

Now I’ll show the live app — and that the other person actually gets the money.

### Live · Alice — 1:12–~1:45

This is **cantara-hackathon.vercel.app**. It’s on DevNet.

I log in as **Alice**. Here’s her dashboard and balance.

I **send money to Bob**… type the amount… add a note… send.

**Payment sent.** These links open the real transaction on **5N**. This is not a fake demo.

Alice’s activity shows money going out.

### Switch + Bob — ~1:45–~2:33

Now I log out… and log in as **Bob**.

Same app. Different person. Bob’s activity shows the payment **coming in from Alice**.

So it works end to end.

Bob can also do multi-send, payment requests, subscriptions, checkout, invoices, and a wallet. That’s our **Payments** track — and invoices for **Private DeFi**.

For invoices: the seller creates one, the buyer accepts, a bank can make a private offer, then they settle. Each step only shows what that person needs to see.

### Close — ~2:33–3:00

Again: website → API → Canton DevNet. The health check says we’re on Canton.

Try it: **cantara-hackathon.vercel.app**. Code: **github.com/AshThunder/cantara**.

**Cantara** — private payments and invoice financing on Canton. Tracks **T3** and **T1**.

Thanks.

---

## Encode form — short description

```
Cantara is private payments and invoice financing on Canton DevNet. Only the people in a deal can see the amounts. Live app on Vercel, API on Railway, real ledger on 5N Sandbox. Tracks: T3 Payments + T1 Private DeFi.
```

**Shorter:**

```
Private payments + invoice financing on Canton DevNet. Live app. Tracks T3 + T1.
```

---

## 30-second backup

Cantara is private payments and invoice financing on Canton. Only deal parties see the data. We’re live on DevNet — send, refund, and full invoices. App: cantara-hackathon.vercel.app. Tracks T3 and T1.

---

## Q&A (simple answers)

| Question | Say this |
|----------|----------|
| How does privacy work? | Only people named on the contract can see it. Canton builds that in. |
| Is it on DevNet? | Yes. Our API says mode canton. Links go to the real 5N explorer. Not just localhost. |
| Why Alice and Bob share one party? | Hackathon sandbox limit. One login can act for demos. Real separate parties are next. Be honest — don’t oversell. |
| What’s real vs just UI? | Payments, refunds, subscriptions, and invoices hit the real ledger. The wallet balance is calculated from those payments. |
| Why not Ethereum / public chain? | Banks won’t put payment amounts where the whole world can see them. |
| Tracks? | **T3 Payments** and **T1 Private DeFi**. |

---

## Recording checklist

- [ ] Play `Cantara-Pitch-3min.mp4`, record your voice  
- [ ] Say **T3** and **T1** out loud  
- [ ] Upload YouTube (unlisted) or Loom → Encode form  
