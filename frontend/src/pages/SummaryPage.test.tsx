import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SummaryPage } from './SummaryPage';
import { renderWithStore } from '../test/renderWithStore';
import * as backend from '../api/backendClient';
import type { CheckoutState } from '../store/checkoutSlice';

jest.mock('../api/backendClient');
const mockedBackend = backend as jest.Mocked<typeof backend>;

const product = {
  id: 'p1',
  name: 'Audífonos Aurora',
  description: 'desc',
  priceCents: 100000,
  imageUrl: 'http://img',
  stock: 5,
};

const readyState: Partial<CheckoutState> = {
  step: 'SUMMARY',
  products: [product],
  selectedProductId: 'p1',
  quantity: 2,
  customer: {
    fullName: 'Ana Gómez',
    email: 'ana@example.com',
    phone: '3001234567',
    legalId: '1020304050',
  },
  delivery: { address: 'Calle 123', city: 'Bogotá', region: 'Cundinamarca' },
  card: {
    brand: 'VISA',
    lastFour: '4242',
    holder: 'ANA GOMEZ',
    token: 'tok_1',
    installments: 3,
  },
};

const quote = {
  productAmountCents: 200000,
  baseFeeCents: 500000,
  deliveryFeeCents: 1000000,
  totalAmountCents: 1700000,
};

describe('SummaryPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('muestra el desglose con tarifa base y envío en el backdrop', async () => {
    mockedBackend.quoteTransaction.mockResolvedValue(quote);

    renderWithStore(<SummaryPage />, readyState);

    expect(await screen.findByText('Tarifa base')).toBeInTheDocument();
    expect(screen.getByText('Envío')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Resumen de pago' })).toBeInTheDocument();
    expect(screen.getByText(/Terminada en 4242/)).toBeInTheDocument();
    expect(screen.getByLabelText('Tarjeta VISA')).toBeInTheDocument();
  });

  it('dispara el pago con el token guardado', async () => {
    mockedBackend.quoteTransaction.mockResolvedValue(quote);
    mockedBackend.createTransaction.mockResolvedValue({
      id: 't1',
      reference: 'ORD-1-AAA',
      productId: 'p1',
      quantity: 2,
      productAmountCents: 200000,
      baseFeeCents: 500000,
      deliveryFeeCents: 1000000,
      totalAmountCents: 1700000,
      currency: 'COP',
      status: 'PENDING',
      failureReason: null,
    });

    const { store } = renderWithStore(<SummaryPage />, readyState);

    await userEvent.click(await screen.findByRole('button', { name: 'Pagar ahora' }));

    await waitFor(() =>
      expect(store.getState().checkout.transaction).not.toBeNull(),
    );
    expect(mockedBackend.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ cardToken: 'tok_1', installments: 3 }),
    );
    expect(store.getState().checkout.step).toBe('RESULT');
  });

  it('avisa si no se puede calcular el total', async () => {
    mockedBackend.quoteTransaction.mockRejectedValue(new Error('sin stock'));

    renderWithStore(<SummaryPage />, readyState);

    expect(
      await screen.findByText('No pudimos calcular el total de la compra'),
    ).toBeInTheDocument();
  });

  it('pide reiniciar si falta información de la compra', () => {
    renderWithStore(<SummaryPage />, { step: 'SUMMARY' });
    expect(screen.getByRole('alert')).toHaveTextContent('Falta información');
  });

  it('permite editar los datos de pago', async () => {
    mockedBackend.quoteTransaction.mockResolvedValue(quote);
    const { store } = renderWithStore(<SummaryPage />, readyState);

    await userEvent.click(await screen.findByRole('button', { name: 'Editar datos' }));

    expect(store.getState().checkout.step).toBe('PAYMENT_INFO');
  });
});
