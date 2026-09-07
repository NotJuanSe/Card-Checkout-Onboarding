import { Module } from '@nestjs/common';
import { GetCustomerUseCase } from './application/get-customer.use-case';
import { CUSTOMER_REPOSITORY } from './domain/customer-repository.port';
import { PrismaCustomerRepository } from './infrastructure/prisma-customer.repository';
import { CustomersController } from './infrastructure/customers.controller';

@Module({
  controllers: [CustomersController],
  providers: [
    GetCustomerUseCase,
    { provide: CUSTOMER_REPOSITORY, useClass: PrismaCustomerRepository },
  ],
  exports: [CUSTOMER_REPOSITORY],
})
export class CustomersModule {}
