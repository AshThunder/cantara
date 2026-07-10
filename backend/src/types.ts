export type Party = {
  id: string;
  displayName: string;
  role: 'personal' | 'business';
};

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
  /** Canton ledger update ID (transaction id) when known */
  updateId?: string;
  /** Ledger offset when known */
  offset?: number;
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

export type InvoiceProposal = {
  contractId: string;
  supplier: string;
  buyer: string;
  invoiceId: string;
  description: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  submittedAt: string;
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
  financingTerms?: {
    advanceRate: number;
    discountFee: number;
    currency: string;
  };
  offerId?: string;
  financedAt?: string;
  settledAt?: string;
};

export const PARTIES: Party[] = [
  { id: 'Alice', displayName: 'Alice', role: 'personal' },
  { id: 'Bob', displayName: 'Bob', role: 'personal' },
  { id: 'Carol', displayName: 'Carol', role: 'business' },
  { id: 'Financier', displayName: 'Financier', role: 'business' },
];
