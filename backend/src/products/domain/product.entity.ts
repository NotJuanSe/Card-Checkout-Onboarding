export interface Product {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  stock: number;
}

export function hasEnoughStock(product: Product, quantity: number): boolean {
  return quantity > 0 && product.stock >= quantity;
}

export function productAmountCents(product: Product, quantity: number): number {
  return product.priceCents * quantity;
}
