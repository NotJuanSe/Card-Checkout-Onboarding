import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  createTransaction,
  fetchProducts,
  fetchTransaction,
} from '../api/backendClient';
import type {
  CustomerForm,
  DeliveryForm,
  Product,
  Transaction,
} from '../api/types';
import { tokenizeCard, type TokenizableCard } from '../api/gatewayClient';
import { detectBrand, lastFour, type CardBrand } from '../domain/card';

export type CheckoutStep = 'PRODUCT' | 'PAYMENT_INFO' | 'SUMMARY' | 'RESULT';

/** Solo datos no sensibles de la tarjeta: nunca el número completo ni el CVC. */
export interface CardSummary {
  brand: CardBrand;
  lastFour: string;
  holder: string;
  token: string;
  installments: number;
}

export interface CheckoutState {
  step: CheckoutStep;
  products: Product[];
  productsStatus: 'idle' | 'loading' | 'ready' | 'error';
  selectedProductId: string | null;
  quantity: number;
  customer: CustomerForm | null;
  delivery: DeliveryForm | null;
  card: CardSummary | null;
  transaction: Transaction | null;
  paymentStatus: 'idle' | 'tokenizing' | 'paying' | 'polling' | 'done' | 'error';
  error: string | null;
}

const initialState: CheckoutState = {
  step: 'PRODUCT',
  products: [],
  productsStatus: 'idle',
  selectedProductId: null,
  quantity: 1,
  customer: null,
  delivery: null,
  card: null,
  transaction: null,
  paymentStatus: 'idle',
  error: null,
};

export const loadProducts = createAsyncThunk('checkout/loadProducts', () =>
  fetchProducts(),
);

export const tokenizeCardThunk = createAsyncThunk(
  'checkout/tokenizeCard',
  async (payload: { card: TokenizableCard; installments: number }) => {
    const token = await tokenizeCard(payload.card);
    return {
      brand: detectBrand(payload.card.number),
      lastFour: lastFour(payload.card.number),
      holder: payload.card.holder,
      token,
      installments: payload.installments,
    } satisfies CardSummary;
  },
);

export const payThunk = createAsyncThunk<
  Transaction,
  void,
  { state: { checkout: CheckoutState } }
>('checkout/pay', async (_void, { getState }) => {
  const { selectedProductId, quantity, customer, delivery, card } =
    getState().checkout;
  if (!selectedProductId || !customer || !delivery || !card) {
    throw new Error('Faltan datos para completar el pago');
  }
  return createTransaction({
    productId: selectedProductId,
    quantity,
    customer,
    delivery,
    cardToken: card.token,
    installments: card.installments,
  });
});

export const refreshTransaction = createAsyncThunk(
  'checkout/refreshTransaction',
  (id: string) => fetchTransaction(id),
);

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    goToStep(state, action: PayloadAction<CheckoutStep>) {
      state.step = action.payload;
    },
    selectProduct(
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) {
      state.selectedProductId = action.payload.productId;
      state.quantity = action.payload.quantity;
      state.step = 'PAYMENT_INFO';
      state.error = null;
    },
    savePaymentInfo(
      state,
      action: PayloadAction<{ customer: CustomerForm; delivery: DeliveryForm }>,
    ) {
      state.customer = action.payload.customer;
      state.delivery = action.payload.delivery;
    },
    resetCheckout() {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProducts.pending, (state) => {
        state.productsStatus = 'loading';
      })
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.productsStatus = 'ready';
      })
      .addCase(loadProducts.rejected, (state) => {
        state.productsStatus = 'error';
        state.error = 'No pudimos cargar el catálogo';
      })
      .addCase(tokenizeCardThunk.pending, (state) => {
        state.paymentStatus = 'tokenizing';
        state.error = null;
      })
      .addCase(tokenizeCardThunk.fulfilled, (state, action) => {
        state.card = action.payload;
        state.paymentStatus = 'idle';
        state.step = 'SUMMARY';
      })
      .addCase(tokenizeCardThunk.rejected, (state) => {
        state.paymentStatus = 'error';
        state.error = 'No pudimos validar la tarjeta. Revisa los datos.';
      })
      .addCase(payThunk.pending, (state) => {
        state.paymentStatus = 'paying';
        state.error = null;
      })
      .addCase(payThunk.fulfilled, (state, action) => {
        state.transaction = action.payload;
        state.paymentStatus =
          action.payload.status === 'PENDING' ? 'polling' : 'done';
        state.step = 'RESULT';
      })
      .addCase(payThunk.rejected, (state) => {
        state.paymentStatus = 'error';
        state.step = 'RESULT';
        state.error = 'No pudimos procesar el pago';
      })
      .addCase(refreshTransaction.fulfilled, (state, action) => {
        state.transaction = action.payload;
        state.paymentStatus =
          action.payload.status === 'PENDING' ? 'polling' : 'done';
      });
  },
});

export const { goToStep, selectProduct, savePaymentInfo, resetCheckout } =
  checkoutSlice.actions;

export const selectSelectedProduct = (state: {
  checkout: CheckoutState;
}): Product | null =>
  state.checkout.products.find((p) => p.id === state.checkout.selectedProductId) ??
  null;

export default checkoutSlice.reducer;
