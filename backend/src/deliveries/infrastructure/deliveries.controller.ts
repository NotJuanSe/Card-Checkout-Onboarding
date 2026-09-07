import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { toHttpException } from '../../shared/http/domain-error.mapper';
import { GetDeliveryUseCase } from '../application/get-delivery.use-case';
import { Delivery } from '../domain/delivery.entity';

@ApiTags('deliveries')
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly getDelivery: GetDeliveryUseCase) {}

  @Get(':id')
  @ApiOkResponse({ description: 'Datos y estado de la entrega asociada a la compra.' })
  async findOne(@Param('id') id: string): Promise<Delivery> {
    const result = await this.getDelivery.execute(id);
    return result.match({
      ok: (delivery) => delivery,
      err: (error) => {
        throw toHttpException(error);
      },
    });
  }
}
