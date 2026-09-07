import { createStore } from './index';
import { goToStep } from './checkoutSlice';
import { loadPersistedState } from './persist';

describe('createStore', () => {
  beforeEach(() => window.localStorage.clear());

  it('persiste el progreso en cada acción despachada', () => {
    const store = createStore();

    store.dispatch(goToStep('SUMMARY'));

    expect(loadPersistedState()).toMatchObject({ step: 'SUMMARY' });
  });

  it('arranca desde el estado recuperado tras un refresh', () => {
    const store = createStore({ step: 'RESULT', quantity: 3 });

    expect(store.getState().checkout).toMatchObject({
      step: 'RESULT',
      quantity: 3,
      products: [],
    });
  });
});
