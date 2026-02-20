import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SaleFilter } from './salesUtils';

interface SalesFiltersProps {
  currentFilter: SaleFilter;
  onFilterChange: (filter: SaleFilter) => void;
}

export function SalesFilters({ currentFilter, onFilterChange }: SalesFiltersProps) {
  return (
    <Tabs value={currentFilter} onValueChange={(value) => onFilterChange(value as SaleFilter)}>
      <TabsList>
        <TabsTrigger value="active">Vendas Ativas</TabsTrigger>
        <TabsTrigger value="cancelled">Vendas Canceladas</TabsTrigger>
        <TabsTrigger value="all">Todas as Vendas</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
