import { v4 as uuid } from 'uuid';
import type { Invoice, InvoiceProposal, Payment, PaymentRequest } from './types.js';
import { PARTIES } from './types.js';

export class Ledger {
  payments: Payment[] = [];
  paymentRequests: PaymentRequest[] = [];
  invoiceProposals: InvoiceProposal[] = [];
  invoices: Invoice[] = [];

  constructor() {
    this.seedDemo();
  }

  private seedDemo() {
    const now = new Date().toISOString();
    const due = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

    this.payments.push({
      contractId: uuid(),
      sender: 'Alice',
      recipient: 'Bob',
      paymentId: 'pay-demo-001',
      amount: 100,
      currency: 'USD',
      description: 'Lunch',
      status: 'active',
      createdAt: now,
    });

    this.invoices.push({
      contractId: uuid(),
      supplier: 'Alice',
      buyer: 'Bob',
      invoiceId: 'inv-001',
      description: 'Office supplies',
      amount: 5000,
      currency: 'USD',
      dueDate: due,
      confirmedAt: now,
      stage: 'financed',
      financier: 'Financier',
      financingTerms: { advanceRate: 0.85, discountFee: 0.03, currency: 'USD' },
      offerId: 'offer-001',
      financedAt: now,
    });
  }

  getParty(id: string) {
    return PARTIES.find((p) => p.id === id);
  }

  sendPayment(input: {
    sender: string;
    recipient: string;
    amount: number;
    currency: string;
    description: string;
  }): Payment {
    if (!this.getParty(input.sender) || !this.getParty(input.recipient)) {
      throw new Error('Unknown party');
    }
    if (input.sender === input.recipient) throw new Error('Cannot pay yourself');
    if (input.amount <= 0) throw new Error('Amount must be positive');

    const payment: Payment = {
      contractId: uuid(),
      sender: input.sender,
      recipient: input.recipient,
      paymentId: `pay-${uuid().slice(0, 8)}`,
      amount: input.amount,
      currency: input.currency,
      description: input.description,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    this.payments.push(payment);
    return payment;
  }

  refundPayment(contractId: string, actor: string): Payment {
    const payment = this.payments.find((p) => p.contractId === contractId && p.status === 'active');
    if (!payment) throw new Error('Payment not found');
    if (payment.recipient !== actor) throw new Error('Only recipient can refund');
    payment.status = 'refunded';
    return payment;
  }

  createPaymentRequest(input: {
    requester: string;
    amount: number | null;
    currency: string;
    description: string;
    expiresInDays?: number;
  }): PaymentRequest {
    if (!this.getParty(input.requester)) throw new Error('Unknown party');
    const expiresAt = new Date(
      Date.now() + (input.expiresInDays ?? 7) * 24 * 60 * 60 * 1000
    ).toISOString();

    const req: PaymentRequest = {
      contractId: uuid(),
      requester: input.requester,
      requestId: `req-${uuid().slice(0, 8)}`,
      amount: input.amount,
      currency: input.currency,
      description: input.description,
      createdAt: new Date().toISOString(),
      expiresAt,
      fulfilled: false,
    };
    this.paymentRequests.push(req);
    return req;
  }

  fulfillRequest(contractId: string, payer: string, paidAmount: number): Payment {
    const req = this.paymentRequests.find((r) => r.contractId === contractId && !r.fulfilled);
    if (!req) throw new Error('Request not found');
    if (new Date(req.expiresAt) < new Date()) throw new Error('Request expired');
    if (req.amount !== null && req.amount !== paidAmount) {
      throw new Error('Paid amount must match request');
    }
    req.fulfilled = true;
    return this.sendPayment({
      sender: payer,
      recipient: req.requester,
      amount: paidAmount,
      currency: req.currency,
      description: req.description,
    });
  }

  createInvoiceProposal(input: {
    supplier: string;
    buyer: string;
    description: string;
    amount: number;
    currency: string;
    dueDate: string;
  }): InvoiceProposal {
    if (!this.getParty(input.supplier) || !this.getParty(input.buyer)) {
      throw new Error('Unknown party');
    }

    const proposal: InvoiceProposal = {
      contractId: uuid(),
      supplier: input.supplier,
      buyer: input.buyer,
      invoiceId: `inv-${uuid().slice(0, 8)}`,
      description: input.description,
      amount: input.amount,
      currency: input.currency,
      dueDate: input.dueDate,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    this.invoiceProposals.push(proposal);
    return proposal;
  }

  acceptInvoiceProposal(contractId: string, buyer: string): Invoice {
    const proposal = this.invoiceProposals.find(
      (p) => p.contractId === contractId && p.status === 'pending'
    );
    if (!proposal) throw new Error('Proposal not found');
    if (proposal.buyer !== buyer) throw new Error('Only buyer can accept');

    proposal.status = 'accepted';
    const invoice: Invoice = {
      contractId: uuid(),
      supplier: proposal.supplier,
      buyer: proposal.buyer,
      invoiceId: proposal.invoiceId,
      description: proposal.description,
      amount: proposal.amount,
      currency: proposal.currency,
      dueDate: proposal.dueDate,
      confirmedAt: new Date().toISOString(),
      stage: 'confirmed',
    };
    this.invoices.push(invoice);
    return invoice;
  }

  attestInvoice(contractId: string, buyer: string, financier: string): Invoice {
    const invoice = this.findInvoice(contractId, 'confirmed');
    if (invoice.buyer !== buyer) throw new Error('Only buyer can attest');
    if (!this.getParty(financier)) throw new Error('Unknown financier');
    invoice.stage = 'attested';
    invoice.financier = financier;
    return invoice;
  }

  submitFinancingOffer(
    contractId: string,
    financier: string,
    terms: { advanceRate: number; discountFee: number; currency: string }
  ): Invoice {
    const invoice = this.findInvoice(contractId, 'attested');
    if (invoice.financier !== financier) throw new Error('Not authorized financier');
    invoice.financingTerms = terms;
    invoice.offerId = `offer-${uuid().slice(0, 8)}`;
    invoice.stage = 'financed';
    invoice.financedAt = new Date().toISOString();
    return invoice;
  }

  settleInvoice(contractId: string, buyer: string): Invoice {
    const invoice = this.findInvoice(contractId, 'financed');
    if (invoice.buyer !== buyer) throw new Error('Only buyer can settle');
    invoice.stage = 'settled';
    invoice.settledAt = new Date().toISOString();
    return invoice;
  }

  private findInvoice(contractId: string, stage: Invoice['stage']) {
    const invoice = this.invoices.find((i) => i.contractId === contractId && i.stage === stage);
    if (!invoice) throw new Error(`Invoice not found at stage ${stage}`);
    return invoice;
  }

  paymentsForParty(partyId: string) {
    return this.payments.filter((p) => p.sender === partyId || p.recipient === partyId);
  }

  invoicesForParty(partyId: string) {
    return this.invoices.filter(
      (i) => i.supplier === partyId || i.buyer === partyId || i.financier === partyId
    );
  }

  proposalsForParty(partyId: string) {
    return this.invoiceProposals.filter(
      (p) =>
        (p.supplier === partyId || p.buyer === partyId) && p.status === 'pending'
    );
  }

  statsForParty(partyId: string) {
    const payments = this.paymentsForParty(partyId);
    return {
      sent: payments.filter((p) => p.sender === partyId && p.status === 'active').length,
      received: payments.filter((p) => p.recipient === partyId && p.status === 'active').length,
      refunded: payments.filter((p) => p.status === 'refunded').length,
      requests: this.paymentRequests.filter((r) => r.requester === partyId).length,
      invoices: this.invoicesForParty(partyId).length,
    };
  }
}

export const ledger = new Ledger();
