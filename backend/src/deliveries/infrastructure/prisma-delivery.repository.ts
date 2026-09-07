import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  Delivery,
  DeliveryInput,
  DeliveryStatus,
} from '../domain/delivery.entity';
import { DeliveryRepositoryPort } from '../domain/delivery-repository.port';

@Injectable()
export class PrismaDeliveryRepository implements DeliveryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  create(input: DeliveryInput): Promise<Delivery> {
    return this.prisma.delivery.create({
      data: { ...input, postalCode: input.postalCode ?? null },
    });
  }

  findById(id: string): Promise<Delivery | null> {
    return this.prisma.delivery.findUnique({ where: { id } });
  }

  updateStatus(id: string, status: DeliveryStatus): Promise<Delivery> {
    return this.prisma.delivery.update({ where: { id }, data: { status } });
  }
}
