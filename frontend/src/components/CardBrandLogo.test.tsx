import { render, screen } from '@testing-library/react';
import { CardBrandLogo } from './CardBrandLogo';

describe('CardBrandLogo', () => {
  it('muestra el logo de VISA', () => {
    render(<CardBrandLogo brand="VISA" />);
    expect(screen.getByTestId('card-brand')).toHaveTextContent('VISA');
  });

  it('muestra el logo de Mastercard', () => {
    render(<CardBrandLogo brand="MASTERCARD" />);
    expect(screen.getByTestId('card-brand')).toHaveTextContent('Mastercard');
  });

  it('no muestra nada si la franquicia es desconocida', () => {
    const { container } = render(<CardBrandLogo brand="UNKNOWN" />);
    expect(container).toBeEmptyDOMElement();
  });
});
