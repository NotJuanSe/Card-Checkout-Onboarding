import { ConfigService } from '@nestjs/config';
import { ProductRepositoryPort } from '../../products/domain/product-repository.port';
import { QuoteTransactionUseCase } from './quote-transaction.use-case';

const product = {
  id: 'p1',
  name: 'Audífonos',
  description: 'desc',
  priceCents: 100000,
  imageUrl: 'http://img',
  stock: 5,
};

describe('QuoteTransactionUseCase', () => {
  let products: jest.Mocked<ProductRepositoryPort>;

  const buildUseCase = (baseFee: string): QuoteTransactionUseCase =>
    new QuoteTransactionUseCase(
      products,
      new ConfigService({ BASE_FEE_CENTS: baseFee }),
    );

  beforeEach(() => {
    products = {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValue(product),
      decrementStock: jest.fn(),
    };
  });

  it('desglosa producto, fee base y envío', async () => {
    const result = await buildUseCase('500000').execute({
      productId: 'p1',
      quantity: 2,
      city: 'Bogotá',
    });

    expect(result.unwrap()).toEqual({
      productAmountCents: 200000,
      baseFeeCents: 500000,
      deliveryFeeCents: 1000000,
      totalAmountCents: 1700000,
    });
  });

  it('usa el fee base por defecto si la config es inválida', async () => {
    const result = await buildUseCase('abc').execute({
      productId: 'p1',
      quantity: 1,
      city: 'Leticia',
    });

    expect(result.unwrap()).toMatchObject({
      baseFeeCents: 500000,
      deliveryFeeCents: 1800000,
    });
  });

  it('devuelve NOT_FOUND si el producto no existe', async () => {
    products.findById.mockResolvedValue(null);
    const result = await buildUseCase('500000').execute({
      productId: 'x',
      quantity: 1,
      city: 'Bogotá',
    });
    expect(result.unwrapErr().code).toBe('NOT_FOUND');
  });

  it('devuelve INSUFFICIENT_STOCK si no alcanzan las unidades', async () => {
    const result = await buildUseCase('500000').execute({
      productId: 'p1',
      quantity: 99,
      city: 'Bogotá',
    });
    expect(result.unwrapErr().code).toBe('INSUFFICIENT_STOCK');
  });
});
