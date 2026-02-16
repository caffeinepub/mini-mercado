import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import type { PaymentMethod } from '../../types/domain';
import { formatCurrency } from '../../utils/money';
import { validateCashPayment, calculateChange } from './payment';
import { ptBR, getPaymentMethodLabel } from '../../i18n/ptBR';

interface CheckoutPanelProps {
  total: number;
  onComplete: (paymentMethod: PaymentMethod, amountPaid: number, change: number) => void;
  disabled?: boolean;
  isProcessing?: boolean;
}

export function CheckoutPanel({ total, onComplete, disabled, isProcessing }: CheckoutPanelProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [amountPaid, setAmountPaid] = useState('');
  const [error, setError] = useState<string | null>(null);

  const change = paymentMethod === 'Cash' ? calculateChange(parseFloat(amountPaid) || 0, total) : 0;

  const handleComplete = () => {
    setError(null);

    if (!paymentMethod) {
      setError(ptBR.selectPaymentMethodError);
      return;
    }

    if (paymentMethod === 'Cash') {
      const paid = parseFloat(amountPaid);
      const validationError = validateCashPayment(paid, total);
      if (validationError) {
        setError(validationError);
        return;
      }
      onComplete(paymentMethod, paid, change);
    } else {
      onComplete(paymentMethod, total, 0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="payment-method">{ptBR.paymentMethodRequired}</Label>
        <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)} disabled={disabled || isProcessing}>
          <SelectTrigger id="payment-method">
            <SelectValue placeholder={ptBR.selectPaymentMethod} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cash">{getPaymentMethodLabel('Cash')}</SelectItem>
            <SelectItem value="Credit">{getPaymentMethodLabel('Credit')}</SelectItem>
            <SelectItem value="Debit">{getPaymentMethodLabel('Debit')}</SelectItem>
            <SelectItem value="PIX">{getPaymentMethodLabel('PIX')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {paymentMethod === 'Cash' && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="amount-paid">{ptBR.amountPaid}</Label>
            <Input
              id="amount-paid"
              type="number"
              step="0.01"
              min="0"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0.00"
              disabled={disabled || isProcessing}
            />
          </div>

          {amountPaid && (
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">{ptBR.change}:</span>
              <span className="text-lg font-bold">{formatCurrency(change)}</span>
            </div>
          )}
        </>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Separator />

      <div className="flex justify-between items-center text-lg font-bold">
        <span>{ptBR.total}:</span>
        <span>{formatCurrency(total)}</span>
      </div>

      <Button 
        onClick={handleComplete} 
        size="lg" 
        className="w-full"
        disabled={disabled || isProcessing || !paymentMethod}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processando...
          </>
        ) : (
          ptBR.completeSale
        )}
      </Button>
    </div>
  );
}
