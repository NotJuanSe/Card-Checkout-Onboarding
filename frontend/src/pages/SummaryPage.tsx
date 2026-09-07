import { useEffect, useState } from 'react';
import { CardBrandLogo } from '../components/CardBrandLogo';
import { AlertIcon, LockIcon, ReceiptIcon } from '../components/Icons';
import { quoteTransaction, type AmountBreakdown } from '../api/backendClient';
import { formatCents } from '../domain/money';
import {
  goToStep,
  payThunk,
  selectSelectedProduct,
} from '../store/checkoutSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

/**
 * Backdrop (Material): el detalle del pedido queda al fondo y el resumen con el
 * botón de pago se muestra en la hoja frontal.
 */
export function SummaryPage() {
  const dispatch = useAppDispatch();
  const { quantity, card, delivery, paymentStatus } = useAppSelector(
    (state) => state.checkout,
  );
  const product = useAppSelector(selectSelectedProduct);
  const [quote, setQuote] = useState<AmountBreakdown | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  useEffect(() => {
    if (!product || !delivery) return;

    quoteTransaction({
      productId: product.id,
      quantity,
      city: delivery.city,
    })
      .then(setQuote)
      .catch(() => setQuoteError('No pudimos calcular el total de la compra'));
  }, [product, delivery, quantity]);

  if (!product || !card || !delivery) {
    return (
      <div className="alert" role="alert">
        Falta información de la compra. Vuelve al producto para empezar de nuevo.
      </div>
    );
  }

  return (
    <>
      <section className="card">
        <p className="section-title">
          <ReceiptIcon />
          Tu pedido
        </p>
        <div className="row">
          <span>
            {product.name} × {quantity}
          </span>
          <strong>{formatCents(product.priceCents * quantity)}</strong>
        </div>
        <p className="muted">
          Entrega en {delivery.address}, {delivery.city}
        </p>
        <p className="muted card-summary">
          <span className="card-summary__logo">
            <CardBrandLogo brand={card.brand} />
          </span>
          Terminada en {card.lastFour} · {card.installments}{' '}
          {card.installments === 1 ? 'cuota' : 'cuotas'}
        </p>
      </section>

      <dialog className="backdrop" open aria-label="Resumen de pago">
        <div className="backdrop__sheet">
          <div className="backdrop__handle" />
          <h2 className="app__title">Resumen del pago</h2>

          {quoteError && (
            <div className="alert" role="alert">
              <AlertIcon />
              {quoteError}
            </div>
          )}

          {quote ? (
            <>
              <div className="row">
                <span>Producto</span>
                <span>{formatCents(quote.productAmountCents)}</span>
              </div>
              <div className="row">
                <span>Tarifa base</span>
                <span>{formatCents(quote.baseFeeCents)}</span>
              </div>
              <div className="row">
                <span>Envío</span>
                <span>{formatCents(quote.deliveryFeeCents)}</span>
              </div>
              <div className="row row--total">
                <span>Total</span>
                <span>{formatCents(quote.totalAmountCents)}</span>
              </div>
            </>
          ) : (
            !quoteError && <p className="muted">Calculando total…</p>
          )}

          <button
            className="button"
            type="button"
            disabled={!quote || paymentStatus === 'paying'}
            onClick={() => void dispatch(payThunk())}
          >
            {paymentStatus === 'paying' ? (
              'Procesando pago…'
            ) : (
              <>
                <LockIcon />
                Pagar ahora
              </>
            )}
          </button>
          <button
            className="button button--ghost"
            type="button"
            onClick={() => dispatch(goToStep('PAYMENT_INFO'))}
          >
            Editar datos
          </button>

          <p className="secure-note">
            <LockIcon />
            El cobro lo procesa la pasarela; no almacenamos tu tarjeta.
          </p>
        </div>
      </dialog>
    </>
  );
}
