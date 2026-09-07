import { DomainError } from '../../shared/core/domain-error';
import { Result } from '../../shared/core/result';
import { ProductsController } from './products.controller';

describe('ProductsController', () => {
  const listProducts = { execute: jest.fn() } as never;
  const getProduct = { execute: jest.fn() } as never;
  const controller = new ProductsController(listProducts, getProduct);

  it('devuelve el catálogo', async () => {
    (listProducts as { execute: jest.Mock }).execute.mockResolvedValue(
      Result.ok([{ id: 'p1' }]),
    );
    await expect(controller.findAll()).resolves.toEqual([{ id: 'p1' }]);
  });

  it('traduce el error de dominio a excepción HTTP', async () => {
    (listProducts as { execute: jest.Mock }).execute.mockResolvedValue(
      Result.err(DomainError.gateway('db caída')),
    );
    await expect(controller.findAll()).rejects.toMatchObject({ status: 502 });
  });

  it('devuelve un producto y 404 cuando no existe', async () => {
    (getProduct as { execute: jest.Mock }).execute.mockResolvedValue(
      Result.ok({ id: 'p1' }),
    );
    await expect(controller.findOne('p1')).resolves.toEqual({ id: 'p1' });

    (getProduct as { execute: jest.Mock }).execute.mockResolvedValue(
      Result.err(DomainError.notFound('no existe')),
    );
    await expect(controller.findOne('x')).rejects.toMatchObject({ status: 404 });
  });
});
