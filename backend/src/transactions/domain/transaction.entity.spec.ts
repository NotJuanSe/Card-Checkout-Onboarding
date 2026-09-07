import {
  buildReference,
  calculateAmounts,
  isTerminal,
} from './transaction.entity';

describe('calculateAmounts', () => {
  it('suma producto, fee base y fee de envío', () => {
    expect(calculateAmounts(1000, 2, 500, 300)).toEqual({
      productAmountCents: 2000,
      baseFeeCents: 500,
      deliveryFeeCents: 300,
      totalAmountCents: 2800,
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
