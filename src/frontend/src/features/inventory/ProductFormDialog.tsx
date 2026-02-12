import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Product } from '../../types/domain';
import { convertImageToBase64 } from '../../utils/image';
import { ptBR, getCategoryLabel } from '../../i18n/ptBR';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  onSave: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const CATEGORIES = ['Beverages', 'Snacks', 'Dairy', 'Bakery', 'Frozen', 'Household', 'Personal Care', 'Other'];

export function ProductFormDialog({ open, onOpenChange, product, onSave }: ProductFormDialogProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setImage(product.image);
    } else {
      setName('');
      setCategory('');
      setPrice('');
      setStock('');
      setImage(undefined);
    }
    setImageError(null);
  }, [product, open]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);
    try {
      const base64 = await convertImageToBase64(file);
      setImage(base64);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Failed to process image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      onSave({
        name,
        category,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        image,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{product ? ptBR.editProduct : ptBR.addNewProduct}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{ptBR.productName}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={ptBR.productNamePlaceholder}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">{ptBR.category}</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder={ptBR.selectCategory} />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">{ptBR.salePrice}</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  placeholder="0.00"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="stock">{ptBR.stockQuantity}</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="image">{ptBR.productImage}</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imageError && (
                <p className="text-sm text-destructive">{imageError}</p>
              )}
              {image && (
                <div className="mt-2">
                  <img src={image} alt="Preview" className="h-24 w-24 object-cover rounded border" />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {ptBR.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? ptBR.saving : ptBR.saveProduct}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
