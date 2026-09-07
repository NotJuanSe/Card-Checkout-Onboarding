import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Customer, CustomerInput } from '../domain/customer.entity';
import { CustomerRepositoryPort } from '../domain/customer-repository.port';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Customer | null> {
    return this.prisma.customer.findFirst({ where: { id } });
  }

  async findOrCreateByEmail(input: CustomerInput): Promise<Customer> {
    const existing = await this.prisma.customer.findFirst({
      where: { email: input.email },
    });
    if (existing) {
      return this.prisma.customer.update({
        where: { id: existing.id },
        data: input,
      });
    }
    return this.prisma.customer.create({ data: input });
  }
}
