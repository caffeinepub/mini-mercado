import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import { ProductFormDialog } from '../features/inventory/ProductFormDialog';
import { ProductTable } from '../features/inventory/ProductTable';
import { ProductFilters } from '../features/inventory/ProductFilters';
import { ptBR } from '../i18n/ptBR';
import type { Product } from '../types/domain';

export function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
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

  const handleAdd = () => {
    setEditingProduct(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleSave = (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
    } else {
      addProduct(data);
    }
  };

  const handleDelete = (product: Product) => {
    if (confirm(ptBR.deleteProductConfirm(product.name))) {
      deleteProduct(product.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{ptBR.inventoryManagement}</h1>
          <p className="text-muted-foreground mt-1">{ptBR.inventoryManagementDesc}</p>
        </div>
        <Button onClick={handleAdd} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          {ptBR.addProduct}
        </Button>
      </div>

      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
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
