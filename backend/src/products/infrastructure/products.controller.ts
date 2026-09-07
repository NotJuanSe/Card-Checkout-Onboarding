import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { toHttpException } from '../../shared/http/domain-error.mapper';
import { GetProductUseCase } from '../application/get-product.use-case';
import { ListProductsUseCase } from '../application/list-products.use-case';
import { Product } from '../domain/product.entity';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly listProducts: ListProductsUseCase,
    private readonly getProduct: GetProductUseCase,
  ) {}

  @Get()
  @ApiOkResponse({ description: 'Catálogo con el stock disponible.' })
  async findAll(): Promise<Product[]> {
    const result = await this.listProducts.execute();
    return result.match({
      ok: (products) => products,
      err: (error) => {
        throw toHttpException(error);
      },
    });
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Detalle de un producto.' })
  async findOne(@Param('id') id: string): Promise<Product> {
    const result = await this.getProduct.execute(id);
    return result.match({
      ok: (product) => product,
      err: (error) => {
        throw toHttpException(error);
      },
    });
  }
}
