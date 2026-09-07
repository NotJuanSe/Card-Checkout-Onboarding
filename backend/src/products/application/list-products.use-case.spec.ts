import { ProductRepositoryPort } from '../domain/product-repository.port';
import { ListProductsUseCase } from './list-products.use-case';

describe('ListProductsUseCase', () => {
  const products = [{ id: 'p1' }] as never;
  let repository: jest.Mocked<ProductRepositoryPort>;

  beforeEach(() => {
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      decrementStock: jest.fn(),
    };
  });

  it('devuelve el catálogo', async () => {
    repository.findAll.mockResolvedValue(products);
    const result = await new ListProductsUseCase(repository).execute();
    expect(result.unwrap()).toBe(products);
  });

  it('convierte una caída del repositorio en error de dominio', async () => {
    repository.findAll.mockRejectedValue(new Error('db caída'));
    const result = await new ListProductsUseCase(repository).execute();
    expect(result.unwrapErr().code).toBe('GATEWAY_ERROR');
  });
});
