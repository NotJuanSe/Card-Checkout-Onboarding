import { DomainError } from '../../shared/core/domain-error';
import { Result } from '../../shared/core/result';
import { TransactionStatus } from './transaction.entity';

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export interface ChargeInput {
  reference: string;
  amountCents: number;
  currency: string;
  customerEmail: string;
  cardToken: string;
  installments: number;
}

export interface GatewayCharge {
  gatewayTransactionId: string;
  status: TransactionStatus;
  failureReason: string | null;
}

/**
 * Puerto de salida hacia la pasarela de pagos. El dominio no conoce HTTP ni el
 * proveedor concreto: solo este contrato.
 */
export interface PaymentGatewayPort {
  charge(input: ChargeInput): Promise<Result<GatewayCharge, DomainError>>;
  fetchStatus(
    gatewayTransactionId: string,
  ): Promise<Result<GatewayCharge, DomainError>>;
}
