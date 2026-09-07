import { ConfigService } from '@nestjs/config';
import { CustomerRepositoryPort } from '../../customers/domain/customer-repository.port';
import { DeliveryRepositoryPort } from '../../deliveries/domain/delivery-repository.port';
import { ProductRepositoryPort } from '../../products/domain/product-repository.port';
import { PaymentGatewayPort } from '../domain/payment-gateway.port';
import { TransactionRepositoryPort } from '../domain/transaction-repository.port';
import { Result } from '../../shared/core/result';
import { DomainError } from '../../shared/core/domain-error';
import { CreateTransactionUseCase } from './create-transaction.use-case';
import { CreateTransactionDto } from './dto/create-transaction.dto';

const product = {
  id: 'p1',
  name: 'Audífonos',
  description: 'desc',
  priceCents: 100000,
  imageUrl: 'http://img',
  stock: 5,
};

const dto: CreateTransactionDto = {
  productId: 'p1',
  quantity: 2,
  customer: {
    fullName: 'Ana Gómez',
    email: 'ana@example.com',
    phone: '3001234567',
    legalId: '1020304050',
  },
  delivery: {
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    region: 'Cundinamarca',
  },
  cardToken: 'tok_test_123',
  installments: 1,
};

describe('CreateTransactionUseCase', () => {
  let products: jest.Mocked<ProductRepositoryPort>;
  let customers: jest.Mocked<CustomerRepositoryPort>;
  let deliveries: jest.Mocked<DeliveryRepositoryPort>;
  let transactions: jest.Mocked<TransactionRepositoryPort>;
  let gateway: jest.Mocked<PaymentGatewayPort>;
  let useCase: CreateTransactionUseCase;

  beforeEach(() => {
    products = {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValue(product),
      decrementStock: jest.fn(),
    };
    customers = {
      findById: jest.fn(),
      findOrCreateByEmail: jest
        .fn()
        .mockResolvedValue({ id: 'c1', email: dto.customer.email } as never),
    };
    deliveries = {
      create: jest.fn().mockResolvedValue({ id: 'd1' } as never),
      findById: jest.fn(),
      updateStatus: jest.fn().mockResolvedValue({ id: 'd1' } as never),
    };
    transactions = {
      create: jest.fn().mockResolvedValue({
        id: 't1',
        reference: 'ORD-1-AAA',
        currency: 'COP',
        totalAmountCents: 211000,
        status: 'PENDING',
      } as never),
      findById: jest.fn(),
      update: jest
        .fn()
        .mockImplementation(async (id, data) => ({ id, ...data }) as never),
    };
    gateway = {
      charge: jest.fn(),
      fetchStatus: jest.fn(),
    };
    useCase = new CreateTransactionUseCase(
      products,
      customers,
      deliveries,
      transactions,
      gateway,
      new ConfigService({ BASE_FEE_CENTS: '500000' }),
    );
  });

  it('crea la transacción en PENDING y la actualiza con la respuesta de la pasarela', async () => {
    gateway.charge.mockResolvedValue(
      Result.ok({
        gatewayTransactionId: 'gw-1',
        status: 'PENDING',
        failureReason: null,
      }),
    );

    const result = await useCase.execute(dto);

    expect(transactions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 'p1',
        quantity: 2,
        customerId: 'c1',
        deliveryId: 'd1',
        productAmountCents: 200000,
        baseFeeCents: 500000,
        deliveryFeeCents: 1000000,
        totalAmountCents: 1700000,
      }),
    );
    expect(gateway.charge).toHaveBeenCalledWith(
      expect.objectContaining({ cardToken: 'tok_test_123', installments: 1 }),
    );
    expect(result.unwrap()).toMatchObject({ gatewayTransactionId: 'gw-1' });
  });

  it('no descuenta stock al crear: eso ocurre solo cuando el pago se aprueba', async () => {
    gateway.charge.mockResolvedValue(
      Result.ok({
        gatewayTransactionId: 'gw-1',
        status: 'PENDING',
        failureReason: null,
      }),
    );
    await useCase.execute(dto);
    expect(products.decrementStock).not.toHaveBeenCalled();
  });

  it('rechaza datos de cliente o entrega inválidos antes de tocar la pasarela', async () => {
    const result = await useCase.execute({
      ...dto,
      customer: { ...dto.customer, email: 'no-es-email' },
    });

    expect(result.unwrapErr().code).toBe('VALIDATION_ERROR');
    expect(gateway.charge).not.toHaveBeenCalled();
    expect(transactions.create).not.toHaveBeenCalled();
  });

  it('exige token de tarjeta', async () => {
    const result = await useCase.execute({ ...dto, cardToken: '   ' });
    expect(result.unwrapErr().code).toBe('VALIDATION_ERROR');
  });

  it('devuelve NOT_FOUND si el producto no existe', async () => {
    products.findById.mockResolvedValue(null);
    const result = await useCase.execute(dto);
    expect(result.unwrapErr().code).toBe('NOT_FOUND');
  });

  it('devuelve INSUFFICIENT_STOCK si no alcanzan las unidades', async () => {
    products.findById.mockResolvedValue({ ...product, stock: 1 });
    const result = await useCase.execute(dto);
    expect(result.unwrapErr().code).toBe('INSUFFICIENT_STOCK');
    expect(gateway.charge).not.toHaveBeenCalled();
  });

  it('marca ERROR y cancela la entrega si la pasarela falla', async () => {
    gateway.charge.mockResolvedValue(
      Result.err(DomainError.gateway('pasarela caída')),
    );

    const result = await useCase.execute(dto);

    expect(transactions.update).toHaveBeenCalledWith(
      't1',
      expect.objectContaining({ status: 'ERROR' }),
    );
    expect(deliveries.updateStatus).toHaveBeenCalledWith('d1', 'CANCELLED');
    expect(result.unwrap()).toMatchObject({ status: 'ERROR' });
  });

  it('usa el fee base por defecto si la configuración no es un número', async () => {
    gateway.charge.mockResolvedValue(
      Result.ok({
        gatewayTransactionId: 'gw-1',
        status: 'PENDING',
        failureReason: null,
      }),
    );
    const withoutConfig = new CreateTransactionUseCase(
      products,
      customers,
      deliveries,
      transactions,
      gateway,
      new ConfigService({ BASE_FEE_CENTS: 'no-numero' }),
    );

    await withoutConfig.execute(dto);

    expect(transactions.create).toHaveBeenCalledWith(
      expect.objectContaining({ baseFeeCents: 500000 }),
    );
  });

  it('cobra la tarifa nacional de envío en ciudades no listadas', async () => {
    gateway.charge.mockResolvedValue(
      Result.ok({
        gatewayTransactionId: 'gw-1',
        status: 'PENDING',
        failureReason: null,
      }),
    );

    await useCase.execute({
      ...dto,
      delivery: { ...dto.delivery, city: 'Leticia', region: 'Amazonas' },
    });

    expect(transactions.create).toHaveBeenCalledWith(
      expect.objectContaining({ deliveryFeeCents: 1800000 }),
    );
  });

  it('usa 1 cuota cuando no se envían installments', async () => {
    gateway.charge.mockResolvedValue(
      Result.ok({
        gatewayTransactionId: 'gw-1',
        status: 'PENDING',
        failureReason: null,
      }),
    );

    await useCase.execute({ ...dto, installments: undefined });

    expect(gateway.charge).toHaveBeenCalledWith(
      expect.objectContaining({ installments: 1 }),
    );
  });
});
