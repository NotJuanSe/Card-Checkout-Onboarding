import { PrismaDeliveryRepository } from './prisma-delivery.repository';

describe('PrismaDeliveryRepository', () => {
  const prisma = {
    delivery: {
      create: jest.fn().mockResolvedValue({ id: 'd1' }),
      findUnique: jest.fn().mockResolvedValue({ id: 'd1' }),
      update: jest.fn().mockResolvedValue({ id: 'd1', status: 'ASSIGNED' }),
    },
  };
  const repository = new PrismaDeliveryRepository(prisma as never);

  it('crea la entrega normalizando el código postal ausente', async () => {
    await repository.create({
      customerId: 'c1',
      address: 'Calle 1',
      city: 'Bogotá',
      region: 'Cundinamarca',
      feeCents: 1000000,
    });
    expect(prisma.delivery.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ postalCode: null }),
    });
  });

  it('busca por id y actualiza el estado', async () => {
    await expect(repository.findById('d1')).resolves.toEqual({ id: 'd1' });
    await expect(repository.updateStatus('d1', 'ASSIGNED')).resolves.toMatchObject({
      status: 'ASSIGNED',
    });
  });
});
