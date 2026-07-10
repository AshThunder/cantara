const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export type Party = { id: string; displayName: string; role: 'personal' | 'business' };

export type Payment = {
  contractId: string;
  sender: string;
  recipient: string;
  paymentId: string;
  amount: number;
  currency: string;
  description: string;
  status: 'active' | 'refunded';
  createdAt: string;
  updateId?: string;
  offset?: number;
};

export type Invoice = {
  contractId: string;
  supplier: string;
  buyer: string;
  invoiceId: string;
  description: string;
  amount: number;
  currency: string;
  dueDate: string;
  confirmedAt: string;
  stage: 'confirmed' | 'attested' | 'financed' | 'settled';
  financier?: string;
  financingTerms?: { advanceRate: number; discountFee: number; currency: string };
};

export type InvoiceProposal = {
  contractId: string;
  supplier: string;
  buyer: string;
  invoiceId: string;
  description: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: string;
  submittedAt: string;
};

export type PaymentRequest = {
  contractId: string;
  requester: string;
  requestId: string;
  amount: number | null;
  currency: string;
  description: string;
  createdAt: string;
  expiresAt: string;
  fulfilled: boolean;
};

export type Subscription = {
  contractId: string;
  subscriber: string;
  recipient: string;
  amount: number;
  currency: string;
  description: string;
  subscriptionId: string;
  intervalDays: number;
  nextPaymentAt: string;
  active: boolean;
  createdAt: string;
  updateId?: string;
};

export type BatchPaymentResult = {
  payments: Payment[];
  updateId?: string;
  offset?: number;
};

export type Stats = {
  sent: number;
  received: number;
  refunded: number;
  requests: number;
  invoices: number;
};

export type WalletEntry = {
  id: string;
  type: 'opening' | 'credit' | 'debit' | 'refund';
  amount: number;
  balanceAfter: number;
  counterparty?: string;
  description: string;
  paymentId?: string;
  contractId?: string;
  createdAt: string;
};

export type Wallet = {
  party: string;
  currency: string;
  openingBalance: number;
  balance: number;
  sentTotal: number;
  receivedTotal: number;
  refundedTotal: number;
  entries: WalletEntry[];
};

export type SchedulerStatus = {
  enabled: boolean;
  pollMs: number;
  running: boolean;
  lastRun: {
    checkedAt: string;
    due: number;
    executed: number;
    failed: number;
  } | null;
};

export const api = {
  getParties: () => request<Party[]>('/parties'),
  getWallet: (party: string, currency = 'USD') =>
    request<Wallet>(`/wallet?party=${party}&currency=${currency}`),
  getScheduler: () => request<SchedulerStatus>('/subscriptions/scheduler'),
  runScheduler: () =>
    request<SchedulerStatus['lastRun']>('/subscriptions/scheduler/run', { method: 'POST' }),
  getPayments: (party: string) => request<Payment[]>(`/payments?party=${party}`),
  getStats: (party: string) => request<Stats>(`/payments/stats?party=${party}`),
  sendPayment: (body: {
    sender: string;
    recipient: string;
    amount: number;
    currency: string;
    description: string;
  }) => request<Payment>('/payments/send', { method: 'POST', body: JSON.stringify(body) }),
  refundPayment: (contractId: string, actor: string) =>
    request<Payment>(`/payments/${contractId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ actor }),
    }),
  multiSend: (body: {
    sender: string;
    currency: string;
    description: string;
    recipients: { recipient: string; amount: number }[];
  }) =>
    request<BatchPaymentResult>('/payments/multi-send', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getPaymentRequests: (party: string) =>
    request<PaymentRequest[]>(`/payment-requests?party=${party}`),
  createPaymentRequest: (body: {
    requester: string;
    amount: number | null;
    currency: string;
    description: string;
    expiresInDays?: number;
  }) =>
    request<PaymentRequest>('/payment-requests', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  fulfillPaymentRequest: (contractId: string, payer: string, paidAmount: number) =>
    request<Payment>(`/payment-requests/${contractId}/fulfill`, {
      method: 'POST',
      body: JSON.stringify({ payer, paidAmount }),
    }),
  getSubscriptions: (party: string) =>
    request<Subscription[]>(`/subscriptions?party=${party}`),
  createSubscription: (body: {
    subscriber: string;
    recipient: string;
    amount: number;
    currency: string;
    description: string;
    intervalDays?: number;
  }) =>
    request<Subscription>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  executeSubscription: (contractId: string, subscriber: string) =>
    request<Payment>(`/subscriptions/${contractId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ subscriber }),
    }),
  cancelSubscription: (contractId: string, subscriber: string) =>
    request<{ ok: boolean }>(`/subscriptions/${contractId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ subscriber }),
    }),
  getInvoices: (party: string) =>
    request<{ invoices: Invoice[]; proposals: InvoiceProposal[] }>(`/invoices?party=${party}`),
  createInvoice: (body: {
    supplier: string;
    buyer: string;
    description: string;
    amount: number;
    currency: string;
    dueDate: string;
  }) => request<InvoiceProposal>('/invoices', { method: 'POST', body: JSON.stringify(body) }),
  acceptProposal: (contractId: string, buyer: string) =>
    request<Invoice>(`/invoices/proposals/${contractId}/accept`, {
      method: 'POST',
      body: JSON.stringify({ buyer }),
    }),
  attestInvoice: (contractId: string, buyer: string, financier: string) =>
    request<Invoice>(`/invoices/${contractId}/attest`, {
      method: 'POST',
      body: JSON.stringify({ buyer, financier }),
    }),
  submitOffer: (
    contractId: string,
    financier: string,
    terms: { advanceRate: number; discountFee: number; currency: string }
  ) =>
    request<Invoice>(`/invoices/${contractId}/offer`, {
      method: 'POST',
      body: JSON.stringify({ financier, terms }),
    }),
  settleInvoice: (contractId: string, buyer: string) =>
    request<Invoice>(`/invoices/${contractId}/settle`, {
      method: 'POST',
      body: JSON.stringify({ buyer }),
    }),
};
