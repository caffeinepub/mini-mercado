import { useState } from 'react';
import type { Product } from '../../types/domain';
import type { CartItem } from './cartTypes';
import { calculateCartTotal } from './cartTypes';
import { ptBR } from '../../i18n/ptBR';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addItem = (product: Product, quantity: number = 1) => {
    setError(null);
    
    if (quantity > product.stock) {
      setError(ptBR.onlyUnitsAvailable(product.stock));
      return false;
    }

    setItems((current) => {
      const existingIndex = current.findIndex((item) => item.product.id === product.id);
      
      if (existingIndex >= 0) {
        const existing = current[existingIndex];
        const newQuantity = existing.quantity + quantity;
        
        if (newQuantity > product.stock) {
          setError(ptBR.onlyUnitsAvailable(product.stock));
          return current;
        }
        
        const updated = [...current];
        updated[existingIndex] = { ...existing, quantity: newQuantity };
        return updated;
      }
      
      return [...current, { product, quantity }];
    });
    
    return true;
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setError(null);
    
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((current) => {
      const item = current.find((i) => i.product.id === productId);
      if (!item) return current;
      
      if (quantity > item.product.stock) {
        setError(ptBR.onlyUnitsAvailable(item.product.stock));
        return current;
      }
      
      return current.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      );
    });
  };

  const removeItem = (productId: string) => {
    setError(null);
    setItems((current) => current.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setError(null);
    setItems([]);
  };

  const setCartItems = (newItems: CartItem[]) => {
    setError(null);
    setItems(newItems);
  };

  const total = calculateCartTotal(items);

  return {
    items,
    total,
    error,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    setCartItems,
  };
}
