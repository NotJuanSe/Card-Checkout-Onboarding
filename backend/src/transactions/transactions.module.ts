import { Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { DeliveriesModule } from '../deliveries/deliveries.module';
import { ProductsModule } from '../products/products.module';
import { CreateTransactionUseCase } from './application/create-transaction.use-case';
import { GetTransactionStatusUseCase } from './application/get-transaction-status.use-case';
import { QuoteTransactionUseCase } from './application/quote-transaction.use-case';
import { PAYMENT_GATEWAY } from './domain/payment-gateway.port';
import { TRANSACTION_REPOSITORY } from './domain/transaction-repository.port';
import { HttpPaymentGatewayAdapter } from './infrastructure/http-payment-gateway.adapter';
import { PrismaTransactionRepository } from './infrastructure/prisma-transaction.repository';
import { TransactionsController } from './infrastructure/transactions.controller';

@Module({
  imports: [ProductsModule, CustomersModule, DeliveriesModule],
  controllers: [TransactionsController],
  providers: [
    CreateTransactionUseCase,
    GetTransactionStatusUseCase,
    QuoteTransactionUseCase,
    { provide: TRANSACTION_REPOSITORY, useClass: PrismaTransactionRepository },
    { provide: PAYMENT_GATEWAY, useClass: HttpPaymentGatewayAdapter },
  ],
})
export class TransactionsModule {}
