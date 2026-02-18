import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProductFormDialog } from '../features/inventory/ProductFormDialog';
import { ProductTable } from '../features/inventory/ProductTable';
import { ProductFilters } from '../features/inventory/ProductFilters';
import { useAppStore } from '../hooks/useAppStore';
import { ptBR } from '../i18n/ptBR';
import type { Product } from '../types/domain';

export function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Extract unique categories from products
  const categories = useMemo(() => {
    const uniqueCategories = new Set(products.map((p) => p.category));
    return Array.from(uniqueCategories).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const handleAdd = useCallback(() => {
    setEditingProduct(undefined);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback((data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
    } else {
      addProduct(data);
    }
    setDialogOpen(false);
  }, [editingProduct, addProduct, updateProduct]);

  const handleDelete = useCallback((product: Product) => {
    if (confirm(`Tem certeza que deseja excluir ${product.name}?`)) {
      deleteProduct(product.id);
    }
  }, [deleteProduct]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategoryFilter(value);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{ptBR.inventory}</h1>
          <p className="text-muted-foreground mt-1">{ptBR.inventoryDescription}</p>
        </div>
        <Button onClick={handleAdd} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          {ptBR.addProduct}
        </Button>
      </div>

      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        categoryFilter={categoryFilter}
        onCategoryChange={handleCategoryChange}
        categories={categories}
      />

      <ProductTable
        products={filteredProducts}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        onSave={handleSave}
      />
    </div>
  );
}
