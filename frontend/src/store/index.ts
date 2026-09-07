import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer from './checkoutSlice';
import { loadPersistedState, persistState } from './persist';

export function createStore(preloaded?: Partial<ReturnType<typeof checkoutReducer>>) {
  const store = configureStore({
    reducer: { checkout: checkoutReducer },
    preloadedState: preloaded
      ? { checkout: { ...checkoutReducer(undefined, { type: '@@INIT' }), ...preloaded } }
      : undefined,
  });

  store.subscribe(() => persistState(store.getState().checkout));
  return store;
}

export const store = createStore(loadPersistedState());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
