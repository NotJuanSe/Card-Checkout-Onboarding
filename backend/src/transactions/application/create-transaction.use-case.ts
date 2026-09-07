import { randomBytes } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepositoryPort,
} from '../../customers/domain/customer-repository.port';
import { validateCustomer } from '../../customers/domain/customer.entity';
import {
  DELIVERY_REPOSITORY,
  DeliveryRepositoryPort,
} from '../../deliveries/domain/delivery-repository.port';
import {
  deliveryFeeCents,
  validateDelivery,
} from '../../deliveries/domain/delivery.entity';
import {
  PRODUCT_REPOSITORY,
  ProductRepositoryPort,
} from '../../products/domain/product-repository.port';
import { hasEnoughStock } from '../../products/domain/product.entity';
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
import {
  buildReference,
  calculateAmounts,
  Transaction,
} from '../domain/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

const DEFAULT_BASE_FEE_CENTS = 500000;
const CURRENCY = 'COP';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepositoryPort,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: CustomerRepositoryPort,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveries: DeliveryRepositoryPort,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepositoryPort,
    @Inject(PAYMENT_GATEWAY)
    private readonly gateway: PaymentGatewayPort,
    private readonly config: ConfigService,
  ) {}

  async execute(
    input: CreateTransactionDto,
  ): Promise<Result<Transaction, DomainError>> {
    const validation = this.validate(input);
    if (validation.isErr) {
      return Result.err(validation.unwrapErr());
    }

    const product = await this.products.findById(input.productId);
    if (!product) {
      return Result.err(
        DomainError.notFound(`Producto ${input.productId} no existe`),
      );
    }
    if (!hasEnoughStock(product, input.quantity)) {
      return Result.err(
        DomainError.insufficientStock(
          `Solo quedan ${product.stock} unidades de ${product.name}`,
        ),
      );
    }

    const feeCents = deliveryFeeCents(input.delivery.city);
    const amounts = calculateAmounts(
      product.priceCents,
      input.quantity,
      this.baseFeeCents(),
      feeCents,
    );

    const customer = await this.customers.findOrCreateByEmail(input.customer);
    const delivery = await this.deliveries.create({
      customerId: customer.id,
      address: input.delivery.address,
      city: input.delivery.city,
      region: input.delivery.region,
      postalCode: input.delivery.postalCode ?? null,
      feeCents,
    });

    const transaction = await this.transactions.create({
      reference: buildReference(new Date(), randomBytes(4).toString('hex')),
      productId: product.id,
      quantity: input.quantity,
      customerId: customer.id,
      deliveryId: delivery.id,
      currency: CURRENCY,
      ...amounts,
    });

    const charge = await this.gateway.charge({
      reference: transaction.reference,
      amountCents: transaction.totalAmountCents,
      currency: transaction.currency,
      customerEmail: customer.email,
      cardToken: input.cardToken,
      installments: input.installments ?? 1,
    });

    if (charge.isErr) {
      const error = charge.unwrapErr();
      const failed = await this.transactions.update(transaction.id, {
        status: 'ERROR',
        failureReason: error.message,
      });
      await this.deliveries.updateStatus(delivery.id, 'CANCELLED');
      return Result.ok(failed);
    }

    const result = charge.unwrap();
    const updated = await this.transactions.update(transaction.id, {
      status: result.status,
      gatewayTransactionId: result.gatewayTransactionId,
      failureReason: result.failureReason,
    });
    return Result.ok(updated);
  }

  private baseFeeCents(): number {
    const raw = this.config.get<string>('BASE_FEE_CENTS');
    const parsed = Number.parseInt(raw ?? '', 10);
    return Number.isFinite(parsed) && parsed >= 0
      ? parsed
      : DEFAULT_BASE_FEE_CENTS;
  }

  private validate(input: CreateTransactionDto): Result<true, DomainError> {
    const errors = [
      ...validateCustomer(input.customer),
      ...validateDelivery(input.delivery),
    ];
    if (input.quantity < 1) {
      errors.push('La cantidad debe ser al menos 1');
    }
    if (!input.cardToken || input.cardToken.trim().length === 0) {
      errors.push('Falta el token de la tarjeta');
    }
    return errors.length === 0
      ? Result.ok(true)
      : Result.err(DomainError.validation('Datos de la compra inválidos', errors));
  }
}
