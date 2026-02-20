import type { Sale, PaymentMethod } from '../../types/domain';

export interface PaymentMethodBreakdown {
  pix: number;
  debit: number;
  credit: number;
  cash: number;
}

/**
 * Calculate payment method breakdown for a list of sales.
 * NOTE: This function expects pre-filtered ACTIVE sales only.
 * Cancelled sales should be filtered out before calling this function.
 */
export function calculatePaymentMethodBreakdown(sales: Sale[]): PaymentMethodBreakdown {
  const breakdown: PaymentMethodBreakdown = {
    pix: 0,
    debit: 0,
    credit: 0,
    cash: 0,
  };

  sales.forEach((sale) => {
    // Defensive check: skip cancelled sales if they somehow made it through
    if (sale.status === 'cancelled') {
      return;
    }

    switch (sale.paymentMethod) {
      case 'PIX':
        breakdown.pix += sale.total;
        break;
      case 'Debit':
        breakdown.debit += sale.total;
        break;
      case 'Credit':
        breakdown.credit += sale.total;
        break;
      case 'Cash':
        breakdown.cash += sale.total;
        break;
    }
  });

  return breakdown;
}

/**
 * Filter sales by cash session ID.
 * NOTE: This function expects pre-filtered ACTIVE sales only.
 */
export function filterSalesBySession(sales: Sale[], sessionId: string): Sale[] {
  return sales.filter((sale) => sale.cashSessionId === sessionId);
}
