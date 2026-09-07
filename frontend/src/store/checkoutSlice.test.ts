import reducer, {
  goToStep,
  loadProducts,
  payThunk,
  refreshTransaction,
  resetCheckout,
  savePaymentInfo,
  selectProduct,
  selectSelectedProduct,
  tokenizeCardThunk,
  type CheckoutState,
} from './checkoutSlice';
import type { Product, Transaction } from '../api/types';

const product: Product = {
  id: 'p1',
  name: 'Audífonos',
  description: 'desc',
  priceCents: 100000,
  imageUrl: 'http://img',
  stock: 5,
};

const transaction: Transaction = {
  id: 't1',
  reference: 'ORD-1-AAA',
  productId: 'p1',
  quantity: 1,
  productAmountCents: 100000,
  baseFeeCents: 500000,
  deliveryFeeCents: 1000000,
  totalAmountCents: 1600000,
  currency: 'COP',
  status: 'PENDING',
  failureReason: null,
};

const initial = (): CheckoutState => reducer(undefined, { type: '@@INIT' });

describe('checkoutSlice', () => {
  it('empieza en la pantalla de producto', () => {
    expect(initial().step).toBe('PRODUCT');
  });

  it('selecciona producto y avanza a datos de pago', () => {
    const state = reducer(
      initial(),
      selectProduct({ productId: 'p1', quantity: 2 }),
    );
    expect(state).toMatchObject({
      selectedProductId: 'p1',
      quantity: 2,
      step: 'PAYMENT_INFO',
    });
  });

  it('guarda datos de cliente y entrega', () => {
    const customer = {
      fullName: 'Ana',
      email: 'a@b.co',
      phone: '3001234567',
      legalId: '123456',
    };
    const delivery = { address: 'Calle 1', city: 'Bogotá', region: 'Cund' };
    const state = reducer(initial(), savePaymentInfo({ customer, delivery }));
    expect(state.customer).toEqual(customer);
    expect(state.delivery).toEqual(delivery);
  });

  it('navega entre pasos y reinicia el checkout', () => {
    const state = reducer(initial(), goToStep('SUMMARY'));
    expect(state.step).toBe('SUMMARY');
    expect(reducer(state, resetCheckout()).step).toBe('PRODUCT');
  });

  it('maneja el ciclo de carga del catálogo', () => {
    const loading = reducer(initial(), { type: loadProducts.pending.type });
    expect(loading.productsStatus).toBe('loading');

    const ready = reducer(loading, {
      type: loadProducts.fulfilled.type,
      payload: [product],
    });
    expect(ready.products).toEqual([product]);
    expect(ready.productsStatus).toBe('ready');

    const failed = reducer(loading, { type: loadProducts.rejected.type });
    expect(failed.productsStatus).toBe('error');
    expect(failed.error).toBeTruthy();
  });

  it('guarda solo datos no sensibles al tokenizar y avanza al resumen', () => {
    const card = {
      brand: 'VISA' as const,
      lastFour: '4242',
      holder: 'ANA GOMEZ',
      token: 'tok_1',
      installments: 3,
    };
    const state = reducer(initial(), {
      type: tokenizeCardThunk.fulfilled.type,
      payload: card,
    });

    expect(state.card).toEqual(card);
    expect(state.step).toBe('SUMMARY');
    expect(JSON.stringify(state)).not.toContain('4242424242424242');
  });

  it('reporta error si la tokenización falla', () => {
    const state = reducer(initial(), { type: tokenizeCardThunk.rejected.type });
    expect(state.paymentStatus).toBe('error');
    expect(state.error).toBeTruthy();
  });

  it('pasa a polling cuando el pago queda PENDING', () => {
    const state = reducer(initial(), {
      type: payThunk.fulfilled.type,
      payload: transaction,
    });
    expect(state.step).toBe('RESULT');
    expect(state.paymentStatus).toBe('polling');
  });

  it('marca done cuando el pago llega aprobado', () => {
    const state = reducer(initial(), {
      type: payThunk.fulfilled.type,
      payload: { ...transaction, status: 'APPROVED' },
    });
    expect(state.paymentStatus).toBe('done');
  });

  it('muestra la pantalla de resultado si el pago falla', () => {
    const state = reducer(initial(), { type: payThunk.rejected.type });
    expect(state.step).toBe('RESULT');
    expect(state.paymentStatus).toBe('error');
  });

  it('actualiza la transacción al refrescar el estado', () => {
    const state = reducer(initial(), {
      type: refreshTransaction.fulfilled.type,
      payload: { ...transaction, status: 'APPROVED' },
    });
    expect(state.transaction?.status).toBe('APPROVED');
    expect(state.paymentStatus).toBe('done');
  });

  it('selectSelectedProduct devuelve el producto elegido o null', () => {
    const state = { checkout: { ...initial(), products: [product], selectedProductId: 'p1' } };
    expect(selectSelectedProduct(state)).toEqual(product);
    expect(
      selectSelectedProduct({ checkout: { ...state.checkout, selectedProductId: 'x' } }),
    ).toBeNull();
  });
});
