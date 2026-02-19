// Currency formatting utilities for Brazilian Real (BRL)

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function parseCurrency(value: string): number {
  // Remove all non-numeric characters except comma and period
  const cleaned = value.replace(/[^\d,.-]/g, '');
  
  // Replace comma with period for parsing
  const normalized = cleaned.replace(',', '.');
  
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}
