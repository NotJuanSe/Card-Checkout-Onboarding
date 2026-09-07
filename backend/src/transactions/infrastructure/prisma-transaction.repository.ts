import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  CreateTransactionData,
  TransactionRepositoryPort,
  UpdateTransactionData,
} from '../domain/transaction-repository.port';
import { Transaction } from '../domain/transaction.entity';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTransactionData): Promise<Transaction> {
    return this.prisma.transaction.create({ data });
  }

  findById(id: string): Promise<Transaction | null> {
    return this.prisma.transaction.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateTransactionData): Promise<Transaction> {
    return this.prisma.transaction.update({ where: { id }, data });
  }
}
