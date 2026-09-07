import { PrismaCustomerRepository } from './prisma-customer.repository';

const input = {
  fullName: 'Ana Gómez',
  email: 'ana@example.com',
  phone: '3001234567',
  legalId: '1020304050',
};

describe('PrismaCustomerRepository', () => {
  const prisma = {
    customer: {
      findFirst: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 'c-new' }),
      update: jest.fn().mockResolvedValue({ id: 'c1' }),
    },
  };
  const repository = new PrismaCustomerRepository(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('busca por id', async () => {
    prisma.customer.findFirst.mockResolvedValue({ id: 'c1' });
    await expect(repository.findById('c1')).resolves.toEqual({ id: 'c1' });
  });

  it('crea el cliente si el correo es nuevo', async () => {
    prisma.customer.findFirst.mockResolvedValue(null);
    await expect(repository.findOrCreateByEmail(input)).resolves.toEqual({
      id: 'c-new',
    });
    expect(prisma.customer.create).toHaveBeenCalledWith({ data: input });
  });

  it('actualiza los datos si el cliente ya existía', async () => {
    prisma.customer.findFirst.mockResolvedValue({ id: 'c1' });
    await expect(repository.findOrCreateByEmail(input)).resolves.toEqual({
      id: 'c1',
    });
    expect(prisma.customer.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: input,
    });
  });
});
