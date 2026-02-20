import type { Sale, SaleStatus } from '../../types/domain';

export type SaleFilter = 'active' | 'cancelled' | 'all';

export function filterSalesByStatus(sales: Sale[], filter: SaleFilter): Sale[] {
  if (filter === 'all') {
    return sales;
  }
  return sales.filter(sale => sale.status === filter);
}

export function calculateActiveSalesTotal(sales: Sale[]): number {
  return sales
    .filter(sale => sale.status === 'active')
    .reduce((sum, sale) => sum + sale.total, 0);
}

export function getActiveSales(sales: Sale[]): Sale[] {
  return sales.filter(sale => sale.status === 'active');
}
