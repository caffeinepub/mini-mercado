// Domain types for Mini Market Manager

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string; // base64 data URL
  createdAt: number;
  updatedAt: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: number;
  updatedAt: number;
  totalPurchasesCents?: number;
  eligibleForRaffle?: boolean;
}

export type PaymentMethod = 'PIX' | 'Credit' | 'Debit';

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  amountPaid: number;
  change: number;
  paymentMethod: PaymentMethod;
  customerId?: string | null;
  customerName?: string;
  timestamp: number;
  cashSessionId?: string;
}

export interface CashSession {
  id: string;
  initialFloat: number;
  openedAt: number;
  isOpen: boolean;
}

export interface CashCloseRecord {
  id: string;
  sessionId: string;
  initialFloat: number;
  salesTotal: number;
  grandTotal: number;
  creditTotal: number;
  debitTotal: number;
  pixTotal: number;
  closedAt: number;
}

export interface AppState {
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  currentCashSession?: CashSession;
  cashCloseHistory: CashCloseRecord[];
}
