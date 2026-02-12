import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { PaymentMethod } from '../../types/domain';
import { PAYMENT_METHODS, validateCashPayment, calculateChange } from './payment';
import { formatCurrency } from '../../utils/money';
import { ptBR, getPaymentMethodLabel } from '../../i18n/ptBR';

interface CheckoutPanelProps {
  total: number;
  onComplete: (paymentMethod: PaymentMethod, amountPaid: number, change: number) => void;
  disabled?: boolean;
}

export function CheckoutPanel({ total, onComplete, disabled }: CheckoutPanelProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [amountPaid, setAmountPaid] = useState('');
  const [error, setError] = useState<string | null>(null);

  const amountPaidNum = parseFloat(amountPaid) || 0;
  const change = calculateChange(total, amountPaidNum);

  useEffect(() => {
    setError(null);
  }, [paymentMethod, amountPaid]);

  const handleComplete = () => {
    setError(null);

    if (!paymentMethod) {
      setError(ptBR.selectPaymentMethodError);
      return;
    }

    if (paymentMethod === 'Cash') {
      const validationError = validateCashPayment(total, amountPaidNum);
      if (validationError) {
        setError(ptBR.amountPaidInsufficient);
        return;
      }
    }

    onComplete(paymentMethod, amountPaidNum, change);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="payment-method">{ptBR.paymentMethodRequired}</Label>
          <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
            <SelectTrigger id="payment-method">
              <SelectValue placeholder={ptBR.selectPaymentMethod} />
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
              />
            </div>

            {amountPaid && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>{ptBR.change}:</span>
                  <span className={change < 0 ? 'text-destructive' : ''}>
                    {formatCurrency(change)}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleComplete}
        disabled={disabled || !paymentMethod}
        className="w-full"
        size="lg"
      >
        {ptBR.completeSale}
      </Button>
    </div>
  );
}
