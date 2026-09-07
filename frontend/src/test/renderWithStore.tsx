import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer, { type CheckoutState } from '../store/checkoutSlice';

export function buildStore(preloaded?: Partial<CheckoutState>) {
  const initial = checkoutReducer(undefined, { type: '@@INIT' });
  return configureStore({
    reducer: { checkout: checkoutReducer },
    preloadedState: { checkout: { ...initial, ...preloaded } },
  });
}

export function renderWithStore(
  ui: ReactElement,
  preloaded?: Partial<CheckoutState>,
): RenderResult & { store: ReturnType<typeof buildStore> } {
  const store = buildStore(preloaded);
  return {
    store,
    ...render(<Provider store={store}>{ui}</Provider>),
  };
}
