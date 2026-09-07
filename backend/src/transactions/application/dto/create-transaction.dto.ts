import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CustomerDto {
  @ApiProperty({ example: 'Ana Gómez' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: 'ana@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '3001234567' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: '1020304050', description: 'Documento de identidad' })
  @IsString()
  @IsNotEmpty()
  legalId!: string;
}

export class DeliveryDto {
  @ApiProperty({ example: 'Calle 123 #45-67, apto 802' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ example: 'Bogotá' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'Cundinamarca' })
  @IsString()
  @IsNotEmpty()
  region!: string;

  @ApiPropertyOptional({ example: '110111' })
  @IsOptional()
  @IsString()
  postalCode?: string;
}

export class CreateTransactionDto {
  @ApiProperty({ format: 'uuid' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ type: CustomerDto })
  @ValidateNested()
  @Type(() => CustomerDto)
  customer!: CustomerDto;

  @ApiProperty({ type: DeliveryDto })
  @ValidateNested()
  @Type(() => DeliveryDto)
  delivery!: DeliveryDto;

  @ApiProperty({
    description:
      'Token de tarjeta generado en el navegador contra la pasarela. El backend nunca recibe el número de tarjeta.',
    example: 'tok_test_000_00000',
  })
  @IsString()
  @IsNotEmpty()
  cardToken!: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 36 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(36)
  installments?: number;
}
