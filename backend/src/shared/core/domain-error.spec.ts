import { DomainError } from './domain-error';

describe('DomainError', () => {
  it('expone un código por cada tipo de error de negocio', () => {
    expect(DomainError.validation('a').code).toBe('VALIDATION_ERROR');
    expect(DomainError.notFound('b').code).toBe('NOT_FOUND');
    expect(DomainError.insufficientStock('c').code).toBe('INSUFFICIENT_STOCK');
    expect(DomainError.paymentDeclined('d').code).toBe('PAYMENT_DECLINED');
    expect(DomainError.gateway('e').code).toBe('GATEWAY_ERROR');
    expect(DomainError.conflict('f').code).toBe('CONFLICT');
  });

  it('conserva mensaje y detalles', () => {
    const error = DomainError.validation('inválido', ['campo']);
    expect(error.message).toBe('inválido');
    expect(error.details).toEqual(['campo']);
  });
});
