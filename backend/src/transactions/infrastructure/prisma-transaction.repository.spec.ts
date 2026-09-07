import { PrismaTransactionRepository } from './prisma-transaction.repository';

describe('PrismaTransactionRepository', () => {
  const prisma = {
    transaction: {
      create: jest.fn().mockResolvedValue({ id: 't1' }),
      findUnique: jest.fn().mockResolvedValue({ id: 't1' }),
      update: jest.fn().mockResolvedValue({ id: 't1', status: 'APPROVED' }),
    },
  };
  const repository = new PrismaTransactionRepository(prisma as never);

  it('crea, busca y actualiza transacciones', async () => {
    const data = { reference: 'ORD-1-AAA' } as never;
    await expect(repository.create(data)).resolves.toEqual({ id: 't1' });
    await expect(repository.findById('t1')).resolves.toEqual({ id: 't1' });
    await expect(repository.update('t1', { status: 'APPROVED' })).resolves.toMatchObject(
      { status: 'APPROVED' },
    );
    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: { status: 'APPROVED' },
    });
  });
});
