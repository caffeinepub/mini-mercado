import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import type { SaleItem } from '../../types/domain';
import { formatCurrency } from '../../utils/money';

interface SaleItemQuantityEditorProps {
  item: SaleItem;
  onQuantityChange: (newQuantity: number) => void;
}

export function SaleItemQuantityEditor({ item, onQuantityChange }: SaleItemQuantityEditorProps) {
  const handleIncrement = () => {
    onQuantityChange(item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.quantity - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      onQuantityChange(value);
    }
  };

  return (
    <div className="flex items-center gap-4 p-3 border rounded-lg">
      <div className="flex-1">
        <p className="font-medium">{item.productName}</p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(item.unitPrice)} cada
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={item.quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          value={item.quantity}
          onChange={handleInputChange}
          className="w-20 text-center"
          min="1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-right min-w-[100px]">
        <p className="font-bold">{formatCurrency(item.subtotal)}</p>
      </div>
    </div>
  );
}
