import { Module } from '@nestjs/common';
import { GetDeliveryUseCase } from './application/get-delivery.use-case';
import { DELIVERY_REPOSITORY } from './domain/delivery-repository.port';
import { PrismaDeliveryRepository } from './infrastructure/prisma-delivery.repository';
import { DeliveriesController } from './infrastructure/deliveries.controller';

@Module({
  controllers: [DeliveriesController],
  providers: [
    GetDeliveryUseCase,
    { provide: DELIVERY_REPOSITORY, useClass: PrismaDeliveryRepository },
  ],
  exports: [DELIVERY_REPOSITORY],
})
export class DeliveriesModule {}
