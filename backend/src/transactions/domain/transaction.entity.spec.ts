import {
  buildReference,
  calculateAmounts,
  isTerminal,
} from './transaction.entity';

describe('calculateAmounts', () => {
  it('suma producto, IVA, fee base y fee de envío', () => {
    expect(calculateAmounts(1000, 2, 500, 300)).toEqual({
      productAmountCents: 2000,
      vatCents: 380,
      baseFeeCents: 500,
      deliveryFeeCents: 300,
      totalAmountCents: 3180,
    });
  });

  it('grava solo el precio del producto, no las tarifas', () => {
    const { vatCents } = calculateAmounts(10000, 1, 999999, 888888);
    expect(vatCents).toBe(1900);
  });

  it('redondea el IVA a centavos enteros', () => {
    // 333 * 0.19 = 63.27
    expect(calculateAmounts(333, 1, 0, 0).vatCents).toBe(63);
  });

  it('acepta otra tasa, por si cambia la normativa', () => {
    expect(calculateAmounts(1000, 1, 0, 0, 0.05).vatCents).toBe(50);
  });

  it('con tasa cero el total es la suma sin impuesto', () => {
    expect(calculateAmounts(1000, 1, 200, 300, 0)).toMatchObject({
      vatCents: 0,
      totalAmountCents: 1500,
    });
  });
});

describe('isTerminal', () => {
  it('reconoce los estados finales', () => {
    expect(isTerminal('APPROVED')).toBe(true);
    expect(isTerminal('DECLINED')).toBe(true);
    expect(isTerminal('ERROR')).toBe(true);
  });

  it('trata PENDING y desconocidos como no finales', () => {
    expect(isTerminal('PENDING')).toBe(false);
    expect(isTerminal('LO_QUE_SEA')).toBe(false);
  });
});

describe('buildReference', () => {
  it('incluye la marca de tiempo y el sufijo aleatorio en mayúsculas', () => {
    const reference = buildReference(new Date(1700000000000), 'abc123');
    expect(reference).toBe('ORD-1700000000000-ABC123');
  });
});
