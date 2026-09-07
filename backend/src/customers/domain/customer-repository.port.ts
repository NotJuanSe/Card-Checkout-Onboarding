import { Customer, CustomerInput } from './customer.entity';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CustomerRepositoryPort {
  findById(id: string): Promise<Customer | null>;
  /** Reutiliza el cliente si ya compró antes con el mismo correo. */
  findOrCreateByEmail(input: CustomerInput): Promise<Customer>;
}
