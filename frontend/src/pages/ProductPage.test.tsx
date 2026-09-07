import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductPage } from './ProductPage';
import { renderWithStore } from '../test/renderWithStore';
import * as backend from '../api/backendClient';

jest.mock('../api/backendClient');
const mockedBackend = backend as jest.Mocked<typeof backend>;

const product = {
  id: 'p1',
  name: 'Audífonos Aurora',
  description: 'Cancelación de ruido',
  priceCents: 45990000,
  imageUrl: 'http://img',
  stock: 3,
};

describe('ProductPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('carga el catálogo y muestra precio y stock', async () => {
    mockedBackend.fetchProducts.mockResolvedValue([product]);

    renderWithStore(<ProductPage />);

    expect(await screen.findByText('Audífonos Aurora')).toBeInTheDocument();
    expect(screen.getByText('3 disponibles')).toBeInTheDocument();
  });

  it('avanza al formulario de pago al elegir el producto', async () => {
    mockedBackend.fetchProducts.mockResolvedValue([product]);
    const { store } = renderWithStore(<ProductPage />);

    await userEvent.click(
      await screen.findByRole('button', { name: /Pagar con tarjeta/i }),
    );

    expect(store.getState().checkout.step).toBe('PAYMENT_INFO');
    expect(store.getState().checkout.selectedProductId).toBe('p1');
  });

  it('deshabilita la compra de un producto agotado', async () => {
    mockedBackend.fetchProducts.mockResolvedValue([{ ...product, stock: 0 }]);

    renderWithStore(<ProductPage />);

    expect(await screen.findByText('Agotado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pagar con tarjeta/i })).toBeDisabled();
  });

  it('avisa cuando el catálogo no carga', async () => {
    mockedBackend.fetchProducts.mockRejectedValue(new Error('sin red'));

    renderWithStore(<ProductPage />);

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar'),
    );
  });

  it('muestra el estado de carga', () => {
    renderWithStore(<ProductPage />, { productsStatus: 'loading' });
    expect(screen.getByText('Cargando productos…')).toBeInTheDocument();
  });
});
