import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { deliveryFeeCents } from '../../deliveries/domain/delivery.entity';
import {
  PRODUCT_REPOSITORY,
  ProductRepositoryPort,
} from '../../products/domain/product-repository.port';
import { hasEnoughStock } from '../../products/domain/product.entity';
import { DomainError } from '../../shared/core/domain-error';
import { Result } from '../../shared/core/result';
import { AmountBreakdown, calculateAmounts } from '../domain/transaction.entity';
import { QuoteDto } from './dto/quote.dto';

export const DEFAULT_BASE_FEE_CENTS = 500000;

/**
 * Calcula el desglose que ve el cliente antes de pagar. Vive en el backend para
 * que las tarifas tengan una única fuente de verdad.
 */
@Injectable()
export class QuoteTransactionUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepositoryPort,
    private readonly config: ConfigService,
  ) {}

  async execute(input: QuoteDto): Promise<Result<AmountBreakdown, DomainError>> {
    const product = await this.products.findById(input.productId);
    if (!product) {
      return Result.err(
        DomainError.notFound(`Producto ${input.productId} no existe`),
      );
    }
    if (!hasEnoughStock(product, input.quantity)) {
      return Result.err(
        DomainError.insufficientStock(
          `Solo quedan ${product.stock} unidades de ${product.name}`,
        ),
      );
    }

    return Result.ok(
      calculateAmounts(
        product.priceCents,
        input.quantity,
        this.baseFeeCents(),
        deliveryFeeCents(input.city),
      ),
    );
  }

  private baseFeeCents(): number {
    const parsed = Number.parseInt(
      this.config.get<string>('BASE_FEE_CENTS') ?? '',
      10,
    );
    return Number.isFinite(parsed) && parsed >= 0
      ? parsed
      : DEFAULT_BASE_FEE_CENTS;
  }
}
