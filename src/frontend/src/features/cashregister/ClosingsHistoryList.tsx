import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '../../utils/money';
import { ptBR, formatDateTimePtBR } from '../../i18n/ptBR';
import type { CashCloseRecord, Sale } from '../../types/domain';
import { filterSalesBySession, calculatePaymentMethodBreakdown } from './reporting';
import { getActiveSales } from '../../features/sales/salesUtils';
import { useMemo } from 'react';

interface ClosingsHistoryListProps {
  closings: CashCloseRecord[];
  sales: Sale[];
}

export function ClosingsHistoryList({ closings, sales }: ClosingsHistoryListProps) {
  // Ensure we only work with active sales
  const activeSales = useMemo(() => getActiveSales(sales), [sales]);

  const sortedClosings = [...closings].sort((a, b) => b.closedAt - a.closedAt);

  if (sortedClosings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{ptBR.closingHistory}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">{ptBR.noClosingRecords}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ptBR.closingHistory}</CardTitle>
        <CardDescription>Histórico de fechamentos de caixa anteriores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedClosings.map((closing) => {
            const sessionSales = filterSalesBySession(activeSales, closing.sessionId);
            const breakdown = calculatePaymentMethodBreakdown(sessionSales);
            const cancelledCount = sales.filter(s => 
              s.cashSessionId === closing.sessionId && s.status === 'cancelled'
            ).length;

            return (
              <div key={closing.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Sessão #{closing.sessionId}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTimePtBR(closing.closedAt)}
                    </p>
                    {cancelledCount > 0 && (
                      <Badge variant="outline" className="mt-1">
                        {cancelledCount} cancelada{cancelledCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{ptBR.grandTotal}</p>
                    <p className="text-2xl font-bold">{formatCurrency(closing.grandTotal)}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">{ptBR.initial}</p>
                    <p className="font-medium">{formatCurrency(closing.initialFloat)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{ptBR.sales}</p>
                    <p className="font-medium">{formatCurrency(closing.salesTotal)}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">{ptBR.pix}</p>
                    <p className="font-medium">{formatCurrency(breakdown.pix)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{ptBR.debit}</p>
                    <p className="font-medium">{formatCurrency(breakdown.debit)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{ptBR.credit}</p>
                    <p className="font-medium">{formatCurrency(breakdown.credit)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{ptBR.cash}</p>
                    <p className="font-medium">{formatCurrency(breakdown.cash)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
