import { DomainError } from './domain-error';
import { chain, Result } from './result';

describe('Result (ROP)', () => {
  it('encadena transformaciones mientras la vía sea exitosa', () => {
    const result = Result.ok<number>(2)
      .map((n) => n * 3)
      .bind((n) => Result.ok<number>(n + 1));

    expect(result.isOk).toBe(true);
    expect(result.unwrap()).toBe(7);
  });

  it('corta la cadena en el primer error', () => {
    const error = DomainError.validation('inválido');
    const spy = jest.fn();

    const result = Result.err<number>(error)
      .map(spy)
      .bind(() => Result.ok<number>(1));

    expect(spy).not.toHaveBeenCalled();
    expect(result.isErr).toBe(true);
    expect(result.unwrapErr()).toBe(error);
  });

  it('mapErr transforma el error y match resuelve ambas vías', () => {
    const mapped = Result.err<number>(DomainError.notFound('nope')).mapErr(
      (e) => e.code,
    );

    expect(mapped.unwrapErr()).toBe('NOT_FOUND');
    expect(
      mapped.match({ ok: () => 'ok', err: (code) => `err:${code}` }),
    ).toBe('err:NOT_FOUND');
    expect(
      Result.ok<number>(5).match({ ok: (n) => `ok:${n}`, err: () => 'err' }),
    ).toBe('ok:5');
  });

  it('lanza al desempaquetar la vía equivocada', () => {
    expect(() => Result.err<number>(DomainError.conflict('x')).unwrap()).toThrow();
    expect(() => Result.ok<number>(1).unwrapErr()).toThrow();
  });

  it('bindAsync y chain componen pasos asíncronos', async () => {
    const doubled = await chain(
      Promise.resolve(Result.ok<number>(4)),
      async (n) => Result.ok<number>(n * 2),
    );
    expect(doubled.unwrap()).toBe(8);

    const failed = await Result.err<number>(DomainError.gateway('caído')).bindAsync(
      async () => Result.ok<number>(1),
    );
    expect(failed.isErr).toBe(true);
  });
});
