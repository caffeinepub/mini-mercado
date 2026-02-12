import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Search, Plus, AlertTriangle } from 'lucide-react';
import type { Product } from '../../types/domain';
import { formatCurrency } from '../../utils/money';
import { ptBR, getCategoryLabel } from '../../i18n/ptBR';

interface ProductPickerProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function ProductPicker({ products, onAddToCart }: ProductPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="pos-search">{ptBR.searchProducts}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="pos-search"
              placeholder={ptBR.searchByName}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="pos-category">{ptBR.filterByCategory}</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger id="pos-category">
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 flex flex-col gap-3 hover:border-primary transition-colors"
          >
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="h-24 w-full object-cover rounded"
              />
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm">{product.name}</h3>
                {product.stock < 5 && (
                  <Badge variant="destructive" className="gap-1 text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    {ptBR.low}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{getCategoryLabel(product.category)}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-lg">{formatCurrency(product.price)}</span>
                <span className="text-sm text-muted-foreground">{ptBR.stockLabel}: {product.stock}</span>
              </div>
            </div>
            <Button
              onClick={() => onAddToCart(product)}
              disabled={product.stock === 0}
              className="w-full"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              {ptBR.addToCart}
            </Button>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {ptBR.noProductsMatching}
        </div>
      )}
    </div>
  );
}
