export type CardBrand = 'VISA' | 'MASTERCARD' | 'UNKNOWN';

export interface CardInput {
  number: string;
  holder: string;
  expMonth: string;
  expYear: string;
  cvc: string;
}

export function onlyDigits(value: string): string {
  return (value ?? '').replace(/\D/g, '');
}

/** Detecta la marca por prefijo para mostrar el logo mientras se escribe. */
export function detectBrand(cardNumber: string): CardBrand {
  const digits = onlyDigits(cardNumber);
  if (digits.startsWith('4')) return 'VISA';

  // Mastercard: 51-55 (clásico) y 2221-2720 (rango nuevo). Se completa con ceros
  // para que un prefijo incompleto no se marque como Mastercard antes de tiempo.
  const twoDigits = Number(digits.slice(0, 2));
  const fourDigits = Number(digits.slice(0, 4).padEnd(4, '0'));
  const isClassic = twoDigits >= 51 && twoDigits <= 55;
  const isNewRange = fourDigits >= 2221 && fourDigits <= 2720;
  return isClassic || isNewRange ? 'MASTERCARD' : 'UNKNOWN';
}

/** Agrupa en bloques de 4 para que el número sea legible al escribirlo. */
export function formatCardNumber(cardNumber: string): string {
  return (onlyDigits(cardNumber).match(/.{1,4}/g) ?? []).join(' ').slice(0, 23);
}

/** Algoritmo de Luhn: descarta números con dígitos tecleados al azar. */
export function isValidLuhn(cardNumber: string): boolean {
  const digits = onlyDigits(cardNumber);
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

export function isValidExpiry(
  expMonth: string,
  expYear: string,
  today = new Date(),
): boolean {
  const month = Number(expMonth);
  const year = Number(expYear);
  if (!Number.isInteger(month) || month < 1 || month > 12) return false;
  if (!Number.isInteger(year) || expYear.length !== 2) return false;

  const expiry = new Date(2000 + year, month, 0, 23, 59, 59);
  return expiry.getTime() >= today.getTime();
}

export function isValidCvc(cvc: string): boolean {
  return /^\d{3,4}$/.test(cvc ?? '');
}

export function lastFour(cardNumber: string): string {
  return onlyDigits(cardNumber).slice(-4);
}

/** Devuelve los errores por campo; vacío significa tarjeta utilizable. */
export function validateCard(
  input: CardInput,
  today = new Date(),
): Partial<Record<keyof CardInput, string>> {
  const errors: Partial<Record<keyof CardInput, string>> = {};

  if (!isValidLuhn(input.number)) {
    errors.number = 'Número de tarjeta inválido';
  } else if (detectBrand(input.number) === 'UNKNOWN') {
    errors.number = 'Solo aceptamos VISA y Mastercard';
  }
  if (!input.holder || input.holder.trim().length < 5) {
    errors.holder = 'Escribe el nombre como aparece en la tarjeta';
  }
  if (!isValidExpiry(input.expMonth, input.expYear, today)) {
    errors.expMonth = 'Fecha de expiración inválida';
  }
  if (!isValidCvc(input.cvc)) {
    errors.cvc = 'CVC inválido';
  }
  return errors;
}
