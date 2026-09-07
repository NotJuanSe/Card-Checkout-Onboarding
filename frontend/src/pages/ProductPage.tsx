import { useEffect } from 'react';
import { formatCents } from '../domain/money';
import { loadProducts, selectProduct } from '../store/checkoutSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export function ProductPage() {
  const dispatch = useAppDispatch();
  const { products, productsStatus } = useAppSelector((state) => state.checkout);

  useEffect(() => {
    if (productsStatus === 'idle') {
      void dispatch(loadProducts());
    }
  }, [dispatch, productsStatus]);

  if (productsStatus === 'loading') {
    return <p className="muted">Cargando productos…</p>;
  }

  if (productsStatus === 'error') {
    return (
      <div className="alert" role="alert">
        No pudimos cargar el catálogo. Revisa tu conexión e intenta de nuevo.
      </div>
    );
  }

  return (
    <section className="product-grid">
      {products.map((product) => (
        <article className="card" key={product.id}>
          <img
            className="product__image"
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            width={800}
            height={600}
          />
          <h2 className="product__name">{product.name}</h2>
          <p className="product__description">{product.description}</p>
          <div className="row">
            <strong>{formatCents(product.priceCents)}</strong>
            <span className="muted">
              {product.stock > 0
                ? `${product.stock} disponibles`
                : 'Agotado'}
            </span>
          </div>
          <button
            className="button"
            type="button"
            disabled={product.stock === 0}
            onClick={() =>
              dispatch(selectProduct({ productId: product.id, quantity: 1 }))
            }
          >
            Pagar con tarjeta de crédito
          </button>
        </article>
      ))}
    </section>
  );
}
