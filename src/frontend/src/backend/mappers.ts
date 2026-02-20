// Mapping utilities between frontend domain models and backend types
import type { PaymentMethod as FrontendPaymentMethod, SaleItem as FrontendSaleItem, Customer as FrontendCustomer, SaleStatus as FrontendSaleStatus } from '../types/domain';
import { PaymentMethod as BackendPaymentMethod, SaleStatus as BackendSaleStatus, type SaleItem as BackendSaleItem, type Customer as BackendCustomer, type Sale as BackendSale, type CashRegisterSession as BackendCashRegisterSession, type ClosingRecord as BackendClosingRecord } from '../backend';

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
    case 'PIX':
      return BackendPaymentMethod.pix;
    case 'Debit':
      return BackendPaymentMethod.debito;
    case 'Credit':
      return BackendPaymentMethod.credito;
    case 'Cash':
      return BackendPaymentMethod.dinheiro;
    default:
      return BackendPaymentMethod.credito;
  }
}

// Map backend payment method to frontend
export function mapPaymentMethodToFrontend(method: BackendPaymentMethod): FrontendPaymentMethod {
  switch (method) {
    case BackendPaymentMethod.pix:
      return 'PIX';
    case BackendPaymentMethod.debito:
      return 'Debit';
    case BackendPaymentMethod.credito:
      return 'Credit';
    case BackendPaymentMethod.dinheiro:
      return 'Cash';
    default:
      return 'Credit';
  }
}

// Map backend sale status to frontend
export function mapSaleStatusToFrontend(status: BackendSaleStatus): FrontendSaleStatus {
  switch (status) {
    case BackendSaleStatus.active:
      return 'active';
    case BackendSaleStatus.cancelled:
      return 'cancelled';
    default:
      return 'active';
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

// Map backend customer to frontend
export function mapCustomerToFrontend(customer: BackendCustomer): FrontendCustomer {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    createdAt: Number(customer.id), // Using ID as timestamp fallback
    updatedAt: Number(customer.id),
    totalPurchasesCents: Number(customer.totalPurchasesCents),
    eligibleForRaffle: customer.eligibleForRaffle,
  };
}

// Map backend sale to frontend
export function mapSaleToFrontend(sale: BackendSale): import('../types/domain').Sale {
  return {
    id: sale.id.toString(),
    items: sale.items.map(item => ({
      productId: item.itemId,
      productName: item.name,
      quantity: Number(item.quantity),
      unitPrice: centsToBrl(item.priceCents),
      subtotal: centsToBrl(item.totalCents),
    })),
    total: centsToBrl(sale.totalCents),
    amountPaid: 0,
    change: centsToBrl(sale.changeCents),
    paymentMethod: mapPaymentMethodToFrontend(sale.paymentMethod),
    customerId: sale.customerId || null,
    timestamp: Number(sale.date) / 1_000_000, // Convert nanoseconds to milliseconds
    status: mapSaleStatusToFrontend(sale.status),
  };
}

// Map backend cash register session to frontend
export function mapCashRegisterSessionToFrontend(session: BackendCashRegisterSession): import('../types/domain').CashSession {
  return {
    id: session.id.toString(),
    initialFloat: centsToBrl(session.initialFloatCents),
    openedAt: Number(session.openTime) / 1_000_000,
    isOpen: session.isOpen,
  };
}

// Map backend closing record to frontend
export function mapClosingRecordToFrontend(record: BackendClosingRecord): import('../types/domain').CashCloseRecord {
  return {
    id: record.id.toString(),
    sessionId: record.sessionId.toString(),
    initialFloat: 0,
    salesTotal: 0,
    grandTotal: centsToBrl(record.finalBalanceCents),
    creditTotal: 0,
    debitTotal: 0,
    pixTotal: 0,
    cashTotal: 0,
    closedAt: Number(record.closeTime) / 1_000_000,
  };
}
