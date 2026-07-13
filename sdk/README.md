# Cantara Merchant SDK

Accept **private Canton payments** from any Node/TypeScript app — without embedding the Cantara UI.

Creates a **PaymentRequest** on DevNet via the Cantara API and returns a customer **pay URL** (`/pay/:contractId`).

## Install

```bash
cd sdk && npm install && npm run build
# from your app:
npm install /path/to/cantara/sdk
```

## Quick start (live DevNet)

```ts
import { Cantara } from 'cantara-sdk';

const cantara = new Cantara({
  apiUrl: 'https://cantara-api-production.up.railway.app/api',
  merchant: 'Carol',
  payBaseUrl: 'https://cantara-hackathon.vercel.app',
});

const checkout = await cantara.createCheckout({
  amount: 42,
  description: 'Order #1001',
});

console.log(checkout.payUrl);
// → https://cantara-hackathon.vercel.app/pay/<contractId>
// Customer opens that link, connects a party, and pays on Canton.
```

## How it works

1. Your app calls `createCheckout` → API creates a Daml **PaymentRequest** (merchant = requester).
2. SDK returns `payUrl` pointing at the Cantara frontend pay page.
3. Customer opens the link, picks a party (e.g. Alice), pays → ledger **Payment** created.
4. Optional: `listCheckouts()`, `getWallet()`, `fulfillCheckout()` for tests.

```
Your store  →  cantara-sdk  →  Railway API  →  5N Sandbox
                              ↓
                    payUrl → Vercel /pay/:id
```

## API

| Method | Description |
|--------|-------------|
| `createCheckout({ amount, description? })` | Create PaymentRequest + pay URL |
| `listCheckouts()` | Open checkouts for merchant |
| `fulfillCheckout(id, payer, amount)` | Programmatic fulfill (tests) |
| `getWallet()` | Merchant balance |
| `health()` | API health (`mode: canton` on DevNet) |

## Example against production

```bash
cd sdk
npm run build
CANTARA_API_URL=https://cantara-api-production.up.railway.app/api \
CANTARA_PAY_BASE=https://cantara-hackathon.vercel.app \
node examples/checkout.mjs
```

Local API instead: leave env unset (defaults to `http://localhost:3001/api`).
