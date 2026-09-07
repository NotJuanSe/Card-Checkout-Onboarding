import { DomainError } from '../../shared/core/domain-error';
import { Result } from '../../shared/core/result';
import { CreateTransactionDto } from '../application/dto/create-transaction.dto';
import { TransactionsController } from './transactions.controller';

describe('TransactionsController', () => {
  const createTransaction = { execute: jest.fn() };
  const getStatus = { execute: jest.fn() };
  const quoteTransaction = { execute: jest.fn() };
  const controller = new TransactionsController(
    createTransaction as never,
    getStatus as never,
    quoteTransaction as never,
  );
  const dto = { productId: 'p1' } as CreateTransactionDto;

  it('crea la transacción', async () => {
    createTransaction.execute.mockResolvedValue(Result.ok({ id: 't1' }));
    await expect(controller.create(dto)).resolves.toEqual({ id: 't1' });
  });

  it('responde 400 con datos inválidos', async () => {
    createTransaction.execute.mockResolvedValue(
      Result.err(DomainError.validation('malos datos')),
    );
    await expect(controller.create(dto)).rejects.toMatchObject({ status: 400 });
  });

  it('responde 409 si no hay stock', async () => {
    createTransaction.execute.mockResolvedValue(
      Result.err(DomainError.insufficientStock('sin stock')),
    );
    await expect(controller.create(dto)).rejects.toMatchObject({ status: 409 });
  });

  it('devuelve el estado de la transacción', async () => {
    getStatus.execute.mockResolvedValue(Result.ok({ id: 't1', status: 'APPROVED' }));
    await expect(controller.findOne('t1')).resolves.toMatchObject({
      status: 'APPROVED',
    });
  });

  it('responde 404 si la transacción no existe', async () => {
    getStatus.execute.mockResolvedValue(Result.err(DomainError.notFound('x')));
    await expect(controller.findOne('x')).rejects.toMatchObject({ status: 404 });
  });

  it('devuelve el desglose de la cotización', async () => {
    quoteTransaction.execute.mockResolvedValue(
      Result.ok({ totalAmountCents: 1700000 }),
    );
    await expect(
      controller.quote({ productId: 'p1', quantity: 1, city: 'Bogotá' }),
    ).resolves.toMatchObject({ totalAmountCents: 1700000 });
  });

  it('responde 409 al cotizar sin stock', async () => {
    quoteTransaction.execute.mockResolvedValue(
      Result.err(DomainError.insufficientStock('sin stock')),
    );
    await expect(
      controller.quote({ productId: 'p1', quantity: 99, city: 'Bogotá' }),
    ).rejects.toMatchObject({ status: 409 });
  });
});
