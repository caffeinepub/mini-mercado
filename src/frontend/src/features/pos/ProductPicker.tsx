import { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Plus, AlertTriangle, Lock } from 'lucide-react';
import type { Product } from '../../types/domain';
import { formatCurrency } from '../../utils/money';
import { ptBR, getCategoryLabel } from '../../i18n/ptBR';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

interface ProductPickerProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  disabled?: boolean;
}

export function ProductPicker({ products, onAddToCart, disabled }: ProductPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(12);

  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, debouncedSearch, categoryFilter]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMore = filteredProducts.length > visibleCount;

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + 12);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Step 2: Select Products</Label>
      </div>

      {disabled && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Please select a customer or "Final Consumer" first before adding products to the cart.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="pos-search">{ptBR.searchProducts}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="pos-search"
              placeholder={ptBR.searchByName}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisibleCount(12);
              }}
              className="pl-9"
              disabled={disabled}
            />
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="pos-category">{ptBR.filterByCategory}</Label>
          <Select 
            value={categoryFilter} 
            onValueChange={(value) => {
              setCategoryFilter(value);
              setVisibleCount(12);
            }}
            disabled={disabled}
          >
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
        {displayedProducts.map((product) => (
          <div
            key={product.id}
            className={`border rounded-lg p-4 flex flex-col gap-3 transition-colors ${
              disabled ? 'opacity-50' : 'hover:border-primary'
            }`}
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
              disabled={disabled || product.stock === 0}
              className="w-full"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              {ptBR.addToCart}
            </Button>
          </div>
        ))}
      </div>

      {hasMore && !disabled && (
        <div className="flex justify-center pt-4">
          <Button onClick={handleLoadMore} variant="outline">
            Load more ({filteredProducts.length - visibleCount} remaining)
          </Button>
        </div>
      )}

      {filteredProducts.length === 0 && !disabled && (
        <div className="text-center py-12 text-muted-foreground">
          {ptBR.noProductsMatching}
        </div>
      )}
    </div>
  );
}
