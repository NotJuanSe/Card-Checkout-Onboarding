import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../shared/core/domain-error';
import { Result } from '../../shared/core/result';
import { Product } from '../domain/product.entity';
import {
  PRODUCT_REPOSITORY,
  ProductRepositoryPort,
} from '../domain/product-repository.port';

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepositoryPort,
  ) {}

  async execute(): Promise<Result<Product[], DomainError>> {
    try {
      return Result.ok(await this.products.findAll());
    } catch (error) {
      return Result.err(
        DomainError.gateway('No se pudo consultar el catálogo', error),
      );
    }
  }
}
