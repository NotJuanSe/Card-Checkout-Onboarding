import { render, screen } from '@testing-library/react';
import { StepIndicator } from './StepIndicator';

describe('StepIndicator', () => {
  it('indica el paso actual del proceso de 5 pantallas', () => {
    render(<StepIndicator step="SUMMARY" />);
    expect(screen.getByLabelText('Paso 3 de 4')).toBeInTheDocument();
  });

  it('marca como activos los pasos ya recorridos', () => {
    const { container } = render(<StepIndicator step="PAYMENT_INFO" />);
    expect(container.querySelectorAll('.steps__dot--active')).toHaveLength(2);
  });
});
