import { render, screen } from '@testing-library/react';
import { CardBrandLogo } from './CardBrandLogo';

describe('CardBrandLogo', () => {
  it('muestra el logo de VISA', () => {
    render(<CardBrandLogo brand="VISA" />);
    expect(screen.getByLabelText('Tarjeta VISA')).toBeInTheDocument();
    expect(screen.getByTestId('card-brand').querySelector('svg')).toBeInTheDocument();
  });

  it('muestra el logo de Mastercard', () => {
    render(<CardBrandLogo brand="MASTERCARD" />);
    expect(screen.getByLabelText('Tarjeta Mastercard')).toBeInTheDocument();
    expect(screen.getByTestId('card-brand').querySelectorAll('circle')).toHaveLength(2);
  });

  it('no muestra nada si la franquicia es desconocida', () => {
    const { container } = render(<CardBrandLogo brand="UNKNOWN" />);
    expect(container).toBeEmptyDOMElement();
  });
});
