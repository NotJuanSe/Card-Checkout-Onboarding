import {
  detectBrand,
  formatCardNumber,
  isValidCvc,
  isValidExpiry,
  isValidLuhn,
  lastFour,
  onlyDigits,
  validateCard,
} from './card';

const VISA = '4242424242424242';
const MASTERCARD = '5555555555554444';

describe('detectBrand', () => {
  it('detecta VISA por el prefijo 4', () => {
    expect(detectBrand('4')).toBe('VISA');
    expect(detectBrand(VISA)).toBe('VISA');
  });

  it('detecta Mastercard en rangos 51-55 y 2221-2720', () => {
    expect(detectBrand(MASTERCARD)).toBe('MASTERCARD');
    expect(detectBrand('2221000000000009')).toBe('MASTERCARD');
    expect(detectBrand('2720999999999999')).toBe('MASTERCARD');
  });

  it('devuelve UNKNOWN para otras franquicias', () => {
    expect(detectBrand('378282246310005')).toBe('UNKNOWN');
    expect(detectBrand('')).toBe('UNKNOWN');
  });
});

describe('formatCardNumber', () => {
  it('agrupa en bloques de 4', () => {
    expect(formatCardNumber(VISA)).toBe('4242 4242 4242 4242');
  });

  it('ignora caracteres no numéricos', () => {
    expect(formatCardNumber('4242-4242 abc')).toBe('4242 4242');
  });
});

describe('isValidLuhn', () => {
  it('acepta números válidos', () => {
    expect(isValidLuhn(VISA)).toBe(true);
    expect(isValidLuhn(MASTERCARD)).toBe(true);
  });

  it('rechaza números alterados o de longitud inválida', () => {
    expect(isValidLuhn('4242424242424241')).toBe(false);
    expect(isValidLuhn('424242')).toBe(false);
    expect(isValidLuhn('42424242424242424242')).toBe(false);
  });
});

describe('isValidExpiry', () => {
  const today = new Date('2026-09-06T00:00:00Z');

  it('acepta el mes en curso y meses futuros', () => {
    expect(isValidExpiry('09', '26', today)).toBe(true);
    expect(isValidExpiry('12', '30', today)).toBe(true);
  });

  it('rechaza fechas vencidas o mal formadas', () => {
    expect(isValidExpiry('08', '26', today)).toBe(false);
    expect(isValidExpiry('13', '30', today)).toBe(false);
    expect(isValidExpiry('00', '30', today)).toBe(false);
    expect(isValidExpiry('05', '2030', today)).toBe(false);
    expect(isValidExpiry('ab', 'cd', today)).toBe(false);
  });
});

describe('isValidCvc y helpers', () => {
  it('valida CVC de 3 o 4 dígitos', () => {
    expect(isValidCvc('123')).toBe(true);
    expect(isValidCvc('1234')).toBe(true);
    expect(isValidCvc('12')).toBe(false);
    expect(isValidCvc('abc')).toBe(false);
  });

  it('extrae dígitos y últimos cuatro', () => {
    expect(onlyDigits('4242 abc 42')).toBe('424242');
    expect(lastFour(VISA)).toBe('4242');
  });
});

describe('validateCard', () => {
  const today = new Date('2026-09-06T00:00:00Z');
  const valid = {
    number: VISA,
    holder: 'ANA GOMEZ',
    expMonth: '12',
    expYear: '30',
    cvc: '123',
  };

  it('no reporta errores con una tarjeta válida', () => {
    expect(validateCard(valid, today)).toEqual({});
  });

  it('rechaza franquicias no soportadas aunque pasen Luhn', () => {
    expect(validateCard({ ...valid, number: '378282246310005' }, today).number).toBe(
      'Solo aceptamos VISA y Mastercard',
    );
  });

  it('reporta cada campo inválido', () => {
    const errors = validateCard(
      { number: '1234', holder: 'A', expMonth: '13', expYear: '20', cvc: '1' },
      today,
    );
    expect(Object.keys(errors).sort()).toEqual([
      'cvc',
      'expMonth',
      'holder',
      'number',
    ]);
  });
});
