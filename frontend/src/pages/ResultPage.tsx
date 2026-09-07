import { useEffect } from 'react';
import {
  AlertIcon,
  CheckIcon,
  ReceiptIcon,
  SpinnerIcon,
} from '../components/Icons';
import { formatCents } from '../domain/money';
import {
  loadProducts,
  refreshTransaction,
  resetCheckout,
} from '../store/checkoutSlice';
import { clearPersistedState } from '../store/persist';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const POLL_INTERVAL_MS = 3000;

const ICONS = {
  APPROVED: CheckIcon,
  DECLINED: AlertIcon,
  ERROR: AlertIcon,
  PENDING: SpinnerIcon,
};

const COPY = {
  APPROVED: {
    title: '¡Pago aprobado!',
    detail: 'Ya estamos alistando tu pedido para el envío.',
  },
  DECLINED: {
    title: 'Pago rechazado',
    detail: 'Tu banco no autorizó la transacción. Puedes intentar con otra tarjeta.',
  },
  ERROR: {
    title: 'No pudimos completar el pago',
    detail: 'Ocurrió un problema procesando la transacción.',
  },
  PENDING: {
    title: 'Procesando tu pago',
    detail: 'Estamos confirmando la transacción con el banco.',
  },
};

export function ResultPage() {
  const dispatch = useAppDispatch();
  const { transaction, paymentStatus, error } = useAppSelector(
    (state) => state.checkout,
  );

  const status = transaction?.status ?? 'ERROR';

  useEffect(() => {
    if (!transaction || status !== 'PENDING') return undefined;

    const timer = window.setInterval(() => {
      void dispatch(refreshTransaction(transaction.id));
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [dispatch, transaction, status]);

  function backToProducts(): void {
    clearPersistedState();
    dispatch(resetCheckout());
    void dispatch(loadProducts());
  }

  const copy = COPY[status];
  const StatusIcon = ICONS[status];

  return (
    <section className="card status" aria-live="polite">
      <span
        className={`status__icon status__icon--${status.toLowerCase()}`}
        aria-hidden="true"
      >
        <StatusIcon />
      </span>
      <span className={`status__badge status__badge--${status.toLowerCase()}`}>
        {status}
      </span>
      <h2 className="app__title">{copy.title}</h2>
      <p className="muted">{copy.detail}</p>

      {transaction && (
        <>
          <strong className="status__amount">
            {formatCents(transaction.totalAmountCents)}
          </strong>
          <p className="status__reference">
            <ReceiptIcon /> Referencia: {transaction.reference}
          </p>
        </>
      )}

      {transaction?.failureReason && (
        <p className="muted">Detalle: {transaction.failureReason}</p>
      )}

      {error && (
        <div className="alert" role="alert">
          <AlertIcon />
          {error}
        </div>
      )}

      {paymentStatus === 'polling' && (
        <p className="muted">Actualizando estado…</p>
      )}

      <button className="button" type="button" onClick={backToProducts}>
        Volver a la tienda
      </button>
    </section>
  );
}
