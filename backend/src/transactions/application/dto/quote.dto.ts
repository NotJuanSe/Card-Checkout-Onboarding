import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class QuoteDto {
  @ApiProperty({ format: 'uuid' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 'Bogotá', description: 'Ciudad de entrega' })
  @IsString()
  @IsNotEmpty()
  city!: string;
}
