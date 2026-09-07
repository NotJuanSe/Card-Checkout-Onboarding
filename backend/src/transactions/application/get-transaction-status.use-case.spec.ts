import { DeliveryRepositoryPort } from '../../deliveries/domain/delivery-repository.port';
import { ProductRepositoryPort } from '../../products/domain/product-repository.port';
import { DomainError } from '../../shared/core/domain-error';
import { Result } from '../../shared/core/result';
import { PaymentGatewayPort } from '../domain/payment-gateway.port';
import { TransactionRepositoryPort } from '../domain/transaction-repository.port';
import { Transaction } from '../domain/transaction.entity';
import { GetTransactionStatusUseCase } from './get-transaction-status.use-case';

const pendingTransaction = {
  id: 't1',
  reference: 'ORD-1-AAA',
  productId: 'p1',
  quantity: 2,
  customerId: 'c1',
  deliveryId: 'd1',
  productAmountCents: 200000,
  baseFeeCents: 500000,
  deliveryFeeCents: 1000000,
  totalAmountCents: 1700000,
  currency: 'COP',
  status: 'PENDING',
  gatewayTransactionId: 'gw-1',
  failureReason: null,
} as Transaction;

describe('GetTransactionStatusUseCase', () => {
  let transactions: jest.Mocked<TransactionRepositoryPort>;
  let gateway: jest.Mocked<PaymentGatewayPort>;
  let products: jest.Mocked<ProductRepositoryPort>;
  let deliveries: jest.Mocked<DeliveryRepositoryPort>;
  let useCase: GetTransactionStatusUseCase;

  beforeEach(() => {
    transactions = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(pendingTransaction),
      update: jest
        .fn()
        .mockImplementation(
          async (id, data) => ({ ...pendingTransaction, id, ...data }) as never,
        ),
    };
    gateway = { charge: jest.fn(), fetchStatus: jest.fn() };
    products = {
      findAll: jest.fn(),
      findById: jest.fn(),
      decrementStock: jest.fn().mockResolvedValue({ id: 'p1', stock: 3 } as never),
    };
    deliveries = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn().mockResolvedValue({ id: 'd1' } as never),
    };
    useCase = new GetTransactionStatusUseCase(
      transactions,
      gateway,
      products,
      deliveries,
    );
  });

  it('devuelve NOT_FOUND si la transacción no existe', async () => {
    transactions.findById.mockResolvedValue(null);
    const result = await useCase.execute('nope');
    expect(result.unwrapErr().code).toBe('NOT_FOUND');
  });

  it('no reconsulta la pasarela si la transacción ya está en estado final', async () => {
    transactions.findById.mockResolvedValue({
      ...pendingTransaction,
      status: 'APPROVED',
    });
    const result = await useCase.execute('t1');
    expect(gateway.fetchStatus).not.toHaveBeenCalled();
    expect(result.unwrap().status).toBe('APPROVED');
  });

  it('no reconsulta si nunca llegó a existir en la pasarela', async () => {
    transactions.findById.mockResolvedValue({
      ...pendingTransaction,
      gatewayTransactionId: null,
    });
    await useCase.execute('t1');
    expect(gateway.fetchStatus).not.toHaveBeenCalled();
  });

  it('mantiene el estado local si la pasarela no responde', async () => {
    gateway.fetchStatus.mockResolvedValue(
      Result.err(DomainError.gateway('timeout')),
    );
    const result = await useCase.execute('t1');
    expect(result.unwrap().status).toBe('PENDING');
    expect(transactions.update).not.toHaveBeenCalled();
  });

  it('sigue en PENDING mientras la pasarela no dé un estado final', async () => {
    gateway.fetchStatus.mockResolvedValue(
      Result.ok({
        gatewayTransactionId: 'gw-1',
        status: 'PENDING',
        failureReason: null,
      }),
    );
    const result = await useCase.execute('t1');
    expect(result.unwrap().status).toBe('PENDING');
    expect(products.decrementStock).not.toHaveBeenCalled();
  });

  it('al aprobarse descuenta stock, asigna la entrega y marca APPROVED', async () => {
    gateway.fetchStatus.mockResolvedValue(
      Result.ok({
        gatewayTransactionId: 'gw-1',
        status: 'APPROVED',
        failureReason: null,
      }),
    );

    const result = await useCase.execute('t1');

    expect(products.decrementStock).toHaveBeenCalledWith('p1', 2);
    expect(deliveries.updateStatus).toHaveBeenCalledWith('d1', 'ASSIGNED');
    expect(result.unwrap().status).toBe('APPROVED');
  });

  it('registra el caso límite de pago aprobado sin stock disponible', async () => {
    gateway.fetchStatus.mockResolvedValue(
      Result.ok({
        gatewayTransactionId: 'gw-1',
        status: 'APPROVED',
        failureReason: null,
      }),
    );
    products.decrementStock.mockResolvedValue(null);

    const result = await useCase.execute('t1');

    expect(deliveries.updateStatus).toHaveBeenCalledWith('d1', 'CANCELLED');
    expect(result.unwrap()).toMatchObject({
      status: 'APPROVED',
      failureReason: 'STOCK_UNAVAILABLE_AFTER_PAYMENT',
    });
  });

  it('al ser rechazada cancela la entrega y no toca el stock', async () => {
    gateway.fetchStatus.mockResolvedValue(
      Result.ok({
        gatewayTransactionId: 'gw-1',
        status: 'DECLINED',
        failureReason: 'Fondos insuficientes',
      }),
    );

    const result = await useCase.execute('t1');

    expect(products.decrementStock).not.toHaveBeenCalled();
    expect(deliveries.updateStatus).toHaveBeenCalledWith('d1', 'CANCELLED');
    expect(result.unwrap()).toMatchObject({
      status: 'DECLINED',
      failureReason: 'Fondos insuficientes',
    });
  });

  it('mapea un fallo de la pasarela a ERROR', async () => {
    gateway.fetchStatus.mockResolvedValue(
      Result.ok({
        gatewayTransactionId: 'gw-1',
        status: 'ERROR',
        failureReason: 'Error interno',
      }),
    );

    const result = await useCase.execute('t1');

    expect(result.unwrap().status).toBe('ERROR');
  });
});
