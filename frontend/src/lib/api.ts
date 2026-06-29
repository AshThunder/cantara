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

export type Stats = {
  sent: number;
  received: number;
  refunded: number;
  requests: number;
  invoices: number;
};

export const api = {
  getParties: () => request<Party[]>('/parties'),
  getPayments: (party: string) => request<Payment[]>(`/payments?party=${party}`),
  getStats: (party: string) => request<Stats>(`/payments/stats?party=${party}`),
  sendPayment: (body: {
    sender: string;
    recipient: string;
    amount: number;
    currency: string;
    description: string;
  }) => request<Payment>('/payments/send', { method: 'POST', body: JSON.stringify(body) }),
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
