# Deploy Cantara — Vercel (frontend) + Railway (API → Canton DevNet)

**Live (production):**

| | URL |
|--|-----|
| Frontend | https://cantara-hackathon.vercel.app |
| API | https://cantara-api-production.up.railway.app |
| Health | https://cantara-api-production.up.railway.app/api/health |

**Architecture:**

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Vercel         │     │  Railway         │     │  5N Sandbox DevNet  │
│  React frontend │────▶│  Express API     │────▶│  JSON Ledger API v2 │
│                 │     │  LEDGER_MODE=    │     │  cantara 0.1.0      │
│                 │     │  canton          │     │                     │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
```

---

## Part 1 — Push code

Deploy reads from GitHub `AshThunder/cantara`. Commit and push `main` first (never commit `backend/.env`).

---

## Part 2 — Railway (API)

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** → `AshThunder/cantara`
2. **Root Directory:** `backend`
3. **Build:** `npm install && npm run build` (see `backend/railway.toml`)
4. **Start:** `npm start`
5. **Networking → Generate Domain**

### Environment variables (required for Canton)

| Key | Value |
|-----|--------|
| `LEDGER_MODE` | `canton` |
| `CANTON_LEDGER_URL` | `https://ledger-api.validator.devnet.sandbox.fivenorth.io` |
| `CANTON_AUTH_URL` | `https://auth.sandbox.fivenorth.io/application/o/token/` |
| `CANTON_CLIENT_ID` | `validator-devnet-m2m` |
| `CANTON_CLIENT_SECRET` | *(from 5N PDF — never commit)* |
| `CANTON_PACKAGE_ID` | `b011f10b002d597291b67192a3c6c036a5ea9c7387726718292833d2c3cf3f58` |
| `CANTON_OPERATOR_PARTY` | `5nsandbox-devnet-2::1220a14ca128063b8dc9d1ebb0bd22633be9f2168500f4dbc1ecaeb1855b14e5acf8` |
| `FRONTEND_URL` / `FRONTEND_URLS` | `https://cantara-hackathon.vercel.app` (comma-separated if multiple) |
| `SUBSCRIPTION_SCHEDULER` | `true` |
| `WALLET_OPENING_BALANCE` | `10000` |

`PORT` is set by Railway automatically.

### Verify API

```bash
curl https://cantara-api-production.up.railway.app/api/health
```

Expect: `"status":"ok","mode":"canton"`.

---

## Part 3 — Vercel (frontend)

1. [vercel.com](https://vercel.com) → Import `AshThunder/cantara`
2. Settings:

| Setting | Value |
|---------|--------|
| **Root Directory** | `frontend` |
| **Framework** | Vite |
| **Build** | `npm run build` |
| **Output** | `dist` |

3. **Env:**

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://cantara-api-production.up.railway.app/api` |

Include `/api`. No trailing slash after `api`.

4. Deploy → copy URL → set `FRONTEND_URL` / `FRONTEND_URLS` on Railway → redeploy API.

Vite bakes env at **build** time — change `VITE_API_URL` ⇒ **Redeploy**.

---

## Part 4 — Verify live

- [x] Landing loads (no amber “backend not reachable” banner)
- [x] Connect Party → Dashboard
- [x] Send payment → Activity + Lighthouse link
- [x] Wallet balance updates
- [x] Checkout → `/pay/:id`
- [x] Invoice propose / accept / settle (API smoke)

---

## CLI alternative

```bash
# Railway
npm i -g @railway/cli
cd backend && railway login && railway init
railway variables set LEDGER_MODE=canton # ...other vars
railway up
railway domain

# Vercel
npm i -g vercel
cd frontend && vercel login
vercel --prod -e VITE_API_URL=https://YOUR-API.up.railway.app/api
```

---

## Troubleshooting

| Issue | Fix |
|-------|------|
| CORS | `FRONTEND_URL` = exact Vercel origin |
| `mode: demo` | Missing `CANTON_CLIENT_SECRET` or `LEDGER_MODE` |
| Blank after Get Started | Wrong `VITE_API_URL` or API down |
| Auth 401 from Canton | Check client secret / token scope `daml_ledger_api` |
