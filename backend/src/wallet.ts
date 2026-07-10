import type { Payment } from './types.js';

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

const DEFAULT_OPENING = Number(process.env.WALLET_OPENING_BALANCE ?? 10_000);

/**
 * Neobank-style balance derived from payment contracts + opening credit.
 * Active payments move the balance; refunded payments are ledger-only (net zero).
 */
export function computeWallet(
  partyId: string,
  payments: Payment[],
  currency = 'USD',
  openingBalance = DEFAULT_OPENING
): Wallet {
  const relevant = payments
    .filter((p) => p.sender === partyId || p.recipient === partyId)
    .filter((p) => !p.currency || p.currency === currency)
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  let balance = openingBalance;
  let sentTotal = 0;
  let receivedTotal = 0;
  let refundedTotal = 0;
  const entries: WalletEntry[] = [
    {
      id: 'opening',
      type: 'opening',
      amount: openingBalance,
      balanceAfter: openingBalance,
      description: 'Opening balance',
      createdAt: relevant[0]?.createdAt ?? new Date().toISOString(),
    },
  ];

  for (const p of relevant) {
    if (p.status === 'refunded') {
      refundedTotal += p.amount;
      entries.push({
        id: p.contractId,
        type: 'refund',
        amount: 0,
        balanceAfter: balance,
        counterparty: p.sender === partyId ? p.recipient : p.sender,
        description: `Refunded · ${p.description}`,
        paymentId: p.paymentId,
        contractId: p.contractId,
        createdAt: p.createdAt,
      });
      continue;
    }

    if (p.recipient === partyId) {
      balance += p.amount;
      receivedTotal += p.amount;
      entries.push({
        id: p.contractId,
        type: 'credit',
        amount: p.amount,
        balanceAfter: balance,
        counterparty: p.sender,
        description: p.description || 'Payment received',
        paymentId: p.paymentId,
        contractId: p.contractId,
        createdAt: p.createdAt,
      });
    } else if (p.sender === partyId) {
      balance -= p.amount;
      sentTotal += p.amount;
      entries.push({
        id: p.contractId,
        type: 'debit',
        amount: -p.amount,
        balanceAfter: balance,
        counterparty: p.recipient,
        description: p.description || 'Payment sent',
        paymentId: p.paymentId,
        contractId: p.contractId,
        createdAt: p.createdAt,
      });
    }
  }

  return {
    party: partyId,
    currency,
    openingBalance,
    balance,
    sentTotal,
    receivedTotal,
    refundedTotal,
    entries: entries.reverse(),
  };
}
