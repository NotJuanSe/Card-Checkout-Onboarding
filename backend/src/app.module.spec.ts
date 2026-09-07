import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { PrismaService } from './shared/prisma/prisma.service';
import { ProductsController } from './products/infrastructure/products.controller';
import { TransactionsController } from './transactions/infrastructure/transactions.controller';
import { CustomersController } from './customers/infrastructure/customers.controller';
import { DeliveriesController } from './deliveries/infrastructure/deliveries.controller';

/**
 * Verifica que todo el grafo de inyección resuelve: cada puerto tiene su
 * adaptador registrado y los controllers reciben sus casos de uso.
 */
describe('AppModule', () => {
  it('cablea los cuatro módulos del dominio', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({ $connect: jest.fn(), $disconnect: jest.fn() })
      .compile();

    expect(moduleRef.get(ProductsController)).toBeDefined();
    expect(moduleRef.get(TransactionsController)).toBeDefined();
    expect(moduleRef.get(CustomersController)).toBeDefined();
    expect(moduleRef.get(DeliveriesController)).toBeDefined();

    await moduleRef.close();
  });
});
