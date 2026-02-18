import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, AlertCircle } from 'lucide-react';
import type { Product } from '../../types/domain';
import { convertImageToBase64 } from '../../utils/image';
import { ptBR, getCategoryLabel } from '../../i18n/ptBR';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  onSave: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const categories: string[] = ['Beverages', 'Snacks', 'Dairy', 'Bakery', 'Household', 'Personal Care', 'Other'];

export function ProductFormDialog({ open, onOpenChange, product, onSave }: ProductFormDialogProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Other');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setImage(product.image);
    } else {
      setName('');
      setCategory('Other');
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
    setIsProcessingImage(true);

    try {
      const base64 = await convertImageToBase64(file);
      setImage(base64);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Failed to process image');
      setImage(undefined);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      alert('Preço inválido. Por favor, insira um valor válido.');
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      alert('Estoque inválido. Por favor, insira um valor válido.');
      return;
    }

    onSave({
      name,
      category,
      price: priceNum,
      stock: stockNum,
      image,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{product ? ptBR.editProduct : ptBR.addProduct}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{ptBR.name}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{ptBR.category}</Label>
            <Select value={category} onValueChange={(value) => setCategory(value)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{ptBR.price} (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">{ptBR.stock}</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">{ptBR.image}</Label>
            <div className="flex items-center gap-4">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isProcessingImage}
                className="flex-1"
              />
              {isProcessingImage && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            {imageError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{imageError}</AlertDescription>
              </Alert>
            )}
            {image && !isProcessingImage && (
              <div className="mt-2">
                <img src={image} alt="Preview" className="h-24 w-24 object-cover rounded border" />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {ptBR.cancel}
            </Button>
            <Button type="submit" disabled={isProcessingImage}>
              {isProcessingImage ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {ptBR.saving}
                </>
              ) : (
                ptBR.save
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
