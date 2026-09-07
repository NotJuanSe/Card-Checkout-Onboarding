import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../core/domain-error';
import { toHttpException } from './domain-error.mapper';

describe('toHttpException', () => {
  it.each([
    [DomainError.validation('x'), HttpStatus.BAD_REQUEST],
    [DomainError.notFound('x'), HttpStatus.NOT_FOUND],
    [DomainError.insufficientStock('x'), HttpStatus.CONFLICT],
    [DomainError.conflict('x'), HttpStatus.CONFLICT],
    [DomainError.paymentDeclined('x'), HttpStatus.PAYMENT_REQUIRED],
    [DomainError.gateway('x'), HttpStatus.BAD_GATEWAY],
  ])('traduce %s al estado HTTP correcto', (error, expected) => {
    expect(toHttpException(error).getStatus()).toBe(expected);
  });

  it('cae a 500 con un código desconocido', () => {
    const unknown = new DomainError('RARO' as never, 'x');
    expect(toHttpException(unknown).getStatus()).toBe(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });
});
