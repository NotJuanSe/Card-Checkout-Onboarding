import { screen } from '@testing-library/react';
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
