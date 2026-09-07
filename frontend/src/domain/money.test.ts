import { formatCents } from './money';

describe('formatCents', () => {
  it('convierte centavos a pesos formateados', () => {
    expect(formatCents(45990000).replace(/ /g, ' ')).toContain('459.900');
  });

  it('redondea al peso más cercano', () => {
    expect(formatCents(150).replace(/ /g, ' ')).toContain('2');
  });
});
