import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { renderWithStore } from './test/renderWithStore';
import * as backend from './api/backendClient';

jest.mock('./api/backendClient');
const mockedBackend = backend as jest.Mocked<typeof backend>;

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedBackend.fetchProducts.mockResolvedValue([]);
  });

  it('arranca en la pantalla de producto', () => {
    renderWithStore(<App />);
    expect(screen.getByLabelText('Paso 1 de 4')).toBeInTheDocument();
  });

  it('sube el scroll al cambiar de paso, para no aterrizar a media página', async () => {
    mockedBackend.fetchProducts.mockResolvedValue([
      {
        id: 'p1',
        name: 'Audífonos',
        description: 'desc',
        priceCents: 100000,
        imageUrl: 'http://img',
        stock: 3,
      },
    ]);
    renderWithStore(<App />);
    (window.scrollTo as jest.Mock).mockClear();

    await userEvent.click(
      await screen.findByRole('button', { name: /Pagar con tarjeta/i }),
    );

    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 0 }),
    );
  });

  it('recarga el catálogo al retomar un paso avanzado, para no quedar sin datos del producto', async () => {
    const product = {
      id: 'p1',
      name: 'Audífonos',
      description: 'desc',
      priceCents: 100000,
      imageUrl: 'http://img',
      stock: 3,
    };
    mockedBackend.fetchProducts.mockResolvedValue([product]);
    mockedBackend.quoteTransaction.mockResolvedValue({
      productAmountCents: 100000,
      baseFeeCents: 500000,
      deliveryFeeCents: 1000000,
      totalAmountCents: 1600000,
    });

    const { store } = renderWithStore(<App />, {
      step: 'SUMMARY',
      selectedProductId: 'p1',
      quantity: 1,
      customer: {
        fullName: 'Ana Gómez',
        email: 'ana@example.com',
        phone: '3001234567',
        legalId: '1020304050',
      },
      delivery: { address: 'Calle 1', city: 'Bogotá', region: 'Cundinamarca' },
      card: {
        brand: 'VISA',
        lastFour: '4242',
        holder: 'ANA GOMEZ',
        token: 'tok_1',
        installments: 1,
      },
    });

    expect(await screen.findByText('Resumen del pago')).toBeInTheDocument();
    await waitFor(() =>
      expect(store.getState().checkout.products).toHaveLength(1),
    );
  });

  it('retoma el paso guardado tras un refresh', () => {
    renderWithStore(<App />, {
      step: 'RESULT',
      transaction: {
        id: 't1',
        reference: 'ORD-1-AAA',
        productId: 'p1',
        quantity: 1,
        productAmountCents: 100000,
        baseFeeCents: 500000,
        deliveryFeeCents: 1000000,
        totalAmountCents: 1600000,
        currency: 'COP',
        status: 'APPROVED',
        failureReason: null,
      },
    });

    expect(screen.getByText('¡Pago aprobado!')).toBeInTheDocument();
    expect(screen.getByLabelText('Paso 4 de 4')).toBeInTheDocument();
  });
});
