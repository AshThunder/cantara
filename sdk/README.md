# Cantara Merchant SDK

Accept **private Canton payments** from any Node/TypeScript app — without embedding the Cantara UI.

## Install

```bash
cd sdk && npm install && npm run build
# from your app:
npm install /path/to/cantara/sdk
```

## Quick start

```ts
import { Cantara } from 'cantara-sdk';

const cantara = new Cantara({
  apiUrl: 'http://localhost:3001/api',
  merchant: 'Carol',
  payBaseUrl: 'http://localhost:5173',
});

const checkout = await cantara.createCheckout({
  amount: 42,
  description: 'Order #1001',
});

console.log(checkout.payUrl);
// → http://localhost:5173/pay/<contractId>
// Redirect the customer there to pay privately on Canton.
```

## API

| Method | Description |
|--------|-------------|
| `createCheckout({ amount, description? })` | Create PaymentRequest + pay URL |
| `listCheckouts()` | Open checkouts for merchant |
| `fulfillCheckout(id, payer, amount)` | Programmatic fulfill (tests) |
| `getWallet()` | Merchant neobank balance |
| `health()` | API health |

## Example

```bash
# API must be running on :3001
npm run example
```
