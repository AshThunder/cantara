# Seaport — Sync Daml & Invoice On-Ledger Demo

**Goal:** Full invoice financing workflow on **5N Sandbox DevNet** via Seaport.  
**Time:** ~30–45 minutes.

---

## Part 0 — Do you need to redeploy?

Check Seaport → **Packages** (or Contract Factory → Inspect DAR):

| If you see… | Action |
|-------------|--------|
| `cantara` v0.1.0 already listed | **Skip to Part 2** — templates are on-ledger |
| Empty / old `0.0.1` stub only | Do **Part 1** first |

Your package ID (from earlier deploy):  
`b011f10b002d597291b67192a3c6c036a5ea9c7387726718292833d2c3cf3f58`

---

## Part 1 — Sync Seaport workspace

### 1.1 Delete stub files in Seaport

In File Explorer, remove:
- `daml/blankfile`
- Old `daml.yaml` (version `0.0.1`, SDK `3.4.11`)

### 1.2 Copy from local repo

**Option A — Manual:** Recreate this tree in Seaport:

```
cantara/
├── daml.yaml
└── daml/
    └── Cantara/
        ├── Payments/
        │   ├── Payment.daml
        │   ├── PaymentRequest.daml
        │   ├── PaymentBatch.daml
        │   ├── Subscription.daml
        │   └── Types.daml
        ├── Invoices/
        │   ├── Invoice.daml
        │   ├── Financing.daml
        │   └── Types.daml
        └── Scripts/
            └── Demo.daml
```

**Option B — Zip:** Unzip `docs/seaport-daml-sync.zip` locally and upload/copy files into Seaport.

### 1.3 `daml.yaml` must match

```yaml
sdk-version: 3.5.1
name: cantara
version: 0.1.0
source: daml
dependencies:
  - daml-prim
  - daml-stdlib
  - daml-script
start-navigator: false
```

> If `0.1.0` is already deployed and build fails on version conflict, bump to `0.1.1` in both `daml.yaml` and redeploy.

### 1.4 Build & Deploy

1. **Save** all files  
2. **Build Project** — wait for success  
3. **Deploy** — select **5N Sandbox** validator  
4. Confirm package `cantara` appears in Packages list  

---

## Part 2 — Sandbox party (actAs)

Use the authorized operator party (same as Payment demo):

```
5nsandbox-devnet-2::1220a14ca128063b8dc9d1ebb0bd22633be9f2168500f4dbc1ecaeb1855b14e5acf8
```

For a quick demo, use this party as **supplier**, **buyer**, and **financier** (one party plays all roles — fine for hackathon proof).

---

## Part 3 — Invoice workflow (step by step)

Open Seaport → **Contracts** (or Create Contract flow).

### Step 1 — Create `InvoiceProposal`

**Template:** `Cantara.Invoices.Invoice:InvoiceProposal`

| Field | Value |
|-------|--------|
| `supplier` | `5nsandbox-devnet-2::1220a14ca...` |
| `buyer` | `5nsandbox-devnet-2::1220a14ca...` |
| `submittedAt` | `2026-07-09T12:00:00Z` |
| `details` | JSON object below |
| **actAs** | supplier party |

```json
{
  "invoiceId": "inv-001",
  "description": "Office supplies — Cantara demo",
  "amount": "5000.0",
  "currency": "USD",
  "dueDate": "2026-09-08T12:00:00Z"
}
```

**Screenshot:** Execution log + Contracts tab showing active `InvoiceProposal`.

---

### Step 2 — Accept → `Invoice`

**Choice:** `InvoiceProposal_Accept` on the proposal contract  
**Controller:** buyer  
**actAs:** buyer party  

**Result:** New `Invoice` contract (stage: confirmed).

---

### Step 3 — Attest → `AttestedInvoice`

**Choice:** `Invoice_Attest`  
**Field:** `financier` = same sandbox party  
**Controller:** buyer  
**actAs:** buyer  

**Result:** `AttestedInvoice` — financier can now see and bid.

---

### Step 4 — Submit offer → `FinancingOffer`

**Choice:** `AttestedInvoice_SubmitOffer`  
**Controller:** financier  
**actAs:** financier  

| Field | Value |
|-------|--------|
| `offerId` | `offer-001` |
| `validUntil` | `2026-07-23T12:00:00Z` (must be **in the future**) |
| `terms` | JSON below |

```json
{
  "advanceRate": "0.85",
  "discountFee": "0.03",
  "currency": "USD"
}
```

---

### Step 5 — Accept offer → `FinancedInvoice`

**Choice:** `FinancingOffer_Accept`  
**Controller:** supplier  
**actAs:** supplier  

**Result:** `FinancedInvoice` — active financing.

---

### Step 6 — Settle → `SettledInvoice`

**Choice:** `FinancedInvoice_Settle`  
**Controller:** buyer  
**actAs:** buyer  

**Result:** `SettledInvoice` — full lifecycle complete.

---

## Part 4 — Capture proof (for video + deck)

Screenshot each:

- [ ] Packages: `cantara` v0.1.0  
- [ ] `InvoiceProposal` created (execution log)  
- [ ] `Invoice` after Accept  
- [ ] `FinancingOffer` (confidential terms — supplier/financier visibility)  
- [ ] `SettledInvoice` final state  

Save to `docs/presentation-assets/` and regenerate slides:

```bash
cd docs && node generate-slides.mjs
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| **403 Permission denied** | Wrong `actAs` — use `5nsandbox-devnet-2::...` operator party |
| **Package not found** | Deploy DAR first (Part 1) |
| **details must be object** | Use JSON object, not string |
| **assertWithinDeadline failed** | Set `validUntil` / `dueDate` further in the future |
| **Build SDK mismatch** | Set `sdk-version: 3.5.1` in Seaport `daml.yaml` |
| **Choice not visible** | Wrong controller — check `actAs` matches choice controller |

---

## Minimum vs full demo

| Level | Steps | Good for |
|-------|--------|----------|
| **Minimum** | 1–2 (Proposal → Invoice) | Checkpoint-style T1 proof |
| **Recommended** | 1–6 (full settlement) | Final submission video |

---

## After this

Update `docs/PROGRESS.md` and tick Workstream A in `FINAL-SUBMISSION.md`, then move to **Workstream B** (Vercel).
