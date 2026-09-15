import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultPage } from './ResultPage';
import { renderWithStore } from '../test/renderWithStore';
import * as backend from '../api/backendClient';
import type { Transaction } from '../api/types';

jest.mock('../api/backendClient');
const mockedBackend = backend as jest.Mocked<typeof backend>;

const transaction: Transaction = {
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
};

describe('ResultPage', () => {
  beforeEach(() => jest.clearAllMocks());
  afterEach(() => jest.useRealTimers());

  it('muestra el resultado aprobado con referencia y total', () => {
    renderWithStore(<ResultPage />, { step: 'RESULT', transaction });

    expect(screen.getByText('¡Pago aprobado!')).toBeInTheDocument();
    expect(screen.getByText(/ORD-1-AAA/)).toBeInTheDocument();
  });

  it('explica un pago rechazado con el detalle del banco', () => {
    renderWithStore(<ResultPage />, {
      step: 'RESULT',
      transaction: {
        ...transaction,
        status: 'DECLINED',
        failureReason: 'Fondos insuficientes',
      },
    });

    expect(screen.getByText('Pago rechazado')).toBeInTheDocument();
    expect(screen.getByText(/Fondos insuficientes/)).toBeInTheDocument();
  });

  it('reconsulta el estado mientras la transacción siga pendiente', async () => {
    jest.useFakeTimers();
    mockedBackend.fetchTransaction.mockResolvedValue({
      ...transaction,
      status: 'APPROVED',
    });

    renderWithStore(<ResultPage />, {
      step: 'RESULT',
      transaction: { ...transaction, status: 'PENDING' },
      paymentStatus: 'polling',
    });

    expect(screen.getByText('Procesando tu pago')).toBeInTheDocument();
    jest.advanceTimersByTime(3000);

    await waitFor(() =>
      expect(mockedBackend.fetchTransaction).toHaveBeenCalledWith('t1'),
    );
  });

  it('vuelve a la tienda limpiando el progreso guardado', async () => {
    mockedBackend.fetchProducts.mockResolvedValue([]);
    window.localStorage.setItem('checkout-state-v1', '{"step":"RESULT"}');

    const { store } = renderWithStore(<ResultPage />, {
      step: 'RESULT',
      transaction,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Volver a la tienda' }));

    expect(store.getState().checkout.step).toBe('PRODUCT');
    expect(window.localStorage.getItem('checkout-state-v1')).toBeNull();
  });

  it('muestra el error genérico si nunca hubo transacción', () => {
    renderWithStore(<ResultPage />, {
      step: 'RESULT',
      error: 'No pudimos procesar el pago',
    });

    expect(screen.getByText('No pudimos completar el pago')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos procesar el pago');
  });
});
