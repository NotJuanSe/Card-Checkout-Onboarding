import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../shared/core/domain-error';
import { Result } from '../../shared/core/result';
import { Product } from '../domain/product.entity';
import {
  PRODUCT_REPOSITORY,
  ProductRepositoryPort,
} from '../domain/product-repository.port';

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<Product, DomainError>> {
    const product = await this.products.findById(id);
    return product
      ? Result.ok(product)
      : Result.err(DomainError.notFound(`Producto ${id} no existe`));
  }
}
