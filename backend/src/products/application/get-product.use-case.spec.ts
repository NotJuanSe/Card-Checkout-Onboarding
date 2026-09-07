import { ProductRepositoryPort } from '../domain/product-repository.port';
import { GetProductUseCase } from './get-product.use-case';

describe('GetProductUseCase', () => {
  const repository: jest.Mocked<ProductRepositoryPort> = {
    findAll: jest.fn(),
    findById: jest.fn(),
    decrementStock: jest.fn(),
  };

  it('devuelve el producto encontrado', async () => {
    const product = { id: 'p1' } as never;
    repository.findById.mockResolvedValue(product);
    const result = await new GetProductUseCase(repository).execute('p1');
    expect(result.unwrap()).toBe(product);
  });

  it('devuelve NOT_FOUND cuando no existe', async () => {
    repository.findById.mockResolvedValue(null);
    const result = await new GetProductUseCase(repository).execute('nope');
    expect(result.unwrapErr().code).toBe('NOT_FOUND');
  });
});
