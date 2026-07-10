import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createLedger } from './ledger-service.js';
import { PARTIES } from './types.js';
import { computeWallet } from './wallet.js';
import { SubscriptionScheduler } from './subscription-scheduler.js';

const { mode, demo, canton } = createLedger();
const scheduler = canton ? new SubscriptionScheduler(canton) : null;

const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const FRONTEND_URL = process.env.FRONTEND_URL;
const FRONTEND_URLS = (process.env.FRONTEND_URLS ?? FRONTEND_URL ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: FRONTEND_URLS.length
      ? [...FRONTEND_URLS, 'http://localhost:5173', 'http://localhost:5174']
      : true,
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mode,
    ledger: mode === 'canton' ? '5n-sandbox-devnet' : 'demo-ledger',
    parties: PARTIES.length,
    scheduler: scheduler?.status() ?? { enabled: false },
  });
});

// --- Wallet / neobank balance ---

app.get('/api/wallet', async (req, res) => {
  try {
    const party = String(req.query.party ?? '');
    if (!party) return res.status(400).json({ error: 'party query required' });
    const currency = String(req.query.currency ?? 'USD');
    const payments = canton
      ? await canton.paymentsForParty(party)
      : demo!.paymentsForParty(party);
    res.json(computeWallet(party, payments, currency));
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.get('/api/parties', (_req, res) => {
  if (canton) {
    res.json(
      PARTIES.map((p) => ({
        ...p,
        cantonPartyId: canton.resolveUiParty(p.id),
      }))
    );
    return;
  }
  res.json(PARTIES);
});

// --- Payments ---

app.get('/api/payments', async (req, res) => {
  try {
    const party = String(req.query.party ?? '');
    if (!party) return res.status(400).json({ error: 'party query required' });
    const payments = canton
      ? await canton.paymentsForParty(party)
      : demo!.paymentsForParty(party);
    res.json(payments);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.get('/api/payments/stats', async (req, res) => {
  try {
    const party = String(req.query.party ?? '');
    if (!party) return res.status(400).json({ error: 'party query required' });
    const stats = canton
      ? await canton.statsForParty(party)
      : demo!.statsForParty(party);
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.post('/api/payments/send', async (req, res) => {
  try {
    const payment = canton
      ? await canton.sendPayment(req.body)
      : demo!.sendPayment(req.body);
    res.status(201).json(payment);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.post('/api/payments/:contractId/refund', async (req, res) => {
  try {
    const payment = canton
      ? await canton.refundPayment(req.params.contractId, req.body.actor)
      : demo!.refundPayment(req.params.contractId, req.body.actor);
    res.json(payment);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.get('/api/payment-requests', async (req, res) => {
  try {
    const party = String(req.query.party ?? '');
    if (canton) {
      if (!party) return res.status(400).json({ error: 'party query required' });
      return res.json(await canton.paymentRequestsForParty(party));
    }
    const requests = demo!.paymentRequests.filter(
      (r: { requester: string }) => !party || r.requester === party
    );
    res.json(requests);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.post('/api/payment-requests', async (req, res) => {
  try {
    const request = canton
      ? await canton.createPaymentRequest(req.body)
      : demo!.createPaymentRequest(req.body);
    res.status(201).json(request);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.post('/api/payment-requests/:contractId/fulfill', async (req, res) => {
  try {
    const payment = canton
      ? await canton.fulfillPaymentRequest(
          req.params.contractId,
          req.body.payer,
          req.body.paidAmount
        )
      : demo!.fulfillRequest(
          req.params.contractId,
          req.body.payer,
          req.body.paidAmount
        );
    res.json(payment);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

// --- Subscriptions ---

app.get('/api/subscriptions', async (req, res) => {
  try {
    const party = String(req.query.party ?? '');
    if (!party) return res.status(400).json({ error: 'party query required' });
    if (!canton) return res.status(501).json({ error: 'Subscriptions require Canton mode' });
    res.json(await canton.subscriptionsForParty(party));
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.post('/api/subscriptions', async (req, res) => {
  try {
    if (!canton) return res.status(501).json({ error: 'Subscriptions require Canton mode' });
    const sub = await canton.createSubscription(req.body);
    res.status(201).json(sub);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.post('/api/subscriptions/:contractId/execute', async (req, res) => {
  try {
    if (!canton) return res.status(501).json({ error: 'Subscriptions require Canton mode' });
    const payment = await canton.executeSubscription(req.params.contractId, req.body.subscriber);
    res.json(payment);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.post('/api/subscriptions/:contractId/cancel', async (req, res) => {
  try {
    if (!canton) return res.status(501).json({ error: 'Subscriptions require Canton mode' });
    await canton.cancelSubscription(req.params.contractId, req.body.subscriber);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.get('/api/subscriptions/scheduler', (_req, res) => {
  if (!scheduler) return res.status(501).json({ error: 'Scheduler requires Canton mode' });
  res.json(scheduler.status());
});

app.post('/api/subscriptions/scheduler/run', async (_req, res) => {
  try {
    if (!scheduler) return res.status(501).json({ error: 'Scheduler requires Canton mode' });
    const result = await scheduler.runOnce();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

// --- Multi-send ---

app.post('/api/payments/multi-send', async (req, res) => {
  try {
    if (!canton) return res.status(501).json({ error: 'Multi-send requires Canton mode' });
    const result = await canton.multiSend(req.body);
    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

// --- Invoices ---

app.get('/api/invoices', async (req, res) => {
  try {
    const party = String(req.query.party ?? '');
    if (!party) return res.status(400).json({ error: 'party query required' });
    if (canton) {
      const [invoices, proposals] = await Promise.all([
        canton.invoicesForParty(party),
        canton.proposalsForParty(party),
      ]);
      return res.json({ invoices, proposals });
    }
    res.json({
      invoices: demo!.invoicesForParty(party),
      proposals: demo!.proposalsForParty(party),
    });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const proposal = canton
      ? await canton.createInvoiceProposal(req.body)
      : demo!.createInvoiceProposal(req.body);
    res.status(201).json(proposal);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.post('/api/invoices/proposals/:contractId/accept', async (req, res) => {
  try {
    const invoice = canton
      ? await canton.acceptInvoiceProposal(req.params.contractId, req.body.buyer)
      : demo!.acceptInvoiceProposal(req.params.contractId, req.body.buyer);
    res.json(invoice);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.post('/api/invoices/:contractId/attest', async (req, res) => {
  try {
    const invoice = canton
      ? await canton.attestInvoice(req.params.contractId, req.body.buyer, req.body.financier)
      : demo!.attestInvoice(req.params.contractId, req.body.buyer, req.body.financier);
    res.json(invoice);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.post('/api/invoices/:contractId/offer', async (req, res) => {
  try {
    const invoice = canton
      ? await canton.submitFinancingOffer(req.params.contractId, req.body.financier, req.body.terms)
      : demo!.submitFinancingOffer(req.params.contractId, req.body.financier, req.body.terms);
    res.json(invoice);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.post('/api/invoices/:contractId/settle', async (req, res) => {
  try {
    const invoice = canton
      ? await canton.settleInvoice(req.params.contractId, req.body.buyer)
      : demo!.settleInvoice(req.params.contractId, req.body.buyer);
    res.json(invoice);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Cantara API (${mode}) on port ${PORT}`);
  scheduler?.start();
});
