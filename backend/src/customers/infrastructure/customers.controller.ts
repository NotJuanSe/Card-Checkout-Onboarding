import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { toHttpException } from '../../shared/http/domain-error.mapper';
import { GetCustomerUseCase } from '../application/get-customer.use-case';
import { Customer } from '../domain/customer.entity';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly getCustomer: GetCustomerUseCase) {}

  @Get(':id')
  @ApiOkResponse({ description: 'Datos del cliente que hizo la compra.' })
  async findOne(@Param('id') id: string): Promise<Customer> {
    const result = await this.getCustomer.execute(id);
    return result.match({
      ok: (customer) => customer,
      err: (error) => {
        throw toHttpException(error);
      },
    });
  }
}
