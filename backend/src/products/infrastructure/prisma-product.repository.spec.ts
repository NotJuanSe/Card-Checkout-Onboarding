import { PrismaProductRepository } from './prisma-product.repository';

describe('PrismaProductRepository', () => {
  const prisma = {
    product: {
      findMany: jest.fn().mockResolvedValue([{ id: 'p1' }]),
      findUnique: jest.fn().mockResolvedValue({ id: 'p1' }),
      updateMany: jest.fn(),
    },
  };
  const repository = new PrismaProductRepository(prisma as never);

  it('lista productos ordenados por nombre', async () => {
    await expect(repository.findAll()).resolves.toEqual([{ id: 'p1' }]);
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    });
  });

  it('busca por id', async () => {
    await expect(repository.findById('p1')).resolves.toEqual({ id: 'p1' });
  });

  it('descuenta stock solo si quedan unidades suficientes', async () => {
    prisma.product.updateMany.mockResolvedValue({ count: 1 });
    await expect(repository.decrementStock('p1', 2)).resolves.toEqual({ id: 'p1' });
    expect(prisma.product.updateMany).toHaveBeenCalledWith({
      where: { id: 'p1', stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    });
  });

  it('devuelve null cuando la guardia de stock impide el descuento', async () => {
    prisma.product.updateMany.mockResolvedValue({ count: 0 });
    await expect(repository.decrementStock('p1', 99)).resolves.toBeNull();
  });
});
