import type { CardBrand } from '../domain/card';

const LABELS: Record<CardBrand, string> = {
  VISA: 'VISA',
  MASTERCARD: 'Mastercard',
  UNKNOWN: '',
};

export function CardBrandLogo({ brand }: Readonly<{ brand: CardBrand }>) {
  if (brand === 'UNKNOWN') return null;

  return (
    <span
      className={`card-number__brand card-number__brand--${brand.toLowerCase()}`}
      data-testid="card-brand"
      aria-label={`Tarjeta ${LABELS[brand]}`}
    >
      {LABELS[brand]}
    </span>
  );
}
