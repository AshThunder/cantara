import express from 'express';
import cors from 'cors';
import { ledger } from './ledger.js';
import { PARTIES } from './types.js';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', mode: 'demo-ledger', parties: PARTIES.length });
});

app.get('/api/parties', (_req, res) => {
  res.json(PARTIES);
});

// --- Payments ---

app.get('/api/payments', (req, res) => {
  const party = String(req.query.party ?? '');
  if (!party) return res.status(400).json({ error: 'party query required' });
  res.json(ledger.paymentsForParty(party));
});

app.get('/api/payments/stats', (req, res) => {
  const party = String(req.query.party ?? '');
  if (!party) return res.status(400).json({ error: 'party query required' });
  res.json(ledger.statsForParty(party));
});

app.post('/api/payments/send', (req, res) => {
  try {
    const payment = ledger.sendPayment(req.body);
    res.status(201).json(payment);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.post('/api/payments/:contractId/refund', (req, res) => {
  try {
    const payment = ledger.refundPayment(req.params.contractId, req.body.actor);
    res.json(payment);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.get('/api/payment-requests', (req, res) => {
  const party = String(req.query.party ?? '');
  const requests = ledger.paymentRequests.filter(
    (r) => !party || r.requester === party
  );
  res.json(requests);
});

app.post('/api/payment-requests', (req, res) => {
  try {
    const request = ledger.createPaymentRequest(req.body);
    res.status(201).json(request);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.post('/api/payment-requests/:contractId/fulfill', (req, res) => {
  try {
    const payment = ledger.fulfillRequest(
      req.params.contractId,
      req.body.payer,
      req.body.paidAmount
    );
    res.json(payment);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

// --- Invoices ---

app.get('/api/invoices', (req, res) => {
  const party = String(req.query.party ?? '');
  if (!party) return res.status(400).json({ error: 'party query required' });
  res.json({
    invoices: ledger.invoicesForParty(party),
    proposals: ledger.proposalsForParty(party),
  });
});

app.post('/api/invoices', (req, res) => {
  try {
    const proposal = ledger.createInvoiceProposal(req.body);
    res.status(201).json(proposal);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.post('/api/invoices/proposals/:contractId/accept', (req, res) => {
  try {
    const invoice = ledger.acceptInvoiceProposal(req.params.contractId, req.body.buyer);
    res.json(invoice);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.post('/api/invoices/:contractId/attest', (req, res) => {
  try {
    const invoice = ledger.attestInvoice(
      req.params.contractId,
      req.body.buyer,
      req.body.financier
    );
    res.json(invoice);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.post('/api/invoices/:contractId/offer', (req, res) => {
  try {
    const invoice = ledger.submitFinancingOffer(
      req.params.contractId,
      req.body.financier,
      req.body.terms
    );
    res.json(invoice);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.post('/api/invoices/:contractId/settle', (req, res) => {
  try {
    const invoice = ledger.settleInvoice(req.params.contractId, req.body.buyer);
    res.json(invoice);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Cantara API running on http://localhost:${PORT}`);
});
