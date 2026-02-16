// Mapping utilities between frontend domain models and backend types
import type { PaymentMethod as FrontendPaymentMethod, SaleItem as FrontendSaleItem, Customer as FrontendCustomer } from '../types/domain';
import { PaymentMethod as BackendPaymentMethod, type SaleItem as BackendSaleItem, type Customer as BackendCustomer, type Sale as BackendSale, type CashRegisterSession as BackendCashRegisterSession, type ClosingRecord as BackendClosingRecord } from '../backend';

// Convert BRL to cents (multiply by 100)
export function brlToCents(brl: number): bigint {
  return BigInt(Math.round(brl * 100));
}

// Convert cents to BRL (divide by 100)
export function centsToBrl(cents: bigint): number {
  return Number(cents) / 100;
}

// Map frontend payment method to backend
export function mapPaymentMethodToBackend(method: FrontendPaymentMethod): BackendPaymentMethod {
  switch (method) {
    case 'Cash':
      return BackendPaymentMethod.cash;
    case 'Credit':
    case 'Debit':
    case 'PIX':
      return BackendPaymentMethod.card;
    default:
      return BackendPaymentMethod.card;
  }
}

// Map backend payment method to frontend
export function mapPaymentMethodToFrontend(method: BackendPaymentMethod): FrontendPaymentMethod {
  switch (method) {
    case BackendPaymentMethod.cash:
      return 'Cash';
    case BackendPaymentMethod.card:
      return 'Credit'; // Default card to Credit for display
    default:
      return 'Credit';
  }
}

// Map frontend sale items to backend
export function mapSaleItemsToBackend(items: FrontendSaleItem[]): BackendSaleItem[] {
  return items.map(item => ({
    itemId: item.productId,
    name: item.productName,
    quantity: BigInt(item.quantity),
    priceCents: brlToCents(item.unitPrice),
    totalCents: brlToCents(item.subtotal),
  }));
}

// Map backend sale items to frontend
export function mapSaleItemsToFrontend(items: BackendSaleItem[]): FrontendSaleItem[] {
  return items.map(item => ({
    productId: item.itemId,
    productName: item.name,
    quantity: Number(item.quantity),
    unitPrice: centsToBrl(item.priceCents),
    subtotal: centsToBrl(item.totalCents),
  }));
}

// Map backend customer to frontend
export function mapCustomerToFrontend(customer: BackendCustomer): FrontendCustomer {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    createdAt: 0, // Backend doesn't track this
    updatedAt: 0, // Backend doesn't track this
    totalPurchasesCents: Number(customer.totalPurchasesCents),
    eligibleForRaffle: customer.eligibleForRaffle,
  };
}

// Map backend sale to frontend sale
export function mapSaleToFrontend(sale: BackendSale): {
  id: string;
  items: FrontendSaleItem[];
  total: number;
  amountPaid: number;
  change: number;
  paymentMethod: FrontendPaymentMethod;
  customerId: string;
  timestamp: number;
} {
  return {
    id: sale.id.toString(),
    items: mapSaleItemsToFrontend(sale.items),
    total: centsToBrl(sale.totalCents),
    amountPaid: centsToBrl(sale.totalCents + sale.changeCents),
    change: centsToBrl(sale.changeCents),
    paymentMethod: mapPaymentMethodToFrontend(sale.paymentMethod),
    customerId: sale.customerId,
    timestamp: Number(sale.date) / 1_000_000, // Convert nanoseconds to milliseconds
  };
}

// Map backend cash register session to frontend
export function mapCashRegisterSessionToFrontend(session: BackendCashRegisterSession): {
  id: string;
  initialFloat: number;
  openedAt: number;
  isOpen: boolean;
  closedAt?: number;
  finalBalance?: number;
} {
  return {
    id: session.id.toString(),
    initialFloat: centsToBrl(session.initialFloatCents),
    openedAt: Number(session.openTime) / 1_000_000,
    isOpen: session.isOpen,
    closedAt: session.closeTime ? Number(session.closeTime) / 1_000_000 : undefined,
    finalBalance: session.finalBalanceCents ? centsToBrl(session.finalBalanceCents) : undefined,
  };
}

// Map backend closing record to frontend
export function mapClosingRecordToFrontend(record: BackendClosingRecord): {
  id: string;
  sessionId: string;
  closeTime: number;
  finalBalance: number;
} {
  return {
    id: record.id.toString(),
    sessionId: record.sessionId.toString(),
    closeTime: Number(record.closeTime) / 1_000_000,
    finalBalance: centsToBrl(record.finalBalanceCents),
  };
}
