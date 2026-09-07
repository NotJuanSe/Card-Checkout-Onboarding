import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../shared/core/domain-error';
import { Result } from '../../shared/core/result';
import { Customer } from '../domain/customer.entity';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepositoryPort,
} from '../domain/customer-repository.port';

@Injectable()
export class GetCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: CustomerRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<Customer, DomainError>> {
    const customer = await this.customers.findById(id);
    return customer
      ? Result.ok(customer)
      : Result.err(DomainError.notFound(`Cliente ${id} no existe`));
  }
}
