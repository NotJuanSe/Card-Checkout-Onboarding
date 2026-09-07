import { CustomerRepositoryPort } from '../domain/customer-repository.port';
import { GetCustomerUseCase } from './get-customer.use-case';

describe('GetCustomerUseCase', () => {
  const repository: jest.Mocked<CustomerRepositoryPort> = {
    findById: jest.fn(),
    findOrCreateByEmail: jest.fn(),
  };

  it('devuelve el cliente', async () => {
    const customer = { id: 'c1' } as never;
    repository.findById.mockResolvedValue(customer);
    expect((await new GetCustomerUseCase(repository).execute('c1')).unwrap()).toBe(
      customer,
    );
  });

  it('devuelve NOT_FOUND si no existe', async () => {
    repository.findById.mockResolvedValue(null);
    const result = await new GetCustomerUseCase(repository).execute('x');
    expect(result.unwrapErr().code).toBe('NOT_FOUND');
  });
});
