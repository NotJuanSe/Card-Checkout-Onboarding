import { Transaction, TransactionStatus } from './transaction.entity';

export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');

export interface CreateTransactionData {
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
}

export interface UpdateTransactionData {
  status?: TransactionStatus;
  gatewayTransactionId?: string | null;
  failureReason?: string | null;
}

export interface TransactionRepositoryPort {
  create(data: CreateTransactionData): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  update(id: string, data: UpdateTransactionData): Promise<Transaction>;
}
