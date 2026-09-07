import { useEffect } from 'react';
import { AlertIcon } from '../components/Icons';
import { formatCents } from '../domain/money';
import { loadProducts, selectProduct } from '../store/checkoutSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

function stockLabel(stock: number): { text: string; modifier: string } {
  if (stock === 0) return { text: 'Agotado', modifier: 'out' };
  if (stock <= 4) return { text: `${stock} disponibles`, modifier: 'low' };
  return { text: `${stock} disponibles`, modifier: 'ok' };
}

export function ProductPage() {
  const dispatch = useAppDispatch();
  const { products, productsStatus } = useAppSelector((state) => state.checkout);

  useEffect(() => {
    if (productsStatus === 'idle') {
      void dispatch(loadProducts());
    }
  }, [dispatch, productsStatus]);

  if (productsStatus === 'loading') {
    return (
      <section className="product-grid" aria-busy="true">
        <p className="muted">Cargando productos…</p>
        <div className="skeleton" />
        <div className="skeleton" />
      </section>
    );
  }

  if (productsStatus === 'error') {
    return (
      <div className="alert" role="alert">
        <AlertIcon />
        No pudimos cargar el catálogo. Revisa tu conexión e intenta de nuevo.
      </div>
    );
  }

  return (
    <section className="product-grid">
      {products.map((product) => {
        const stock = stockLabel(product.stock);
        return (
          <article className="card product" key={product.id}>
            <figure className="product__media">
              <img
                className="product__image"
                src={product.imageUrl}
                alt={product.name}
                loading="lazy"
                width={800}
                height={600}
              />
              <figcaption className={`product__stock product__stock--${stock.modifier}`}>
                {stock.text}
              </figcaption>
            </figure>

            <div className="product__body">
              <h2 className="product__name">{product.name}</h2>
              <p className="product__description">{product.description}</p>
              <p className="product__price">{formatCents(product.priceCents)}</p>
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
            </div>
          </article>
        );
      })}
    </section>
  );
}
