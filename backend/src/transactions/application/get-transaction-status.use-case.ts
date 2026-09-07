import { Inject, Injectable } from '@nestjs/common';
import {
  DELIVERY_REPOSITORY,
  DeliveryRepositoryPort,
} from '../../deliveries/domain/delivery-repository.port';
import {
  PRODUCT_REPOSITORY,
  ProductRepositoryPort,
} from '../../products/domain/product-repository.port';
import { DomainError } from '../../shared/core/domain-error';
import { Result } from '../../shared/core/result';
import {
  PAYMENT_GATEWAY,
  PaymentGatewayPort,
} from '../domain/payment-gateway.port';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepositoryPort,
} from '../domain/transaction-repository.port';
import { isTerminal, Transaction } from '../domain/transaction.entity';

/**
 * Consulta el estado de la transacción. Si sigue pendiente, pregunta a la
 * pasarela (fuente de verdad) y, cuando queda aprobada, descuenta stock y
 * asigna la entrega. Nunca confía en un estado enviado por el cliente.
 */
@Injectable()
export class GetTransactionStatusUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepositoryPort,
    @Inject(PAYMENT_GATEWAY)
    private readonly gateway: PaymentGatewayPort,
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepositoryPort,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveries: DeliveryRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<Transaction, DomainError>> {
    const transaction = await this.transactions.findById(id);
    if (!transaction) {
      return Result.err(DomainError.notFound(`Transacción ${id} no existe`));
    }
    if (isTerminal(transaction.status) || !transaction.gatewayTransactionId) {
      return Result.ok(transaction);
    }

    const status = await this.gateway.fetchStatus(
      transaction.gatewayTransactionId,
    );
    if (status.isErr) {
      return Result.ok(transaction);
    }

    const charge = status.unwrap();
    if (!isTerminal(charge.status)) {
      return Result.ok(transaction);
    }

    return Result.ok(
      charge.status === 'APPROVED'
        ? await this.settleApproved(transaction)
        : await this.settleRejected(transaction, charge.status, charge.failureReason),
    );
  }

  private async settleApproved(
    transaction: Transaction,
  ): Promise<Transaction> {
    const stockUpdated = await this.products.decrementStock(
      transaction.productId,
      transaction.quantity,
    );

    if (!stockUpdated) {
      // El pago se aprobó pero el stock se agotó: queda registrado para gestión manual.
      await this.deliveries.updateStatus(transaction.deliveryId, 'CANCELLED');
      return this.transactions.update(transaction.id, {
        status: 'APPROVED',
        failureReason: 'STOCK_UNAVAILABLE_AFTER_PAYMENT',
      });
    }

    await this.deliveries.updateStatus(transaction.deliveryId, 'ASSIGNED');
    return this.transactions.update(transaction.id, {
      status: 'APPROVED',
      failureReason: null,
    });
  }

  private async settleRejected(
    transaction: Transaction,
    status: 'DECLINED' | 'ERROR' | 'PENDING' | 'APPROVED',
    failureReason: string | null,
  ): Promise<Transaction> {
    await this.deliveries.updateStatus(transaction.deliveryId, 'CANCELLED');
    return this.transactions.update(transaction.id, {
      status: status === 'DECLINED' ? 'DECLINED' : 'ERROR',
      failureReason,
    });
  }
}
