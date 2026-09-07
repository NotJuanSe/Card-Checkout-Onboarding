import axios from 'axios';
import { config } from '../config';
import type {
  CustomerForm,
  DeliveryForm,
  Product,
  Transaction,
} from './types';

const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 20000,
});

export interface CreateTransactionPayload {
  productId: string;
  quantity: number;
  customer: CustomerForm;
  delivery: DeliveryForm;
  cardToken: string;
  installments: number;
}

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/products');
  return data;
}

export async function createTransaction(
  payload: CreateTransactionPayload,
): Promise<Transaction> {
  const { data } = await api.post<Transaction>('/transactions', payload);
  return data;
}

export interface AmountBreakdown {
  productAmountCents: number;
  baseFeeCents: number;
  deliveryFeeCents: number;
  totalAmountCents: number;
}

export async function quoteTransaction(payload: {
  productId: string;
  quantity: number;
  city: string;
}): Promise<AmountBreakdown> {
  const { data } = await api.post<AmountBreakdown>('/transactions/quote', payload);
  return data;
}

export async function fetchTransaction(id: string): Promise<Transaction> {
  const { data } = await api.get<Transaction>(`/transactions/${id}`);
  return data;
}
