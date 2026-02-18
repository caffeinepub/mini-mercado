import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { ptBR, getPaymentMethodLabel } from '../../i18n/ptBR';

interface CheckoutPanelProps {
  total: number;
  onComplete: (paymentMethod: PaymentMethod, amountPaid: number, change: number) => void;
  disabled?: boolean;
  isProcessing?: boolean;
}

export function CheckoutPanel({ total, onComplete, disabled, isProcessing }: CheckoutPanelProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [error, setError] = useState<string | null>(null);

  const handleComplete = () => {
    setError(null);

    if (!paymentMethod) {
      setError(ptBR.selectPaymentMethodError);
      return;
    }

    // For all payment methods (PIX, Debit, Credit), amount paid equals total with no change
    onComplete(paymentMethod, total, 0);
  };

  const isCompleteDisabled = disabled || isProcessing || !paymentMethod;

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="payment-method">{ptBR.paymentMethodRequired}</Label>
        <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)} disabled={isProcessing}>
          <SelectTrigger id="payment-method">
            <SelectValue placeholder={ptBR.selectPaymentMethod} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PIX">{getPaymentMethodLabel('PIX')}</SelectItem>
            <SelectItem value="Debit">{getPaymentMethodLabel('Debit')}</SelectItem>
            <SelectItem value="Credit">{getPaymentMethodLabel('Credit')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}

      <Separator />

      {/* Payment Method Confirmation */}
      {paymentMethod && (
        <div className="bg-muted/50 p-3 rounded-md">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{ptBR.paymentMethod}:</span>
            <span className="font-semibold">{getPaymentMethodLabel(paymentMethod)}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-lg font-bold">
        <span>{ptBR.total}:</span>
        <span>{formatCurrency(total)}</span>
      </div>

      <Button
        onClick={handleComplete}
        disabled={isCompleteDisabled}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          ptBR.completeSale
        )}
      </Button>
    </div>
  );
}
