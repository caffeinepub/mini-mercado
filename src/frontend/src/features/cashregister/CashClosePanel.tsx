import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, AlertCircle } from 'lucide-react';
import type { CashSession, Sale } from '../../types/domain';
import { calculatePaymentBreakdown, getSessionSales } from './reporting';
import { formatCurrency } from '../../utils/money';
import { ptBR, formatDateTimePtBR } from '../../i18n/ptBR';

interface CashClosePanelProps {
  session?: CashSession;
  sales: Sale[];
  onClose: () => void;
}

export function CashClosePanel({ session, sales, onClose }: CashClosePanelProps) {
  if (!session) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {ptBR.noCashSessionOpen}
        </AlertDescription>
      </Alert>
    );
  }

  const sessionSales = getSessionSales(sales, session.id);
  const breakdown = calculatePaymentBreakdown(sessionSales);
  const grandTotal = session.initialFloat + breakdown.total;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ptBR.closeCashRegister}</CardTitle>
        <CardDescription>
          {ptBR.sessionOpened}: {formatDateTimePtBR(session.openedAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{ptBR.initialFloat}:</span>
              <span className="font-medium">{formatCurrency(session.initialFloat)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{ptBR.salesTotal}:</span>
              <span className="font-medium">{formatCurrency(breakdown.total)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>{ptBR.grandTotal}:</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3">{ptBR.paymentMethodBreakdown}</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{ptBR.cash}:</span>
                <span className="font-medium">{formatCurrency(breakdown.cash)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{ptBR.credit}:</span>
                <span className="font-medium">{formatCurrency(breakdown.credit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{ptBR.debit}:</span>
                <span className="font-medium">{formatCurrency(breakdown.debit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{ptBR.pix}:</span>
                <span className="font-medium">{formatCurrency(breakdown.pix)}</span>
              </div>
            </div>
          </div>

          <Button onClick={onClose} variant="destructive" size="lg" className="w-full">
            <DollarSign className="h-4 w-4 mr-2" />
            {ptBR.closeCashRegister}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
