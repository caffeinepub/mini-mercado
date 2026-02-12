import type { PaymentMethod } from '../../types/domain';
import { ptBR, getPaymentMethodLabel } from '../../i18n/ptBR';

export const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Credit', 'Debit', 'PIX'];

export function validateCashPayment(total: number, amountPaid: number): string | null {
  if (amountPaid < total) {
    return ptBR.amountPaidInsufficient;
  }
  return null;
}

export function calculateChange(total: number, amountPaid: number): number {
  return Math.max(0, amountPaid - total);
}

// Export helper for display labels
export { getPaymentMethodLabel };
