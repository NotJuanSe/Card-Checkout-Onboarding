import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const instance = { get: jest.fn(), post: jest.fn() };
mockedAxios.create.mockReturnValue(instance as never);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const client = require('./backendClient') as typeof import('./backendClient');

describe('backendClient', () => {
  beforeEach(() => jest.clearAllMocks());

  it('trae el catálogo', async () => {
    instance.get.mockResolvedValue({ data: [{ id: 'p1' }] });
    await expect(client.fetchProducts()).resolves.toEqual([{ id: 'p1' }]);
    expect(instance.get).toHaveBeenCalledWith('/products');
  });

  it('crea la transacción enviando el token de tarjeta, nunca el número', async () => {
    instance.post.mockResolvedValue({ data: { id: 't1' } });
    const payload = {
      productId: 'p1',
      quantity: 1,
      customer: {
        fullName: 'Ana',
        email: 'a@b.co',
        phone: '3001234567',
        legalId: '123456',
      },
      delivery: { address: 'Calle 1', city: 'Bogotá', region: 'Cund' },
      cardToken: 'tok_1',
      installments: 1,
    };

    await expect(client.createTransaction(payload)).resolves.toEqual({ id: 't1' });
    const [url, body] = instance.post.mock.calls[0];
    expect(url).toBe('/transactions');
    expect(JSON.stringify(body)).not.toMatch(/"number"|"cvc"/);
  });

  it('cotiza el desglose de la compra', async () => {
    instance.post.mockResolvedValue({ data: { totalAmountCents: 1600000 } });
    await expect(
      client.quoteTransaction({ productId: 'p1', quantity: 1, city: 'Bogotá' }),
    ).resolves.toEqual({ totalAmountCents: 1600000 });
    expect(instance.post).toHaveBeenCalledWith('/transactions/quote', {
      productId: 'p1',
      quantity: 1,
      city: 'Bogotá',
    });
  });

  it('consulta el estado de una transacción', async () => {
    instance.get.mockResolvedValue({ data: { id: 't1', status: 'APPROVED' } });
    await expect(client.fetchTransaction('t1')).resolves.toMatchObject({
      status: 'APPROVED',
    });
    expect(instance.get).toHaveBeenCalledWith('/transactions/t1');
  });
});
