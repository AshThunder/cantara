export function templates() {
  // ACS filters require package-name format with leading '#'
  const name = '#cantara';
  return {
    Payment: `${name}:Cantara.Payments.Payment:Payment`,
    RefundedPayment: `${name}:Cantara.Payments.Payment:RefundedPayment`,
    PaymentRequest: `${name}:Cantara.Payments.PaymentRequest:PaymentRequest`,
    Subscription: `${name}:Cantara.Payments.Subscription:Subscription`,
    PaymentBatchProposal: `${name}:Cantara.Payments.PaymentBatch:PaymentBatchProposal`,
    InvoiceProposal: `${name}:Cantara.Invoices.Invoice:InvoiceProposal`,
    Invoice: `${name}:Cantara.Invoices.Invoice:Invoice`,
    AttestedInvoice: `${name}:Cantara.Invoices.Invoice:AttestedInvoice`,
    FinancingOffer: `${name}:Cantara.Invoices.Financing:FinancingOffer`,
    FinancedInvoice: `${name}:Cantara.Invoices.Financing:FinancedInvoice`,
    SettledInvoice: `${name}:Cantara.Invoices.Financing:SettledInvoice`,
  } as const;
}

export type TemplateName = keyof ReturnType<typeof templates>;

/** Package-name form — use for ACS queries. */
export function tpl(_config: { packageId: string }, name: TemplateName): string {
  return templates()[name];
}

/** Package-id form — use for create/exercise commands. */
export function tplById(config: { packageId: string }, name: TemplateName): string {
  const map = {
    Payment: `${config.packageId}:Cantara.Payments.Payment:Payment`,
    RefundedPayment: `${config.packageId}:Cantara.Payments.Payment:RefundedPayment`,
    PaymentRequest: `${config.packageId}:Cantara.Payments.PaymentRequest:PaymentRequest`,
    Subscription: `${config.packageId}:Cantara.Payments.Subscription:Subscription`,
    PaymentBatchProposal: `${config.packageId}:Cantara.Payments.PaymentBatch:PaymentBatchProposal`,
    InvoiceProposal: `${config.packageId}:Cantara.Invoices.Invoice:InvoiceProposal`,
    Invoice: `${config.packageId}:Cantara.Invoices.Invoice:Invoice`,
    AttestedInvoice: `${config.packageId}:Cantara.Invoices.Invoice:AttestedInvoice`,
    FinancingOffer: `${config.packageId}:Cantara.Invoices.Financing:FinancingOffer`,
    FinancedInvoice: `${config.packageId}:Cantara.Invoices.Financing:FinancedInvoice`,
    SettledInvoice: `${config.packageId}:Cantara.Invoices.Financing:SettledInvoice`,
  } as const;
  return map[name];
}

/** RelTime as Daml JSON object `{ microseconds }`. */
export function daysToRelTime(days: number): { microseconds: string } {
  return {
    microseconds: String(Math.trunc(days * 24 * 60 * 60 * 1_000_000)),
  };
}
