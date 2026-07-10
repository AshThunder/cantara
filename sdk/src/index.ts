/**
 * Cantara Merchant SDK — accept private Canton payments from any Node/TS app.
 *
 * @example
 * ```ts
 * import { Cantara } from 'cantara-sdk';
 *
 * const cantara = new Cantara({
 *   apiUrl: 'https://api.example.com/api',
 *   merchant: 'Carol',
 *   payBaseUrl: 'https://app.example.com',
 * });
 *
 * const checkout = await cantara.createCheckout({
 *   amount: 42,
 *   description: 'Order #1001',
 * });
 * // redirect customer to checkout.payUrl
 * ```
 */

export type CantaraConfig = {
  /** Backend API base including `/api`, e.g. `http://localhost:3001/api` */
  apiUrl: string;
  /** Merchant UI party id (e.g. Carol) */
  merchant: string;
  /** Frontend origin used to build pay links, e.g. `http://localhost:5173` */
  payBaseUrl?: string;
  fetch?: typeof fetch;
};

export type CheckoutSession = {
  contractId: string;
  requestId: string;
  amount: number | null;
  currency: string;
  description: string;
  requester: string;
  payUrl: string;
  expiresAt: string;
  fulfilled: boolean;
};

export type Wallet = {
  party: string;
  currency: string;
  openingBalance: number;
  balance: number;
  sentTotal: number;
  receivedTotal: number;
  refundedTotal: number;
  entries: {
    id: string;
    type: string;
    amount: number;
    balanceAfter: number;
    counterparty?: string;
    description: string;
    createdAt: string;
  }[];
};

export type Payment = {
  contractId: string;
  sender: string;
  recipient: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  updateId?: string;
};

async function request<T>(
  base: string,
  path: string,
  init?: RequestInit,
  fetchImpl: typeof fetch = fetch
): Promise<T> {
  const res = await fetchImpl(`${base.replace(/\/$/, '')}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? `Cantara API ${path} failed: ${res.status}`
    );
  }
  return res.json() as Promise<T>;
}

export class Cantara {
  private readonly apiUrl: string;
  private readonly merchant: string;
  private readonly payBaseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: CantaraConfig) {
    this.apiUrl = config.apiUrl.replace(/\/$/, '');
    this.merchant = config.merchant;
    this.payBaseUrl = (config.payBaseUrl ?? 'http://localhost:5173').replace(/\/$/, '');
    this.fetchImpl = config.fetch ?? fetch;
  }

  /** Health check against the Cantara API. */
  health() {
    return request<{ status: string; mode: string }>(
      this.apiUrl,
      '/health',
      undefined,
      this.fetchImpl
    );
  }

  /**
   * Create a merchant checkout (PaymentRequest) and return a customer pay URL.
   */
  async createCheckout(input: {
    amount: number;
    currency?: string;
    description?: string;
    expiresInDays?: number;
  }): Promise<CheckoutSession> {
    const req = await request<{
      contractId: string;
      requestId: string;
      amount: number | null;
      currency: string;
      description: string;
      requester: string;
      expiresAt: string;
      fulfilled: boolean;
    }>(
      this.apiUrl,
      '/payment-requests',
      {
        method: 'POST',
        body: JSON.stringify({
          requester: this.merchant,
          amount: input.amount,
          currency: input.currency ?? 'USD',
          description: input.description ?? 'Checkout',
          expiresInDays: input.expiresInDays ?? 7,
        }),
      },
      this.fetchImpl
    );

    return {
      ...req,
      payUrl: `${this.payBaseUrl}/pay/${req.contractId}`,
    };
  }

  /** List open checkouts for this merchant. */
  async listCheckouts(): Promise<CheckoutSession[]> {
    const list = await request<
      {
        contractId: string;
        requestId: string;
        amount: number | null;
        currency: string;
        description: string;
        requester: string;
        expiresAt: string;
        fulfilled: boolean;
      }[]
    >(this.apiUrl, `/payment-requests?party=${encodeURIComponent(this.merchant)}`, undefined, this.fetchImpl);

    return list.map((req) => ({
      ...req,
      payUrl: `${this.payBaseUrl}/pay/${req.contractId}`,
    }));
  }

  /** Customer fulfills a checkout (payer party + amount). */
  fulfillCheckout(contractId: string, payer: string, paidAmount: number) {
    return request<Payment>(
      this.apiUrl,
      `/payment-requests/${contractId}/fulfill`,
      {
        method: 'POST',
        body: JSON.stringify({ payer, paidAmount }),
      },
      this.fetchImpl
    );
  }

  /** Merchant wallet / neobank balance. */
  getWallet(currency = 'USD') {
    return request<Wallet>(
      this.apiUrl,
      `/wallet?party=${encodeURIComponent(this.merchant)}&currency=${encodeURIComponent(currency)}`,
      undefined,
      this.fetchImpl
    );
  }
}

export default Cantara;
