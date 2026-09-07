export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export const TERMINAL_STATUSES: TransactionStatus[] = [
  'APPROVED',
  'DECLINED',
  'ERROR',
];

export interface Transaction {
  id: string;
  reference: string;
  productId: string;
  quantity: number;
  customerId: string;
  deliveryId: string;
  productAmountCents: number;
  baseFeeCents: number;
  deliveryFeeCents: number;
  totalAmountCents: number;
  currency: string;
  status: string;
  gatewayTransactionId: string | null;
  failureReason: string | null;
}

export interface AmountBreakdown {
  productAmountCents: number;
  baseFeeCents: number;
  deliveryFeeCents: number;
  totalAmountCents: number;
}

export function calculateAmounts(
  unitPriceCents: number,
  quantity: number,
  baseFeeCents: number,
  deliveryFeeCents: number,
): AmountBreakdown {
  const productAmountCents = unitPriceCents * quantity;
  return {
    productAmountCents,
    baseFeeCents,
    deliveryFeeCents,
    totalAmountCents: productAmountCents + baseFeeCents + deliveryFeeCents,
  };
}

export function isTerminal(status: string): boolean {
  return TERMINAL_STATUSES.includes(status as TransactionStatus);
}

/** Referencia única legible que viaja a la pasarela y sirve de clave de idempotencia. */
export function buildReference(now: Date, random: string): string {
  return `ORD-${now.getTime()}-${random.toUpperCase()}`;
}
