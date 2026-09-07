import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field } from './Field';

describe('Field', () => {
  it('propaga lo que escribe la persona', async () => {
    const onChange = jest.fn();
    render(<Field id="nombre" label="Nombre" value="" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Nombre'), 'A');

    expect(onChange).toHaveBeenCalledWith('A');
  });

  it('anuncia el error de forma accesible', () => {
    render(
      <Field
        id="email"
        label="Correo"
        value="x"
        onChange={jest.fn()}
        error="Correo inválido"
      />,
    );

    const input = screen.getByLabelText('Correo');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Correo inválido');
  });
});
