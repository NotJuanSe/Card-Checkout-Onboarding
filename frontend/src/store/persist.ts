import type { CheckoutState } from './checkoutSlice';

const STORAGE_KEY = 'checkout-state-v1';

/** Campos que sobreviven a un refresh; no guardamos el catálogo ni datos de tarjeta sensibles. */
type PersistedState = Pick<
  CheckoutState,
  | 'step'
  | 'selectedProductId'
  | 'quantity'
  | 'customer'
  | 'delivery'
  | 'card'
  | 'transaction'
  | 'paymentStatus'
>;

export function loadPersistedState(): Partial<CheckoutState> | undefined {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : undefined;
  } catch {
    return undefined;
  }
}

export function persistState(state: CheckoutState): void {
  try {
    const toPersist: PersistedState = {
      step: state.step,
      selectedProductId: state.selectedProductId,
      quantity: state.quantity,
      customer: state.customer,
      delivery: state.delivery,
      card: state.card,
      transaction: state.transaction,
      paymentStatus: state.paymentStatus,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
  } catch {
    // Modo incógnito o almacenamiento lleno: la app sigue funcionando sin persistencia.
  }
}

export function clearPersistedState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sin almacenamiento no hay nada que limpiar.
  }
}
