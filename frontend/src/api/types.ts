export interface Product {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  stock: number;
}

export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export interface Transaction {
  id: string;
  reference: string;
  productId: string;
  quantity: number;
  productAmountCents: number;
  baseFeeCents: number;
  deliveryFeeCents: number;
  totalAmountCents: number;
  currency: string;
  status: TransactionStatus;
  failureReason: string | null;
}

export interface CustomerForm {
  fullName: string;
  email: string;
  phone: string;
  legalId: string;
}

export interface DeliveryForm {
  address: string;
  city: string;
  region: string;
  postalCode?: string;
}
