import { create } from 'zustand';
import type { AppState, Product, Customer, Sale, CashSession, CashCloseRecord } from '../types/domain';
import { loadState, saveState } from '../storage/localStorageStore';

interface AppStore extends AppState {
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => void;
  deleteProduct: (id: string) => void;
  
  // Customer actions (kept for backward compatibility, but backend should be used)
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomer: (id: string, updates: Partial<Omit<Customer, 'id' | 'createdAt'>>) => void;
  deleteCustomer: (id: string) => void;
  
  // Sale actions (kept for backward compatibility, but backend should be used)
  addSale: (sale: Omit<Sale, 'id' | 'timestamp'>) => void;
  
  // Cash session actions (kept for backward compatibility, but backend should be used)
  openCashSession: (initialFloat: number) => void;
  closeCashSession: (closeRecord: Omit<CashCloseRecord, 'id' | 'closedAt'>) => void;
  
  // Backend-driven setters
  setSales: (sales: Sale[]) => void;
  setCustomers: (customers: Customer[]) => void;
  setCurrentCashSession: (session: CashSession | undefined) => void;
  setCashCloseHistory: (history: CashCloseRecord[]) => void;
  
  // Utility
  rehydrate: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  ...loadState(),
  
  addProduct: (product) => {
    const newProduct: Product = {
      ...product,
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => {
      const newState = { ...state, products: [...state.products, newProduct] };
      saveState(newState);
      return newState;
    });
  },
  
  updateProduct: (id, updates) => {
    set((state) => {
      const newState = {
        ...state,
        products: state.products.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
        ),
      };
      saveState(newState);
      return newState;
    });
  },
  
  deleteProduct: (id) => {
    set((state) => {
      const newState = {
        ...state,
        products: state.products.filter((p) => p.id !== id),
      };
      saveState(newState);
      return newState;
    });
  },
  
  addCustomer: (customer) => {
    const newCustomer: Customer = {
      ...customer,
      id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => {
      const newState = { ...state, customers: [...state.customers, newCustomer] };
      saveState(newState);
      return newState;
    });
  },
  
  updateCustomer: (id, updates) => {
    set((state) => {
      const newState = {
        ...state,
        customers: state.customers.map((c) =>
          c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
        ),
      };
      saveState(newState);
      return newState;
    });
  },
  
  deleteCustomer: (id) => {
    set((state) => {
      const newState = {
        ...state,
        customers: state.customers.filter((c) => c.id !== id),
      };
      saveState(newState);
      return newState;
    });
  },
  
  addSale: (sale) => {
    const newSale: Sale = {
      ...sale,
      id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      cashSessionId: get().currentCashSession?.id,
    };
    
    set((state) => {
      // Update product stock
      const updatedProducts = state.products.map((product) => {
        const saleItem = sale.items.find((item) => item.productId === product.id);
        if (saleItem) {
          return {
            ...product,
            stock: product.stock - saleItem.quantity,
            updatedAt: Date.now(),
          };
        }
        return product;
      });
      
      const newState = {
        ...state,
        sales: [...state.sales, newSale],
        products: updatedProducts,
      };
      saveState(newState);
      return newState;
    });
  },
  
  openCashSession: (initialFloat) => {
    const session: CashSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      initialFloat,
      openedAt: Date.now(),
      isOpen: true,
    };
    set((state) => {
      const newState = { ...state, currentCashSession: session };
      saveState(newState);
      return newState;
    });
  },
  
  closeCashSession: (closeRecord) => {
    const record: CashCloseRecord = {
      ...closeRecord,
      id: `close_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      closedAt: Date.now(),
    };
    set((state) => {
      const newState = {
        ...state,
        currentCashSession: undefined,
        cashCloseHistory: [...state.cashCloseHistory, record],
      };
      saveState(newState);
      return newState;
    });
  },
  
  // Backend-driven setters
  setSales: (sales) => {
    set((state) => ({ ...state, sales }));
  },
  
  setCustomers: (customers) => {
    set((state) => ({ ...state, customers }));
  },
  
  setCurrentCashSession: (session) => {
    set((state) => ({ ...state, currentCashSession: session }));
  },
  
  setCashCloseHistory: (history) => {
    set((state) => ({ ...state, cashCloseHistory: history }));
  },
  
  rehydrate: () => {
    set(loadState());
  },
}));
