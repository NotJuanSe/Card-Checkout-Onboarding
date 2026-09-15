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
  vatCents: number;
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
  vatCents: number;
  baseFeeCents: number;
  deliveryFeeCents: number;
  totalAmountCents: number;
}

/** IVA general en Colombia. */
export const DEFAULT_VAT_RATE = 0.19;

export function calculateAmounts(
  unitPriceCents: number,
  quantity: number,
  baseFeeCents: number,
  deliveryFeeCents: number,
  vatRate: number = DEFAULT_VAT_RATE,
): AmountBreakdown {
  const productAmountCents = unitPriceCents * quantity;
  // El IVA grava el precio base del producto. Se redondea a centavos enteros
  // para que la suma del desglose cuadre exactamente con el total cobrado.
  const vatCents = Math.round(productAmountCents * vatRate);

  return {
    productAmountCents,
    vatCents,
    baseFeeCents,
    deliveryFeeCents,
    totalAmountCents:
      productAmountCents + vatCents + baseFeeCents + deliveryFeeCents,
  };
}

export function isTerminal(status: string): boolean {
  return TERMINAL_STATUSES.includes(status as TransactionStatus);
}

/** Referencia única legible que viaja a la pasarela y sirve de clave de idempotencia. */
export function buildReference(now: Date, random: string): string {
  return `ORD-${now.getTime()}-${random.toUpperCase()}`;
}
