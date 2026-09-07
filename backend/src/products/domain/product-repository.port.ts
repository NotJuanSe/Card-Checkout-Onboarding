import { Product } from './product.entity';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductRepositoryPort {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  /** Descuenta stock solo si sigue habiendo suficiente. Devuelve null si no alcanzó. */
  decrementStock(id: string, quantity: number): Promise<Product | null>;
}
