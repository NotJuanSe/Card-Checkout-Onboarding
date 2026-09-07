import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('conecta y desconecta con el ciclo de vida del módulo', async () => {
    const service = new PrismaService();
    const connect = jest
      .spyOn(service, '$connect')
      .mockResolvedValue(undefined as never);
    const disconnect = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValue(undefined as never);

    await service.onModuleInit();
    await service.onModuleDestroy();

    expect(connect).toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalled();
  });
});
