import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { ptBR, getCategoryLabel } from '../../i18n/ptBR';

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
}

export function ProductFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories,
}: ProductFiltersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="search">{ptBR.searchProducts}</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder={ptBR.searchByName}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="category">{ptBR.filterByCategory}</Label>
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger id="category">
            <SelectValue placeholder={ptBR.allCategories} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{ptBR.allCategories}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {getCategoryLabel(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
