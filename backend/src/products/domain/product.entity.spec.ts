import { hasEnoughStock, Product, productAmountCents } from './product.entity';

const product: Product = {
  id: 'p1',
  name: 'Audífonos',
  description: 'desc',
  priceCents: 1000,
  imageUrl: 'http://img',
  stock: 3,
};

describe('Product', () => {
  it('acepta cantidades dentro del stock', () => {
    expect(hasEnoughStock(product, 3)).toBe(true);
  });

  it('rechaza cantidades mayores al stock o no positivas', () => {
    expect(hasEnoughStock(product, 4)).toBe(false);
    expect(hasEnoughStock(product, 0)).toBe(false);
    expect(hasEnoughStock({ ...product, stock: 0 }, 1)).toBe(false);
  });

  it('calcula el monto del producto por cantidad', () => {
    expect(productAmountCents(product, 2)).toBe(2000);
  });
});
