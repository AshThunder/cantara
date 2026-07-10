# Canton DevNet Integration

Cantara's backend can run against the **real 5N Sandbox ledger** via the JSON Ledger API.

## Architecture

```
Vercel (React)  →  Railway (Express)  →  JSON Ledger API  →  5N Sandbox DevNet
                         ↑
                  cantara-0.1.0.dar (same contracts as Seaport)
```

When `LEDGER_MODE=canton` and credentials are set, every UI action (send payment, invoice workflow) **submits real commands** to Canton — the same templates you exercised in Seaport.

## Setup

### 1. Copy env file

```bash
cd cantara/backend
cp .env.example .env
```

### 2. Fill credentials (from Seaport Sandbox Validator Access PDF)

| Variable | Source |
|----------|--------|
| `CANTON_CLIENT_SECRET` | PDF — never commit |
| `CANTON_OPERATOR_PARTY` | `5nsandbox-devnet-2::1220...` |
| `CANTON_PACKAGE_ID` | `b011f10b...cf3f58` |

Auth request must include `scope=daml_ledger_api` (handled in `canton/auth.ts`).

ACS queries use package-name IDs (`#cantara:Module:Template`); create/exercise use package-id.

### 3. Party mapping

The UI uses **Alice, Bob, Carol, Financier**. The backend maps these to Canton party IDs:

- By default, all map to `CANTON_OPERATOR_PARTY` (works for single-party sandbox)
- For distinct parties, set `CANTON_PARTY_ALICE`, `CANTON_PARTY_BOB`, etc. after Loop party allocation

### 4. Run locally

```bash
cd backend && npm run dev
# Health: curl http://localhost:3001/api/health
# → {"status":"ok","mode":"canton","ledger":"5n-sandbox-devnet",...}
```

### 5. Deploy to Railway

Add the same env vars in Railway dashboard. Set `FRONTEND_URL` to your Vercel URL.

Set `VITE_API_URL` on Vercel to `https://your-api.railway.app/api`.

## Demo fallback

Set `LEDGER_MODE=demo` to use in-memory ledger (no Canton credentials needed).

## What's integrated

| Feature | Canton mode |
|---------|-------------|
| Send payment | ✅ Create `Payment` on-ledger |
| Refund | ✅ `Payment_Refund` |
| List payments / activity | ✅ Query active contracts |
| Invoice proposal → settle | ✅ Full Daml workflow |
| Payment requests | ❌ Not yet |

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Canton auth failed` | Check client secret, token URL |
| `403 Permission denied` | Wrong `actAs` party — use operator party |
| `Cannot pay yourself` | Alice and Bob map to same Canton party — allocate distinct parties |
| Empty activity list | ACS query may need a moment after create — refresh |

## Confirming transactions (5N Lighthouse)

Explorer: https://lighthouse.devnet.cantonloop.com

| Link type | URL |
|-----------|-----|
| Contract | `https://lighthouse.devnet.cantonloop.com/contracts/{contractId}` |
| Transaction | `https://lighthouse.devnet.cantonloop.com/transactions/{updateId}` |

The UI shows truncated **Tx** (`updateId`) and **Contract** IDs with links to Lighthouse after each payment.

> Note: Canton privacy means some private contracts may not appear publicly on Lighthouse. Seaport Contracts tab always shows your ACS. Lighthouse links are still useful for DevNet visibility and demos.
