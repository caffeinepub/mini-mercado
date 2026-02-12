import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from './cartTypes';
import { calculateLineSubtotal } from './cartTypes';
import { formatCurrency } from '../../utils/money';
import { ptBR, getCategoryLabel } from '../../i18n/ptBR';

interface CartPanelProps {
  items: CartItem[];
  total: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export function CartPanel({ items, total, onUpdateQuantity, onRemoveItem }: CartPanelProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {ptBR.cartEmpty}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.product.id} className="border rounded-lg p-4">
            <div className="flex items-start gap-3">
              {item.product.image && (
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-16 w-16 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{item.product.name}</h4>
                <p className="text-xs text-muted-foreground">{getCategoryLabel(item.product.category)}</p>
                <p className="text-sm mt-1">{formatCurrency(item.product.price)} {ptBR.each}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveItem(item.product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  max={item.product.stock}
                  value={item.quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) {
                      onUpdateQuantity(item.product.id, val);
                    }
                  }}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="font-bold">
                {formatCurrency(calculateLineSubtotal(item))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between text-xl font-bold">
          <span>{ptBR.total}:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
