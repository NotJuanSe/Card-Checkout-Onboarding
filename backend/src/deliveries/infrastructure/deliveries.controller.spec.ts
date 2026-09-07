import { DomainError } from '../../shared/core/domain-error';
import { Result } from '../../shared/core/result';
import { DeliveriesController } from './deliveries.controller';

describe('DeliveriesController', () => {
  const getDelivery = { execute: jest.fn() };
  const controller = new DeliveriesController(getDelivery as never);

  it('devuelve la entrega', async () => {
    getDelivery.execute.mockResolvedValue(Result.ok({ id: 'd1' }));
    await expect(controller.findOne('d1')).resolves.toEqual({ id: 'd1' });
  });

  it('responde 404 si no existe', async () => {
    getDelivery.execute.mockResolvedValue(Result.err(DomainError.notFound('x')));
    await expect(controller.findOne('x')).rejects.toMatchObject({ status: 404 });
  });
});
