import { HttpException, HttpStatus } from '@nestjs/common';
import { DomainError } from '../core/domain-error';

const STATUS_BY_CODE: Record<string, HttpStatus> = {
  VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
  NOT_FOUND: HttpStatus.NOT_FOUND,
  INSUFFICIENT_STOCK: HttpStatus.CONFLICT,
  CONFLICT: HttpStatus.CONFLICT,
  PAYMENT_DECLINED: HttpStatus.PAYMENT_REQUIRED,
  GATEWAY_ERROR: HttpStatus.BAD_GATEWAY,
};

/** Traduce un error de dominio al código HTTP que corresponde. */
export function toHttpException(error: DomainError): HttpException {
  const status = STATUS_BY_CODE[error.code] ?? HttpStatus.INTERNAL_SERVER_ERROR;
  return new HttpException(
    { statusCode: status, code: error.code, message: error.message },
    status,
  );
}
