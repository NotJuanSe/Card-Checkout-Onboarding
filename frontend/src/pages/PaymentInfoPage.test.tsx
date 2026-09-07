import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentInfoPage } from './PaymentInfoPage';
import { renderWithStore } from '../test/renderWithStore';
import * as gateway from '../api/gatewayClient';

jest.mock('../api/gatewayClient');
const mockedGateway = gateway as jest.Mocked<typeof gateway>;

async function fillValidForm(): Promise<void> {
  await userEvent.type(screen.getByLabelText('Número de tarjeta'), '4242424242424242');
  await userEvent.type(screen.getByLabelText('Titular de la tarjeta'), 'ANA GOMEZ');
  await userEvent.type(screen.getByLabelText('Vence (MM/AA)'), '1230');
  await userEvent.type(screen.getByLabelText('CVC'), '123');
  await userEvent.type(screen.getByLabelText('Nombre completo'), 'Ana Gómez');
  await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
  await userEvent.type(screen.getByLabelText('Teléfono'), '3001234567');
  await userEvent.type(screen.getByLabelText('Documento'), '1020304050');
  await userEvent.type(screen.getByLabelText('Dirección de entrega'), 'Calle 123 #45-67');
  await userEvent.type(screen.getByLabelText('Ciudad'), 'Bogotá');
  await userEvent.type(screen.getByLabelText('Departamento'), 'Cundinamarca');
}

describe('PaymentInfoPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('muestra el logo de la franquicia mientras se escribe el número', async () => {
    renderWithStore(<PaymentInfoPage />);

    await userEvent.type(screen.getByLabelText('Número de tarjeta'), '4242');
    expect(screen.getByTestId('card-brand')).toHaveTextContent('VISA');

    await userEvent.clear(screen.getByLabelText('Número de tarjeta'));
    await userEvent.type(screen.getByLabelText('Número de tarjeta'), '5555');
    expect(screen.getByTestId('card-brand')).toHaveTextContent('Mastercard');
  });

  it('formatea el número en bloques de cuatro', async () => {
    renderWithStore(<PaymentInfoPage />);
    await userEvent.type(screen.getByLabelText('Número de tarjeta'), '4242424242424242');
    expect(screen.getByLabelText('Número de tarjeta')).toHaveValue('4242 4242 4242 4242');
  });

  it('bloquea el envío y muestra errores con datos inválidos', async () => {
    renderWithStore(<PaymentInfoPage />);

    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findAllByRole('alert')).not.toHaveLength(0);
    expect(mockedGateway.tokenizeCard).not.toHaveBeenCalled();
  });

  it('tokeniza la tarjeta y guarda solo los últimos cuatro dígitos', async () => {
    mockedGateway.tokenizeCard.mockResolvedValue('tok_1');
    const { store } = renderWithStore(<PaymentInfoPage />);

    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => expect(store.getState().checkout.card).not.toBeNull());
    expect(store.getState().checkout.card).toMatchObject({
      brand: 'VISA',
      lastFour: '4242',
      token: 'tok_1',
    });
    expect(store.getState().checkout.step).toBe('SUMMARY');
  });

  it('avisa si la pasarela rechaza la tarjeta', async () => {
    mockedGateway.tokenizeCard.mockRejectedValue(new Error('tarjeta inválida'));
    renderWithStore(<PaymentInfoPage />);

    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(
      await screen.findByText(/No pudimos validar la tarjeta/i),
    ).toBeInTheDocument();
  });

  it('permite volver al listado de productos', async () => {
    const { store } = renderWithStore(<PaymentInfoPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Volver' }));
    expect(store.getState().checkout.step).toBe('PRODUCT');
  });
});
