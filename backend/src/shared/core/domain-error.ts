export type DomainErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'INSUFFICIENT_STOCK'
  | 'PAYMENT_DECLINED'
  | 'GATEWAY_ERROR'
  | 'CONFLICT';

export class DomainError {
  constructor(
    readonly code: DomainErrorCode,
    readonly message: string,
    readonly details?: unknown,
  ) {}

  static validation(message: string, details?: unknown): DomainError {
    return new DomainError('VALIDATION_ERROR', message, details);
  }

  static notFound(message: string): DomainError {
    return new DomainError('NOT_FOUND', message);
  }

  static insufficientStock(message: string): DomainError {
    return new DomainError('INSUFFICIENT_STOCK', message);
  }

  static paymentDeclined(message: string, details?: unknown): DomainError {
    return new DomainError('PAYMENT_DECLINED', message, details);
  }

  static gateway(message: string, details?: unknown): DomainError {
    return new DomainError('GATEWAY_ERROR', message, details);
  }

  static conflict(message: string): DomainError {
    return new DomainError('CONFLICT', message);
  }
}
