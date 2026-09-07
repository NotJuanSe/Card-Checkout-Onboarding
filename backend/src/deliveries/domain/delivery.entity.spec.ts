import { deliveryFeeCents, validateDelivery } from './delivery.entity';

describe('deliveryFeeCents', () => {
  it('usa la tarifa de la ciudad ignorando tildes y mayúsculas', () => {
    expect(deliveryFeeCents('Bogotá')).toBe(1000000);
    expect(deliveryFeeCents('  MEDELLÍN ')).toBe(1200000);
  });

  it('usa la tarifa nacional para ciudades no listadas', () => {
    expect(deliveryFeeCents('Leticia')).toBe(1800000);
    expect(deliveryFeeCents('')).toBe(1800000);
  });
});

describe('validateDelivery', () => {
  const valid = { address: 'Calle 123 #45-67', city: 'Bogotá', region: 'Cundinamarca' };

  it('no reporta errores con datos válidos', () => {
    expect(validateDelivery(valid)).toEqual([]);
  });

  it('reporta dirección, ciudad y región faltantes', () => {
    expect(validateDelivery({ address: 'x', city: '', region: '' })).toHaveLength(3);
  });
});
