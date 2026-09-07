import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../shared/core/domain-error';
import { Result } from '../../shared/core/result';
import { Delivery } from '../domain/delivery.entity';
import {
  DELIVERY_REPOSITORY,
  DeliveryRepositoryPort,
} from '../domain/delivery-repository.port';

@Injectable()
export class GetDeliveryUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveries: DeliveryRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<Delivery, DomainError>> {
    const delivery = await this.deliveries.findById(id);
    return delivery
      ? Result.ok(delivery)
      : Result.err(DomainError.notFound(`Entrega ${id} no existe`));
  }
}
