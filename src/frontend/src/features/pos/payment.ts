import type { PaymentMethod } from '../../types/domain';
import { ptBR, getPaymentMethodLabel } from '../../i18n/ptBR';

export const PAYMENT_METHODS: PaymentMethod[] = ['PIX', 'Debit', 'Credit', 'Cash'];

export function validateCashPayment(amountPaid: number, total: number): string | null {
  if (amountPaid < total) {
    return ptBR.amountPaidInsufficient;
  }
  return null;
}

export function calculateChange(amountPaid: number, total: number): number {
  return Math.max(0, amountPaid - total);
}

// Export helper for display labels
export { getPaymentMethodLabel };
