import type { Sale, PaymentMethod } from '../../types/domain';

export interface PaymentBreakdown {
  credit: number;
  debit: number;
  pix: number;
  cash: number;
  total: number;
}

export function calculatePaymentBreakdown(sales: Sale[]): PaymentBreakdown {
  const breakdown: PaymentBreakdown = {
    credit: 0,
    debit: 0,
    pix: 0,
    cash: 0,
    total: 0,
  };

  sales.forEach((sale) => {
    breakdown.total += sale.total;
    
    switch (sale.paymentMethod) {
      case 'Credit':
        breakdown.credit += sale.total;
        break;
      case 'Debit':
        breakdown.debit += sale.total;
        break;
      case 'PIX':
        breakdown.pix += sale.total;
        break;
      case 'Cash':
        breakdown.cash += sale.total;
        break;
    }
  });

  return breakdown;
}

export function getSessionSales(sales: Sale[], sessionId: string): Sale[] {
  return sales.filter((sale) => sale.cashSessionId === sessionId);
}
