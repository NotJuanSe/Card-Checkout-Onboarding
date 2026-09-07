import { render, screen } from '@testing-library/react';
import { CardPreview } from './CardPreview';

const empty = { number: '', holder: '', expMonth: '', expYear: '', cvc: '' };

describe('CardPreview', () => {
  it('muestra marcadores mientras no hay datos', () => {
    render(<CardPreview card={empty} />);
    expect(screen.getByText('•••• •••• •••• ••••')).toBeInTheDocument();
    expect(screen.getByText('NOMBRE APELLIDO')).toBeInTheDocument();
    expect(screen.getByText('MM/AA')).toBeInTheDocument();
  });

  it('completa con puntos lo que falta por escribir', () => {
    render(<CardPreview card={{ ...empty, number: '424242' }} />);
    expect(screen.getByText('4242 42•• •••• ••••')).toBeInTheDocument();
  });

  it('refleja titular, vigencia y franquicia', () => {
    render(
      <CardPreview
        card={{
          ...empty,
          number: '4242424242424242',
          holder: 'ANA GOMEZ',
          expMonth: '12',
          expYear: '30',
        }}
      />,
    );
    expect(screen.getByText('ANA GOMEZ')).toBeInTheDocument();
    expect(screen.getByText('12/30')).toBeInTheDocument();
    expect(screen.getByLabelText('Tarjeta VISA')).toBeInTheDocument();
  });
});
