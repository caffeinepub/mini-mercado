import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import { formatCurrency, parseCurrency } from '../../utils/money';
import { ptBR, getPaymentMethodLabel } from '../../i18n/ptBR';
import { validateCashPayment, calculateChange } from './payment';

interface CheckoutPanelProps {
  total: number;
  onComplete: (paymentMethod: PaymentMethod, amountPaid: number, change: number) => void;
  disabled?: boolean;
  isProcessing?: boolean;
}

export function CheckoutPanel({ total, onComplete, disabled, isProcessing }: CheckoutPanelProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [cashAmountInput, setCashAmountInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const isCashPayment = paymentMethod === 'Cash';
  const cashAmount = parseCurrency(cashAmountInput);
  const change = isCashPayment ? calculateChange(cashAmount, total) : 0;

  const handleComplete = () => {
    setError(null);

    if (!paymentMethod) {
      setError(ptBR.selectPaymentMethodError);
      return;
    }

    if (isCashPayment) {
      const validationError = validateCashPayment(cashAmount, total);
      if (validationError) {
        setError(validationError);
        return;
      }
      onComplete(paymentMethod, cashAmount, change);
    } else {
      // For PIX, Debit, Credit: amount paid equals total with no change
      onComplete(paymentMethod, total, 0);
    }
  };

  const isCompleteDisabled = disabled || isProcessing || !paymentMethod || (isCashPayment && cashAmount < total);

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="payment-method">{ptBR.paymentMethodRequired}</Label>
        <Select value={paymentMethod} onValueChange={(value) => {
          setPaymentMethod(value as PaymentMethod);
          setError(null);
          setCashAmountInput('');
        }} disabled={isProcessing}>
          <SelectTrigger id="payment-method">
            <SelectValue placeholder={ptBR.selectPaymentMethod} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PIX">{getPaymentMethodLabel('PIX')}</SelectItem>
            <SelectItem value="Debit">{getPaymentMethodLabel('Debit')}</SelectItem>
            <SelectItem value="Credit">{getPaymentMethodLabel('Credit')}</SelectItem>
            <SelectItem value="Cash">{getPaymentMethodLabel('Cash')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cash payment input */}
      {isCashPayment && (
        <div className="grid gap-2">
          <Label htmlFor="cash-amount">{ptBR.amountPaid}</Label>
          <Input
            id="cash-amount"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={cashAmountInput}
            onChange={(e) => {
              setCashAmountInput(e.target.value);
              setError(null);
            }}
            disabled={isProcessing}
            className="text-lg"
          />
        </div>
      )}

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

      {/* Change display for cash payments */}
      {isCashPayment && cashAmount >= total && (
        <div className="bg-primary/10 p-3 rounded-md border-2 border-primary">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">{ptBR.change}:</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(change)}</span>
          </div>
        </div>
      )}

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
