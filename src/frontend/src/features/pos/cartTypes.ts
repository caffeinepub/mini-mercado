import type { Product, SaleItem } from '../../types/domain';

export interface CartItem {
  product: Product;
  quantity: number;
}

export function calculateLineSubtotal(item: CartItem): number {
  return item.product.price * item.quantity;
}

export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + calculateLineSubtotal(item), 0);
}

export function cartItemsToSaleItems(items: CartItem[]): SaleItem[] {
  return items.map((item) => ({
    productId: item.product.id,
    productName: item.product.name,
    quantity: item.quantity,
    unitPrice: item.product.price,
    subtotal: calculateLineSubtotal(item),
  }));
}
