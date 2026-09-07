import { Delivery, DeliveryInput, DeliveryStatus } from './delivery.entity';

export const DELIVERY_REPOSITORY = Symbol('DELIVERY_REPOSITORY');

export interface DeliveryRepositoryPort {
  create(input: DeliveryInput): Promise<Delivery>;
  findById(id: string): Promise<Delivery | null>;
  updateStatus(id: string, status: DeliveryStatus): Promise<Delivery>;
}
