import axios from 'axios';
import { tokenizeCard } from './gatewayClient';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const card = {
  number: '4242 4242 4242 4242',
  holder: 'ANA GOMEZ',
  expMonth: '12',
  expYear: '30',
  cvc: '123',
};

describe('tokenizeCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('envía la tarjeta solo a la pasarela y devuelve el token', async () => {
    mockedAxios.post.mockResolvedValue({ data: { data: { id: 'tok_1' } } });

    await expect(tokenizeCard(card)).resolves.toBe('tok_1');

    const [url, body] = mockedAxios.post.mock.calls[0];
    expect(url).toContain('/tokens/cards');
    expect(body).toMatchObject({ number: '4242424242424242', cvc: '123' });
  });

  it('falla si la pasarela no devuelve token', async () => {
    mockedAxios.post.mockResolvedValue({ data: { data: {} } });
    await expect(tokenizeCard(card)).rejects.toThrow('token de tarjeta');
  });
});
