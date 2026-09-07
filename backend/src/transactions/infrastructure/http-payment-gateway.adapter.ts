import { createHash } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { DomainError } from '../../shared/core/domain-error';
import { Result } from '../../shared/core/result';
import {
  ChargeInput,
  GatewayCharge,
  PaymentGatewayPort,
} from '../domain/payment-gateway.port';
import { TransactionStatus } from '../domain/transaction.entity';

/** Estados que devuelve la pasarela traducidos a los estados del dominio. */
function mapStatus(raw: string): TransactionStatus {
  switch (raw) {
    case 'APPROVED':
      return 'APPROVED';
    case 'DECLINED':
    case 'VOIDED':
      return 'DECLINED';
    case 'PENDING':
      return 'PENDING';
    default:
      return 'ERROR';
  }
}

/**
 * Adaptador HTTP hacia la pasarela de pagos en modo sandbox. Es el único lugar
 * que conoce las llaves y el formato del proveedor; el dominio solo ve el puerto.
 */
@Injectable()
export class HttpPaymentGatewayAdapter implements PaymentGatewayPort {
  private readonly logger = new Logger(HttpPaymentGatewayAdapter.name);
  private readonly http: AxiosInstance;

  constructor(private readonly config: ConfigService) {
    this.http = axios.create({
      baseURL: this.config.get<string>('PAYMENT_GATEWAY_BASE_URL'),
      timeout: 15000,
    });
  }

  async charge(input: ChargeInput): Promise<Result<GatewayCharge, DomainError>> {
    const acceptanceToken = await this.acceptanceToken();
    if (acceptanceToken.isErr) {
      return Result.err(acceptanceToken.unwrapErr());
    }

    try {
      const { data } = await this.http.post(
        '/transactions',
        {
          acceptance_token: acceptanceToken.unwrap(),
          amount_in_cents: input.amountCents,
          currency: input.currency,
          customer_email: input.customerEmail,
          reference: input.reference,
          signature: this.signature(input),
          payment_method: {
            type: 'CARD',
            token: input.cardToken,
            installments: input.installments,
          },
        },
        { headers: { Authorization: `Bearer ${this.privateKey()}` } },
      );
      return Result.ok(this.toCharge(data?.data));
    } catch (error) {
      return this.fail('No se pudo iniciar el pago con la pasarela', error);
    }
  }

  async fetchStatus(
    gatewayTransactionId: string,
  ): Promise<Result<GatewayCharge, DomainError>> {
    try {
      const { data } = await this.http.get(
        `/transactions/${gatewayTransactionId}`,
        { headers: { Authorization: `Bearer ${this.privateKey()}` } },
      );
      return Result.ok(this.toCharge(data?.data));
    } catch (error) {
      return this.fail('No se pudo consultar el estado del pago', error);
    }
  }

  /** Token de aceptación de términos que la pasarela exige por transacción. */
  private async acceptanceToken(): Promise<Result<string, DomainError>> {
    try {
      const { data } = await this.http.get(
        `/merchants/${this.config.get<string>('PAYMENT_GATEWAY_PUBLIC_KEY')}`,
      );
      const token = data?.data?.presigned_acceptance?.acceptance_token;
      return token
        ? Result.ok(token)
        : Result.err(
            DomainError.gateway('La pasarela no devolvió token de aceptación'),
          );
    } catch (error) {
      return this.fail('No se pudo obtener el token de aceptación', error);
    }
  }

  private signature(input: ChargeInput): string {
    const secret = this.config.get<string>('PAYMENT_GATEWAY_INTEGRITY_SECRET');
    return createHash('sha256')
      .update(
        `${input.reference}${input.amountCents}${input.currency}${secret ?? ''}`,
      )
      .digest('hex');
  }

  private privateKey(): string {
    return this.config.get<string>('PAYMENT_GATEWAY_PRIVATE_KEY') ?? '';
  }

  private toCharge(payload: {
    id?: string;
    status?: string;
    status_message?: string | null;
  }): GatewayCharge {
    return {
      gatewayTransactionId: payload?.id ?? '',
      status: mapStatus(payload?.status ?? ''),
      failureReason: payload?.status_message ?? null,
    };
  }

  private fail<T>(message: string, error: unknown): Result<T, DomainError> {
    const detail = axios.isAxiosError(error)
      ? (error.response?.data ?? error.message)
      : error;
    this.logger.error(`${message}: ${JSON.stringify(detail)}`);
    return Result.err(DomainError.gateway(message, detail));
  }
}
