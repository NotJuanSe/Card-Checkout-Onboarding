import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { toHttpException } from '../../shared/http/domain-error.mapper';
import { CreateTransactionUseCase } from '../application/create-transaction.use-case';
import { CreateTransactionDto } from '../application/dto/create-transaction.dto';
import { GetTransactionStatusUseCase } from '../application/get-transaction-status.use-case';
import { QuoteDto } from '../application/dto/quote.dto';
import { QuoteTransactionUseCase } from '../application/quote-transaction.use-case';
import { AmountBreakdown, Transaction } from '../domain/transaction.entity';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly getStatus: GetTransactionStatusUseCase,
    private readonly quoteTransaction: QuoteTransactionUseCase,
  ) {}

  @Post('quote')
  @ApiOkResponse({
    description:
      'Desglose de la compra (producto, fee base y envío) antes de pagar.',
  })
  async quote(@Body() dto: QuoteDto): Promise<AmountBreakdown> {
    const result = await this.quoteTransaction.execute(dto);
    return result.match({
      ok: (breakdown) => breakdown,
      err: (error) => {
        throw toHttpException(error);
      },
    });
  }

  @Post()
  @ApiCreatedResponse({
    description:
      'Crea la transacción en PENDING, cobra contra la pasarela y devuelve el estado inicial.',
  })
  @ApiBadRequestResponse({ description: 'Datos del cliente o la entrega inválidos.' })
  async create(@Body() dto: CreateTransactionDto): Promise<Transaction> {
    const result = await this.createTransaction.execute(dto);
    return result.match({
      ok: (transaction) => transaction,
      err: (error) => {
        throw toHttpException(error);
      },
    });
  }

  @Get(':id')
  @ApiOkResponse({
    description:
      'Estado actualizado de la transacción; si sigue pendiente se reconsulta la pasarela.',
  })
  @ApiNotFoundResponse({ description: 'La transacción no existe.' })
  async findOne(@Param('id') id: string): Promise<Transaction> {
    const result = await this.getStatus.execute(id);
    return result.match({
      ok: (transaction) => transaction,
      err: (error) => {
        throw toHttpException(error);
      },
    });
  }
}
