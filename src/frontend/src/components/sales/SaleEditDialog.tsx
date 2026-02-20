import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { Sale, PaymentMethod, SaleItem } from '../../types/domain';
import { PAYMENT_METHODS } from '../../features/pos/payment';
import { getPaymentMethodLabel } from '../../i18n/ptBR';
import { formatCurrency } from '../../utils/money';
import { SaleItemQuantityEditor } from './SaleItemQuantityEditor';

interface SaleEditDialogProps {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (paymentMethod: PaymentMethod, items: SaleItem[]) => void;
  isLoading: boolean;
}

export function SaleEditDialog({ sale, open, onOpenChange, onSave, isLoading }: SaleEditDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [items, setItems] = useState<SaleItem[]>([]);

  useEffect(() => {
    if (sale) {
      setPaymentMethod(sale.paymentMethod);
      setItems([...sale.items]);
    }
  }, [sale]);

  const handleQuantityChange = (index: number, newQuantity: number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      quantity: newQuantity,
      subtotal: newQuantity * newItems[index].unitPrice,
    };
    setItems(newItems);
  };

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSave = () => {
    if (items.some(item => item.quantity <= 0)) {
      alert('Todas as quantidades devem ser maiores que zero');
      return;
    }
    onSave(paymentMethod, items);
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Venda #{sale.id}</DialogTitle>
          <DialogDescription>
            Modifique o método de pagamento ou as quantidades dos itens
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="payment-method">Método de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
              <SelectTrigger id="payment-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {getPaymentMethodLabel(method)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Itens da Venda</Label>
            <div className="space-y-3">
              {items.map((item, index) => (
                <SaleItemQuantityEditor
                  key={index}
                  item={item}
                  onQuantityChange={(newQuantity) => handleQuantityChange(index, newQuantity)}
                />
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
