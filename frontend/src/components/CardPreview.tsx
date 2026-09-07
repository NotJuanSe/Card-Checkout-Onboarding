import { CardBrandLogo } from './CardBrandLogo';
import { detectBrand, formatCardNumber, type CardInput } from '../domain/card';

const PLACEHOLDER = '•••• •••• •••• ••••';

/** Rellena con puntos lo que la persona aún no ha escrito, para que la tarjeta
 *  se vea completa desde el primer dígito. */
function maskedNumber(value: string): string {
  const formatted = formatCardNumber(value);
  return formatted ? formatted + PLACEHOLDER.slice(formatted.length) : PLACEHOLDER;
}

export function CardPreview({ card }: Readonly<{ card: CardInput }>) {
  const expiry =
    card.expMonth || card.expYear
      ? `${card.expMonth || 'MM'}/${card.expYear || 'AA'}`
      : 'MM/AA';

  return (
    <div className="card-preview" aria-hidden="true">
      <div className="card-preview__top">
        <div className="card-preview__chip" />
        <CardBrandLogo brand={detectBrand(card.number)} />
      </div>
      <p className="card-preview__number">{maskedNumber(card.number)}</p>
      <div className="card-preview__meta">
        <div>
          <span>Titular</span>
          <strong>{card.holder || 'NOMBRE APELLIDO'}</strong>
        </div>
        <div>
          <span>Vence</span>
          <strong>{expiry}</strong>
        </div>
      </div>
    </div>
  );
}
