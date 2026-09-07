import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { HttpPaymentGatewayAdapter } from './http-payment-gateway.adapter';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const http = { get: jest.fn(), post: jest.fn() };

const chargeInput = {
  reference: 'ORD-1-AAA',
  amountCents: 1700000,
  currency: 'COP',
  customerEmail: 'ana@example.com',
  cardToken: 'tok_test_123',
  installments: 1,
};

function buildAdapter(): HttpPaymentGatewayAdapter {
  return new HttpPaymentGatewayAdapter(
    new ConfigService({
      PAYMENT_GATEWAY_BASE_URL: 'https://gateway.test/v1',
      PAYMENT_GATEWAY_PUBLIC_KEY: 'pub_test',
      PAYMENT_GATEWAY_PRIVATE_KEY: 'prv_test',
      PAYMENT_GATEWAY_INTEGRITY_SECRET: 'integrity_test',
    }),
  );
}

describe('HttpPaymentGatewayAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue(http as never);
    mockedAxios.isAxiosError.mockReturnValue(false as never);
  });

  it('cobra enviando token de aceptación, firma y token de tarjeta', async () => {
    http.get.mockResolvedValue({
      data: { data: { presigned_acceptance: { acceptance_token: 'acc_1' } } },
    });
    http.post.mockResolvedValue({
      data: { data: { id: 'gw-1', status: 'PENDING', status_message: null } },
    });

    const result = await buildAdapter().charge(chargeInput);

    expect(result.unwrap()).toEqual({
      gatewayTransactionId: 'gw-1',
      status: 'PENDING',
      failureReason: null,
    });
    const [, body, options] = http.post.mock.calls[0];
    expect(body).toMatchObject({
      acceptance_token: 'acc_1',
      amount_in_cents: 1700000,
      reference: 'ORD-1-AAA',
      payment_method: { type: 'CARD', token: 'tok_test_123', installments: 1 },
    });
    expect(body.signature).toHaveLength(64);
    expect(options.headers.Authorization).toBe('Bearer prv_test');
  });

  it('nunca envía datos de tarjeta en crudo, solo el token', async () => {
    http.get.mockResolvedValue({
      data: { data: { presigned_acceptance: { acceptance_token: 'acc_1' } } },
    });
    http.post.mockResolvedValue({ data: { data: { id: 'gw-1', status: 'APPROVED' } } });

    await buildAdapter().charge(chargeInput);

    const [, body] = http.post.mock.calls[0];
    expect(JSON.stringify(body)).not.toMatch(/number|cvc|exp_month/);
  });

  it('falla con GATEWAY_ERROR si no hay token de aceptación', async () => {
    http.get.mockResolvedValue({ data: { data: {} } });
    const result = await buildAdapter().charge(chargeInput);
    expect(result.unwrapErr().code).toBe('GATEWAY_ERROR');
    expect(http.post).not.toHaveBeenCalled();
  });

  it('falla con GATEWAY_ERROR si la pasarela responde error al cobrar', async () => {
    http.get.mockResolvedValue({
      data: { data: { presigned_acceptance: { acceptance_token: 'acc_1' } } },
    });
    http.post.mockRejectedValue(new Error('500'));
    const result = await buildAdapter().charge(chargeInput);
    expect(result.unwrapErr().code).toBe('GATEWAY_ERROR');
  });

  it('falla si no se puede obtener el token de aceptación', async () => {
    http.get.mockRejectedValue(new Error('red caída'));
    const result = await buildAdapter().charge(chargeInput);
    expect(result.unwrapErr().code).toBe('GATEWAY_ERROR');
  });

  it.each([
    ['APPROVED', 'APPROVED'],
    ['DECLINED', 'DECLINED'],
    ['VOIDED', 'DECLINED'],
    ['PENDING', 'PENDING'],
    ['LO_QUE_SEA', 'ERROR'],
  ])('mapea el estado %s de la pasarela a %s', async (raw, expected) => {
    http.get.mockResolvedValue({
      data: { data: { id: 'gw-1', status: raw, status_message: 'msg' } },
    });

    const result = await buildAdapter().fetchStatus('gw-1');

    expect(result.unwrap().status).toBe(expected);
  });

  it('devuelve error de dominio si falla la consulta de estado', async () => {
    http.get.mockRejectedValue(new Error('timeout'));
    const result = await buildAdapter().fetchStatus('gw-1');
    expect(result.unwrapErr().code).toBe('GATEWAY_ERROR');
  });

  it('registra el detalle cuando el error viene de axios', async () => {
    mockedAxios.isAxiosError.mockReturnValue(true as never);
    http.get.mockRejectedValue({ response: { data: { error: 'invalid_token' } } });
    const result = await buildAdapter().fetchStatus('gw-1');
    expect(result.unwrapErr().details).toEqual({ error: 'invalid_token' });
  });
});
