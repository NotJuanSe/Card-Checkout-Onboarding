import {
  clearPersistedState,
  loadPersistedState,
  persistState,
} from './persist';
import reducer, { type CheckoutState } from './checkoutSlice';

const baseState = (): CheckoutState => reducer(undefined, { type: '@@INIT' });

describe('persistencia del checkout', () => {
  beforeEach(() => window.localStorage.clear());

  it('guarda y recupera el progreso del cliente', () => {
    const state: CheckoutState = {
      ...baseState(),
      step: 'SUMMARY',
      selectedProductId: 'p1',
      quantity: 2,
    };

    persistState(state);

    expect(loadPersistedState()).toMatchObject({
      step: 'SUMMARY',
      selectedProductId: 'p1',
      quantity: 2,
    });
  });

  it('no persiste el catálogo, que se recarga desde la API', () => {
    persistState({
      ...baseState(),
      products: [
        {
          id: 'p1',
          name: 'X',
          description: 'y',
          priceCents: 1,
          imageUrl: 'z',
          stock: 1,
        },
      ],
    });
    expect(loadPersistedState()).not.toHaveProperty('products');
  });

  it.each(['tokenizing', 'paying'] as const)(
    'no persiste el estado "%s": la petición muere al recargar y dejaría la pantalla bloqueada',
    (status) => {
      persistState({ ...baseState(), step: 'SUMMARY', paymentStatus: status });
      expect(loadPersistedState()).toMatchObject({ paymentStatus: 'idle' });
    },
  );

  it('sí conserva el polling, porque ese sí se retoma solo al volver', () => {
    persistState({ ...baseState(), step: 'RESULT', paymentStatus: 'polling' });
    expect(loadPersistedState()).toMatchObject({ paymentStatus: 'polling' });
  });

  it('devuelve undefined si no hay nada guardado o el JSON está corrupto', () => {
    expect(loadPersistedState()).toBeUndefined();
    window.localStorage.setItem('checkout-state-v1', '{no-json');
    expect(loadPersistedState()).toBeUndefined();
  });

  it('limpia el progreso al terminar la compra', () => {
    persistState(baseState());
    clearPersistedState();
    expect(loadPersistedState()).toBeUndefined();
  });

  it('no rompe la app si localStorage no está disponible', () => {
    const setItem = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('modo incógnito');
      });
    const removeItem = jest
      .spyOn(Storage.prototype, 'removeItem')
      .mockImplementation(() => {
        throw new Error('modo incógnito');
      });

    expect(() => persistState(baseState())).not.toThrow();
    expect(() => clearPersistedState()).not.toThrow();

    setItem.mockRestore();
    removeItem.mockRestore();
  });
});
