import { DomainError } from './domain-error';

/**
 * Railway Oriented Programming: cada caso de uso devuelve un Result en vez de
 * lanzar excepciones para los errores esperados del negocio. Los pasos se
 * encadenan con bind/bindAsync y el primer error corta la vía.
 */
export class Result<T, E = DomainError> {
  private constructor(
    private readonly ok: boolean,
    private readonly value?: T,
    private readonly error?: E,
  ) {}

  static ok<T, E = DomainError>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined);
  }

  static err<T = never, E = DomainError>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  get isOk(): boolean {
    return this.ok;
  }

  get isErr(): boolean {
    return !this.ok;
  }

  unwrap(): T {
    if (!this.ok) {
      throw new Error('No se puede desempaquetar un Result fallido');
    }
    return this.value as T;
  }

  unwrapErr(): E {
    if (this.ok) {
      throw new Error('No se puede desempaquetar el error de un Result exitoso');
    }
    return this.error as E;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return this.ok
      ? Result.ok<U, E>(fn(this.value as T))
      : Result.err<U, E>(this.error as E);
  }

  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    return this.ok
      ? Result.ok<T, F>(this.value as T)
      : Result.err<T, F>(fn(this.error as E));
  }

  bind<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this.ok ? fn(this.value as T) : Result.err<U, E>(this.error as E);
  }

  async bindAsync<U>(
    fn: (value: T) => Promise<Result<U, E>>,
  ): Promise<Result<U, E>> {
    return this.ok ? fn(this.value as T) : Result.err<U, E>(this.error as E);
  }

  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
    return this.ok
      ? handlers.ok(this.value as T)
      : handlers.err(this.error as E);
  }
}

/** Encadena un Result que viene dentro de una promesa. */
export async function chain<T, U, E>(
  previous: Promise<Result<T, E>>,
  fn: (value: T) => Promise<Result<U, E>>,
): Promise<Result<U, E>> {
  const result = await previous;
  return result.bindAsync(fn);
}
