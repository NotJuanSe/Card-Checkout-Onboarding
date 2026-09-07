import { DomainError } from '../../shared/core/domain-error';
import { Result } from '../../shared/core/result';
import { CustomersController } from './customers.controller';

describe('CustomersController', () => {
  const getCustomer = { execute: jest.fn() };
  const controller = new CustomersController(getCustomer as never);

  it('devuelve el cliente', async () => {
    getCustomer.execute.mockResolvedValue(Result.ok({ id: 'c1' }));
    await expect(controller.findOne('c1')).resolves.toEqual({ id: 'c1' });
  });

  it('responde 404 si no existe', async () => {
    getCustomer.execute.mockResolvedValue(Result.err(DomainError.notFound('x')));
    await expect(controller.findOne('x')).rejects.toMatchObject({ status: 404 });
  });
});
