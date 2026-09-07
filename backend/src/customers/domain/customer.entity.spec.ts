import { validateCustomer } from './customer.entity';

const valid = {
  fullName: 'Ana Gómez',
  email: 'ana@example.com',
  phone: '3001234567',
  legalId: '1020304050',
};

describe('validateCustomer', () => {
  it('no reporta errores con datos válidos', () => {
    expect(validateCustomer(valid)).toEqual([]);
  });

  it('exige nombre de al menos 3 caracteres', () => {
    expect(validateCustomer({ ...valid, fullName: 'Al' })).toHaveLength(1);
  });

  it('rechaza correos mal formados', () => {
    expect(validateCustomer({ ...valid, email: 'ana@' })).toHaveLength(1);
    expect(validateCustomer({ ...valid, email: 'sin-arroba.com' })).toHaveLength(1);
  });

  it('rechaza teléfonos y documentos inválidos', () => {
    expect(validateCustomer({ ...valid, phone: '123' })).toHaveLength(1);
    expect(validateCustomer({ ...valid, legalId: '12' })).toHaveLength(1);
  });

  it('acumula todos los errores encontrados', () => {
    expect(
      validateCustomer({ fullName: '', email: '', phone: '', legalId: '' }),
    ).toHaveLength(4);
  });
});
