import { DeliveryRepositoryPort } from '../domain/delivery-repository.port';
import { GetDeliveryUseCase } from './get-delivery.use-case';

describe('GetDeliveryUseCase', () => {
  const repository: jest.Mocked<DeliveryRepositoryPort> = {
    create: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
  };

  it('devuelve la entrega', async () => {
    const delivery = { id: 'd1' } as never;
    repository.findById.mockResolvedValue(delivery);
    expect((await new GetDeliveryUseCase(repository).execute('d1')).unwrap()).toBe(
      delivery,
    );
  });

  it('devuelve NOT_FOUND si no existe', async () => {
    repository.findById.mockResolvedValue(null);
    const result = await new GetDeliveryUseCase(repository).execute('x');
    expect(result.unwrapErr().code).toBe('NOT_FOUND');
  });
});
