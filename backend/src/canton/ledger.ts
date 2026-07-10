import { v4 as uuid } from 'uuid';
import type {
  BatchPaymentResult,
  Invoice,
  InvoiceProposal,
  Payment,
  PaymentRequest,
  Subscription,
} from '../types.js';
import { PARTIES } from '../types.js';
import { CantonClient } from './client.js';
import type { CantonConfig } from './config.js';
import { daysToRelTime, tpl, tplById } from './templates.js';

function dec(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return parseFloat(v);
  return 0;
}

function isoNow(): string {
  return new Date().toISOString();
}

function futureDays(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

export class CantonLedger {
  private client: CantonClient;
  /** UI party labels when multiple roles share one Canton party (sandbox). */
  private uiOverlay = new Map<
    string,
    {
      sender?: string;
      recipient?: string;
      supplier?: string;
      buyer?: string;
      financier?: string;
      updateId?: string;
      offset?: number;
    }
  >();

  constructor(private readonly config: CantonConfig) {
    this.client = new CantonClient(config);
  }

  resolveUiParty(uiId: string): string {
    const mapped = this.config.partyMap[uiId];
    if (!mapped) throw new Error(`Unknown party: ${uiId}`);
    return mapped;
  }

  toUiParty(cantonId: string): string {
    for (const [ui, canton] of Object.entries(this.config.partyMap)) {
      if (canton === cantonId) return ui;
    }
    return cantonId.length > 16 ? `${cantonId.slice(0, 8)}…` : cantonId;
  }

  getParties() {
    return PARTIES.map((p) => ({
      ...p,
      id: p.id,
      cantonPartyId: this.config.partyMap[p.id] ?? this.config.operatorParty,
    }));
  }

  private parsePayment(
    contractId: string,
    args: Record<string, unknown>,
    status: 'active' | 'refunded',
    createdAt?: string,
    meta?: { updateId?: string; offset?: number }
  ): Payment {
    const details = args.details as Record<string, unknown> | undefined;
    const overlay = this.uiOverlay.get(contractId);
    const rawDesc = String(details?.description ?? '');
    const tagged = rawDesc.match(/^\[(.+?)→(.+?)\]\s*(.*)$/);
    return {
      contractId,
      sender: overlay?.sender ?? tagged?.[1] ?? this.toUiParty(String(args.sender)),
      recipient: overlay?.recipient ?? tagged?.[2] ?? this.toUiParty(String(args.recipient)),
      paymentId: String(details?.paymentId ?? ''),
      amount: dec(details?.amount),
      currency: String(details?.currency ?? 'USD'),
      description: tagged?.[3] ?? rawDesc,
      status,
      createdAt: String(createdAt ?? args.createdAt ?? isoNow()),
      updateId: meta?.updateId ?? overlay?.updateId,
      offset: meta?.offset ?? overlay?.offset,
    };
  }

  async sendPayment(input: {
    sender: string;
    recipient: string;
    amount: number;
    currency: string;
    description: string;
  }): Promise<Payment> {
    if (input.sender === input.recipient) throw new Error('Cannot pay yourself');
    if (input.amount <= 0) throw new Error('Amount must be positive');

    const sender = this.resolveUiParty(input.sender);
    const recipient = this.resolveUiParty(input.recipient);
    // Shared sandbox party: encode UI roles in description for display
    const description =
      sender === recipient
        ? `[${input.sender}→${input.recipient}] ${input.description}`
        : input.description;

    const result = await this.client.submitAndWait(
      [sender],
      [
        this.client.createCommand(tplById(this.config, 'Payment'), {
          sender,
          recipient,
          details: {
            paymentId: `pay-${uuid().slice(0, 8)}`,
            amount: input.amount.toFixed(1),
            currency: input.currency,
            description,
          },
          status: 'PaymentActive',
          createdAt: isoNow(),
        }),
      ]
    );

    const created = extractCreated(result);
    if (!created) throw new Error('Payment create returned no contract');
    const meta = extractTxMeta(result);
    this.uiOverlay.set(created.contractId, {
      sender: input.sender,
      recipient: input.recipient,
      updateId: meta.updateId,
      offset: meta.offset,
    });
    return this.parsePayment(
      created.contractId,
      created.createArgument as Record<string, unknown>,
      'active',
      created.createdAt,
      meta
    );
  }

  async refundPayment(contractId: string, actor: string): Promise<Payment> {
    const actorParty = this.resolveUiParty(actor);
    const payment = await this.findPaymentContract(contractId, actorParty);
    if (!payment) throw new Error('Payment not found');

    const result = await this.client.submitAndWait(
      [actorParty],
      [
        this.client.exerciseCommand(
          tplById(this.config, 'Payment'),
          contractId,
          'Payment_Refund',
          {}
        ),
      ],
      [actorParty]
    );

    const created = extractCreated(result);
    const meta = extractTxMeta(result);
    const args = (created?.createArgument ?? payment.createArgument) as Record<string, unknown>;
    if (created?.contractId) {
      this.uiOverlay.set(created.contractId, {
        ...this.uiOverlay.get(contractId),
        updateId: meta.updateId,
        offset: meta.offset,
      });
    }
    return this.parsePayment(
      created?.contractId ?? contractId,
      args,
      'refunded',
      created?.createdAt,
      meta
    );
  }

  private async findPaymentContract(contractId: string, party: string) {
    const contracts = await this.client.queryActiveContracts(party, [
      tpl(this.config, 'Payment'),
    ]);
    return contracts.find((c) => c.contractId === contractId);
  }

  async paymentsForParty(uiPartyId: string): Promise<Payment[]> {
    const party = this.resolveUiParty(uiPartyId);
    const templateIds = [tpl(this.config, 'Payment'), tpl(this.config, 'RefundedPayment')];
    const contracts = await this.client.queryActiveContracts(party, templateIds);
    const payments: Payment[] = [];

    for (const c of contracts) {
      const args = c.createArgument as Record<string, unknown>;
      const tid = String(c.templateId);
      const isRefund = tid.includes('RefundedPayment');
      payments.push(
        this.parsePayment(
          String(c.contractId),
          args,
          isRefund ? 'refunded' : 'active',
          String(c.createdAt)
        )
      );
    }

    return payments.filter((p) => p.sender === uiPartyId || p.recipient === uiPartyId);
  }

  async createPaymentRequest(input: {
    requester: string;
    amount: number | null;
    currency: string;
    description: string;
    expiresInDays?: number;
  }): Promise<PaymentRequest> {
    const requester = this.resolveUiParty(input.requester);
    const expiresAt = futureDays(input.expiresInDays ?? 7);
    const amountArg =
      input.amount == null
        ? { tag: 'AnyAmount', value: {} }
        : { tag: 'FixedAmount', value: input.amount.toFixed(1) };

    const result = await this.client.submitAndWait(
      [requester],
      [
        this.client.createCommand(tplById(this.config, 'PaymentRequest'), {
          requester,
          requestId: `req-${uuid().slice(0, 8)}`,
          amount: amountArg,
          currency: input.currency,
          description:
            requester === this.config.operatorParty
              ? `[${input.requester}] ${input.description}`
              : input.description,
          createdAt: isoNow(),
          expiresAt,
        }),
      ]
    );

    const created = extractCreated(result);
    if (!created) throw new Error('PaymentRequest create returned no contract');
    this.uiOverlay.set(String(created.contractId), { supplier: input.requester });
    return this.parsePaymentRequest(
      String(created.contractId),
      created.createArgument as Record<string, unknown>,
      input.requester
    );
  }

  async paymentRequestsForParty(uiPartyId: string): Promise<PaymentRequest[]> {
    const party = this.resolveUiParty(uiPartyId);
    const contracts = await this.client.queryActiveContracts(party, [
      tpl(this.config, 'PaymentRequest'),
    ]);
    return contracts.map((c) =>
      this.parsePaymentRequest(
        String(c.contractId),
        c.createArgument as Record<string, unknown>,
        uiPartyId
      )
    );
  }

  async fulfillPaymentRequest(
    contractId: string,
    payerUi: string,
    paidAmount: number
  ): Promise<Payment> {
    const payer = this.resolveUiParty(payerUi);
    const result = await this.client.submitAndWait(
      [payer],
      [
        this.client.exerciseCommand(
          tplById(this.config, 'PaymentRequest'),
          contractId,
          'PaymentRequest_Fulfill',
          {
            payer,
            paidAmount: paidAmount.toFixed(1),
            paymentId: `pay-${uuid().slice(0, 8)}`,
          }
        ),
      ],
      [payer]
    );
    const created = extractCreated(result);
    if (!created) throw new Error('Fulfill returned no Payment');
    const meta = extractTxMeta(result);
    return this.parsePayment(
      created.contractId,
      created.createArgument as Record<string, unknown>,
      'active',
      created.createdAt,
      meta
    );
  }

  async createSubscription(input: {
    subscriber: string;
    recipient: string;
    amount: number;
    currency: string;
    description: string;
    intervalDays?: number;
  }): Promise<Subscription> {
    if (input.subscriber === input.recipient) throw new Error('Cannot subscribe to yourself');
    if (input.amount <= 0) throw new Error('Amount must be positive');
    const subscriber = this.resolveUiParty(input.subscriber);
    const recipient = this.resolveUiParty(input.recipient);
    const intervalDays = input.intervalDays ?? 30;
    const description =
      subscriber === recipient
        ? `[${input.subscriber}→${input.recipient}] ${input.description}`
        : input.description;

    const actAs = [...new Set([subscriber, recipient])];
    const result = await this.client.submitAndWait(
      actAs,
      [
        this.client.createCommand(tplById(this.config, 'Subscription'), {
          subscriber,
          recipient,
          amount: input.amount.toFixed(1),
          currency: input.currency,
          description,
          subscriptionId: `sub-${uuid().slice(0, 8)}`,
          interval: daysToRelTime(intervalDays),
          nextPaymentAt: new Date(Date.now() - 1000).toISOString(),
          active: true,
          createdAt: isoNow(),
        }),
      ]
    );

    const created = extractCreated(result);
    if (!created) throw new Error('Subscription create returned no contract');
    const meta = extractTxMeta(result);
    this.uiOverlay.set(created.contractId, {
      sender: input.subscriber,
      recipient: input.recipient,
      updateId: meta.updateId,
      offset: meta.offset,
    });
    return this.parseSubscription(
      created.contractId,
      created.createArgument as Record<string, unknown>,
      meta
    );
  }

  async subscriptionsForParty(uiPartyId: string): Promise<Subscription[]> {
    const party = this.resolveUiParty(uiPartyId);
    const contracts = await this.client.queryActiveContracts(party, [
      tpl(this.config, 'Subscription'),
    ]);
    return contracts
      .map((c) =>
        this.parseSubscription(
          String(c.contractId),
          c.createArgument as Record<string, unknown>
        )
      )
      .filter((s) => s.subscriber === uiPartyId || s.recipient === uiPartyId);
  }

  async executeSubscription(contractId: string, subscriberUi: string): Promise<Payment> {
    const subscriber = this.resolveUiParty(subscriberUi);
    const result = await this.client.submitAndWait(
      [subscriber],
      [
        this.client.exerciseCommand(
          tplById(this.config, 'Subscription'),
          contractId,
          'Subscription_Execute',
          { paymentId: `pay-${uuid().slice(0, 8)}` }
        ),
      ],
      [subscriber]
    );
    const created = extractCreated(result, isPaymentTemplate);
    if (!created) throw new Error('Subscription_Execute returned no Payment');
    const meta = extractTxMeta(result);
    return this.parsePayment(
      created.contractId,
      created.createArgument as Record<string, unknown>,
      'active',
      created.createdAt,
      meta
    );
  }

  async cancelSubscription(contractId: string, subscriberUi: string): Promise<void> {
    const subscriber = this.resolveUiParty(subscriberUi);
    await this.client.submitAndWait(
      [subscriber],
      [
        this.client.exerciseCommand(
          tplById(this.config, 'Subscription'),
          contractId,
          'Subscription_Cancel',
          {}
        ),
      ],
      [subscriber]
    );
  }

  async multiSend(input: {
    sender: string;
    currency: string;
    description: string;
    recipients: { recipient: string; amount: number }[];
  }): Promise<BatchPaymentResult> {
    if (input.recipients.length < 1 || input.recipients.length > 10) {
      throw new Error('Multi-send supports 1–10 recipients');
    }
    const sender = this.resolveUiParty(input.sender);
    const batchRecipients = input.recipients.map((r) => {
      if (r.recipient === input.sender) throw new Error('Cannot include yourself as recipient');
      if (r.amount <= 0) throw new Error('Amounts must be positive');
      return {
        recipient: this.resolveUiParty(r.recipient),
        amount: r.amount.toFixed(1),
        paymentId: `pay-${uuid().slice(0, 8)}`,
      };
    });

    const createResult = await this.client.submitAndWait(
      [sender],
      [
        this.client.createCommand(tplById(this.config, 'PaymentBatchProposal'), {
          sender,
          recipients: batchRecipients,
          currency: input.currency,
          description: input.description,
          proposedAt: isoNow(),
        }),
      ]
    );
    const proposal = extractCreated(createResult);
    if (!proposal) throw new Error('Batch proposal create failed');

    const execResult = await this.client.submitAndWait(
      [sender],
      [
        this.client.exerciseCommand(
          tplById(this.config, 'PaymentBatchProposal'),
          proposal.contractId,
          'PaymentBatchProposal_Execute',
          {}
        ),
      ],
      [sender]
    );
    const meta = extractTxMeta(execResult);
    const createdPayments = extractAllCreated(execResult).filter((c) =>
      isPaymentTemplate(String(c.templateId ?? ''))
    );

    const payments = createdPayments.map((c, i) => {
      const uiRecipient = input.recipients[i]?.recipient;
      this.uiOverlay.set(c.contractId, {
        sender: input.sender,
        recipient: uiRecipient,
        updateId: meta.updateId,
        offset: meta.offset,
      });
      return this.parsePayment(
        c.contractId,
        c.createArgument as Record<string, unknown>,
        'active',
        c.createdAt,
        meta
      );
    });

    return { payments, updateId: meta.updateId, offset: meta.offset };
  }

  private parseSubscription(
    contractId: string,
    args: Record<string, unknown>,
    meta?: { updateId?: string; offset?: number }
  ): Subscription {
    const overlay = this.uiOverlay.get(contractId);
    const rawDesc = String(args.description ?? '');
    const tagged = rawDesc.match(/^\[(.+?)→(.+?)\]\s*(.*)$/);
    return {
      contractId,
      subscriber: overlay?.sender ?? tagged?.[1] ?? this.toUiParty(String(args.subscriber)),
      recipient: overlay?.recipient ?? tagged?.[2] ?? this.toUiParty(String(args.recipient)),
      amount: dec(args.amount),
      currency: String(args.currency ?? 'USD'),
      description: tagged?.[3] ?? rawDesc,
      subscriptionId: String(args.subscriptionId ?? ''),
      intervalDays: relTimeToDays(args.interval),
      nextPaymentAt: String(args.nextPaymentAt ?? isoNow()),
      active: Boolean(args.active ?? true),
      createdAt: String(args.createdAt ?? isoNow()),
      updateId: meta?.updateId ?? overlay?.updateId,
    };
  }

  private parsePaymentRequest(
    contractId: string,
    args: Record<string, unknown>,
    fallbackRequester?: string
  ): PaymentRequest {
    const amountField = args.amount as Record<string, unknown> | undefined;
    let amount: number | null = null;
    if (amountField?.tag === 'FixedAmount') {
      amount = dec(amountField.value);
    } else if (amountField && 'FixedAmount' in amountField) {
      amount = dec(amountField.FixedAmount);
    }
    const rawDesc = String(args.description ?? '');
    const tagged = rawDesc.match(/^\[(.+?)\]\s*(.*)$/);
    return {
      contractId,
      requester:
        this.uiOverlay.get(contractId)?.supplier ??
        tagged?.[1] ??
        fallbackRequester ??
        this.toUiParty(String(args.requester)),
      requestId: String(args.requestId ?? ''),
      amount,
      currency: String(args.currency ?? 'USD'),
      description: tagged?.[2] ?? rawDesc,
      createdAt: String(args.createdAt ?? isoNow()),
      expiresAt: String(args.expiresAt ?? futureDays(7)),
      fulfilled: false,
    };
  }

  async createInvoiceProposal(input: {
    supplier: string;
    buyer: string;
    description: string;
    amount: number;
    currency: string;
    dueDate: string;
  }): Promise<InvoiceProposal> {
    const supplier = this.resolveUiParty(input.supplier);
    const buyer = this.resolveUiParty(input.buyer);

    const result = await this.client.submitAndWait(
      [supplier],
      [
        this.client.createCommand(tplById(this.config, 'InvoiceProposal'), {
          supplier,
          buyer,
          details: {
            invoiceId: `inv-${uuid().slice(0, 8)}`,
            description:
              supplier === buyer
                ? `[${input.supplier}→${input.buyer}] ${input.description}`
                : input.description,
            amount: input.amount.toFixed(1),
            currency: input.currency,
            dueDate: input.dueDate,
          },
          submittedAt: isoNow(),
        }),
      ]
    );

    const created = extractCreated(result);
    if (!created) throw new Error('InvoiceProposal create returned no contract');
    this.uiOverlay.set(String(created.contractId), {
      supplier: input.supplier,
      buyer: input.buyer,
    });
    return this.parseProposal(String(created.contractId), created.createArgument as Record<string, unknown>);
  }

  async acceptInvoiceProposal(contractId: string, buyerUi: string): Promise<Invoice> {
    const buyer = this.resolveUiParty(buyerUi);
    const result = await this.client.submitAndWait(
      [buyer],
      [
        this.client.exerciseCommand(
          tplById(this.config, 'InvoiceProposal'),
          contractId,
          'InvoiceProposal_Accept',
          {}
        ),
      ],
      [buyer]
    );
    const created = extractCreated(result);
    if (!created) throw new Error('Accept returned no Invoice');
    return this.parseInvoice(String(created.contractId), created.createArgument as Record<string, unknown>, 'confirmed');
  }

  async attestInvoice(contractId: string, buyerUi: string, financierUi: string): Promise<Invoice> {
    const buyer = this.resolveUiParty(buyerUi);
    const financier = this.resolveUiParty(financierUi);
    const result = await this.client.submitAndWait(
      [buyer],
      [
        this.client.exerciseCommand(tplById(this.config, 'Invoice'), contractId, 'Invoice_Attest', {
          financier,
        }),
      ],
      [buyer]
    );
    const created = extractCreated(result);
    if (!created) throw new Error('Attest returned no contract');
    return this.parseInvoice(String(created.contractId), created.createArgument as Record<string, unknown>, 'attested', financierUi);
  }

  async submitFinancingOffer(
    contractId: string,
    financierUi: string,
    terms: { advanceRate: number; discountFee: number; currency: string }
  ): Promise<Invoice> {
    const financier = this.resolveUiParty(financierUi);
    const offerResult = await this.client.submitAndWait(
      [financier],
      [
        this.client.exerciseCommand(
          tplById(this.config, 'AttestedInvoice'),
          contractId,
          'AttestedInvoice_SubmitOffer',
          {
            offerId: `offer-${uuid().slice(0, 8)}`,
            validUntil: futureDays(14),
            terms: {
              advanceRate: terms.advanceRate.toFixed(2),
              discountFee: terms.discountFee.toFixed(2),
              currency: terms.currency,
            },
          }
        ),
      ],
      [financier]
    );

    const offer = extractCreated(offerResult);
    if (!offer) throw new Error('SubmitOffer returned no contract');

    const offerArgs = offer.createArgument as Record<string, unknown>;
    const supplier = String(offerArgs.supplier);

    const financedResult = await this.client.submitAndWait(
      [supplier],
      [
        this.client.exerciseCommand(
          tplById(this.config, 'FinancingOffer'),
          offer.contractId,
          'FinancingOffer_Accept',
          {}
        ),
      ],
      [supplier]
    );

    const created = extractCreated(financedResult);
    if (!created) throw new Error('FinancingOffer_Accept returned no contract');
    const args = created.createArgument as Record<string, unknown>;
    return {
      contractId: String(created.contractId),
      supplier: this.toUiParty(String(args.supplier)),
      buyer: this.toUiParty(String(args.buyer)),
      invoiceId: String(args.invoiceId),
      description: String(args.invoiceId),
      amount: dec(args.invoiceAmount),
      currency: String(args.invoiceCurrency),
      dueDate: futureDays(60),
      confirmedAt: isoNow(),
      stage: 'financed',
      financier: financierUi,
      financingTerms: terms,
      offerId: String(offerArgs.offerId),
      financedAt: String(args.financedAt ?? isoNow()),
    };
  }

  async settleInvoice(contractId: string, buyerUi: string): Promise<Invoice> {
    const buyer = this.resolveUiParty(buyerUi);
    const result = await this.client.submitAndWait(
      [buyer],
      [
        this.client.exerciseCommand(
          tplById(this.config, 'FinancedInvoice'),
          contractId,
          'FinancedInvoice_Settle',
          {}
        ),
      ],
      [buyer]
    );
    const created = extractCreated(result);
    if (!created) throw new Error('Settle returned no contract');
    const args = created.createArgument as Record<string, unknown>;
    return {
      contractId: String(created.contractId),
      supplier: this.toUiParty(String(args.supplier)),
      buyer: this.toUiParty(String(args.buyer)),
      invoiceId: String(args.invoiceId),
      description: String(args.invoiceId),
      amount: dec(args.invoiceAmount),
      currency: String(args.invoiceCurrency),
      dueDate: futureDays(60),
      confirmedAt: isoNow(),
      stage: 'settled',
      financier: this.toUiParty(String(args.financier)),
      settledAt: String(args.settledAt ?? isoNow()),
    };
  }

  async proposalsForParty(uiPartyId: string): Promise<InvoiceProposal[]> {
    const party = this.resolveUiParty(uiPartyId);
    const contracts = await this.client.queryActiveContracts(party, [
      tpl(this.config, 'InvoiceProposal'),
    ]);
    return contracts
      .map((c) =>
        this.parseProposal(String(c.contractId), c.createArgument as Record<string, unknown>)
      )
      .filter((p) => p.supplier === uiPartyId || p.buyer === uiPartyId);
  }

  async invoicesForParty(uiPartyId: string): Promise<Invoice[]> {
    const party = this.resolveUiParty(uiPartyId);
    const templateIds = [
      tpl(this.config, 'Invoice'),
      tpl(this.config, 'AttestedInvoice'),
      tpl(this.config, 'FinancingOffer'),
      tpl(this.config, 'FinancedInvoice'),
      tpl(this.config, 'SettledInvoice'),
    ];
    const contracts = await this.client.queryActiveContracts(party, templateIds);
    const invoices: Invoice[] = [];

    for (const c of contracts) {
      const tid = String(c.templateId);
      const args = c.createArgument as Record<string, unknown>;
      if (tid.includes(':Invoice:Invoice')) {
        invoices.push(this.parseInvoice(String(c.contractId), args, 'confirmed'));
      } else if (tid.includes('AttestedInvoice')) {
        invoices.push(
          this.parseInvoice(
            String(c.contractId),
            args,
            'attested',
            this.toUiParty(String(args.financier))
          )
        );
      } else if (tid.includes('FinancingOffer')) {
        const terms = args.terms as Record<string, unknown> | undefined;
        invoices.push({
          contractId: String(c.contractId),
          supplier: this.toUiParty(String(args.supplier)),
          buyer: this.toUiParty(String(args.buyer)),
          invoiceId: String(args.invoiceId),
          description: String(args.invoiceId),
          amount: dec(args.invoiceAmount),
          currency: String(args.invoiceCurrency),
          dueDate: futureDays(60),
          confirmedAt: String(args.offeredAt ?? isoNow()),
          stage: 'attested',
          financier: this.toUiParty(String(args.financier)),
          financingTerms: terms
            ? {
                advanceRate: dec(terms.advanceRate),
                discountFee: dec(terms.discountFee),
                currency: String(terms.currency),
              }
            : undefined,
          offerId: String(args.offerId),
        });
      } else if (tid.includes('FinancedInvoice')) {
        invoices.push({
          contractId: String(c.contractId),
          supplier: this.toUiParty(String(args.supplier)),
          buyer: this.toUiParty(String(args.buyer)),
          invoiceId: String(args.invoiceId),
          description: String(args.invoiceId),
          amount: dec(args.invoiceAmount),
          currency: String(args.invoiceCurrency),
          dueDate: futureDays(60),
          confirmedAt: String(args.financedAt ?? isoNow()),
          stage: 'financed',
          financier: this.toUiParty(String(args.financier)),
          financedAt: String(args.financedAt),
        });
      } else if (tid.includes('SettledInvoice')) {
        invoices.push({
          contractId: String(c.contractId),
          supplier: this.toUiParty(String(args.supplier)),
          buyer: this.toUiParty(String(args.buyer)),
          invoiceId: String(args.invoiceId),
          description: String(args.invoiceId),
          amount: dec(args.invoiceAmount),
          currency: String(args.invoiceCurrency),
          dueDate: futureDays(60),
          confirmedAt: String(args.settledAt ?? isoNow()),
          stage: 'settled',
          financier: this.toUiParty(String(args.financier)),
          settledAt: String(args.settledAt),
        });
      }
    }

    return invoices.filter(
      (i) => i.supplier === uiPartyId || i.buyer === uiPartyId || i.financier === uiPartyId
    );
  }

  async statsForParty(uiPartyId: string) {
    const payments = await this.paymentsForParty(uiPartyId);
    const invoices = await this.invoicesForParty(uiPartyId);
    const requests = await this.paymentRequestsForParty(uiPartyId);
    return {
      sent: payments.filter((p) => p.sender === uiPartyId && p.status === 'active').length,
      received: payments.filter((p) => p.recipient === uiPartyId && p.status === 'active').length,
      refunded: payments.filter((p) => p.status === 'refunded').length,
      requests: requests.length,
      invoices: invoices.length,
    };
  }

  private parseProposal(contractId: string, args: Record<string, unknown>): InvoiceProposal {
    const details = args.details as Record<string, unknown>;
    const overlay = this.uiOverlay.get(contractId);
    const rawDesc = String(details.description ?? '');
    const tagged = rawDesc.match(/^\[(.+?)→(.+?)\]\s*(.*)$/);
    return {
      contractId,
      supplier: overlay?.supplier ?? tagged?.[1] ?? this.toUiParty(String(args.supplier)),
      buyer: overlay?.buyer ?? tagged?.[2] ?? this.toUiParty(String(args.buyer)),
      invoiceId: String(details.invoiceId),
      description: tagged?.[3] ?? rawDesc,
      amount: dec(details.amount),
      currency: String(details.currency),
      dueDate: String(details.dueDate),
      status: 'pending',
      submittedAt: String(args.submittedAt ?? isoNow()),
    };
  }

  private parseInvoice(
    contractId: string,
    args: Record<string, unknown>,
    stage: Invoice['stage'],
    financierUi?: string
  ): Invoice {
    const details = args.details as Record<string, unknown> | undefined;
    return {
      contractId,
      supplier: this.toUiParty(String(args.supplier)),
      buyer: this.toUiParty(String(args.buyer)),
      invoiceId: String(details?.invoiceId ?? args.invoiceId ?? ''),
      description: String(details?.description ?? args.invoiceId ?? ''),
      amount: dec(details?.amount ?? args.invoiceAmount),
      currency: String(details?.currency ?? args.invoiceCurrency ?? 'USD'),
      dueDate: String(details?.dueDate ?? futureDays(60)),
      confirmedAt: String(args.confirmedAt ?? isoNow()),
      stage,
      financier: financierUi ?? (args.financier ? this.toUiParty(String(args.financier)) : undefined),
    };
  }
}

function isPaymentTemplate(templateId: string): boolean {
  // Template ids look like `…:Cantara.Payments.Payment:Payment`
  return /(?:^|:)Cantara\.Payments\.Payment:Payment$/.test(templateId);
}

function relTimeToDays(interval: unknown): number {
  if (interval == null) return 30;
  let micros: number | null = null;
  if (typeof interval === 'object' && interval !== null && 'microseconds' in interval) {
    micros = Number((interval as { microseconds: string | number }).microseconds);
  } else if (typeof interval === 'string' || typeof interval === 'number') {
    micros = Number(interval);
  }
  if (micros == null || Number.isNaN(micros)) return 30;
  return Math.max(1, Math.round(micros / (24 * 60 * 60 * 1_000_000)));
}

function extractCreated(
  result: Record<string, unknown>,
  filter?: (templateId: string) => boolean
) {
  const all = extractAllCreated(result);
  if (filter) return all.find((c) => filter(String(c.templateId ?? ''))) ?? null;
  return all[0] ?? null;
}

function extractAllCreated(result: Record<string, unknown>) {
  const tx = result.transaction as Record<string, unknown> | undefined;
  const events = (tx?.events ?? []) as Record<string, unknown>[];
  const out: {
    contractId: string;
    createArgument: Record<string, unknown>;
    createdAt: string;
    templateId?: string;
  }[] = [];
  for (const ev of events) {
    const created = ev.CreatedEvent as Record<string, unknown> | undefined;
    if (created?.contractId) {
      out.push({
        contractId: String(created.contractId),
        createArgument: created.createArgument as Record<string, unknown>,
        createdAt: String(created.createdAt ?? ''),
        templateId: created.templateId != null ? String(created.templateId) : undefined,
      });
    }
  }
  return out;
}

function extractTxMeta(result: Record<string, unknown>): { updateId?: string; offset?: number } {
  const tx = result.transaction as Record<string, unknown> | undefined;
  const updateId = tx?.updateId ?? result.updateId;
  const offset = tx?.offset ?? result.offset;
  return {
    updateId: updateId != null ? String(updateId) : undefined,
    offset: offset != null ? Number(offset) : undefined,
  };
}
