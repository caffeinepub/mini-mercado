import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { CashCloseRecord } from '../../types/domain';
import { formatCurrency } from '../../utils/money';
import { ptBR, formatDateTimePtBR } from '../../i18n/ptBR';

interface ClosingsHistoryListProps {
  closings: CashCloseRecord[];
}

export function ClosingsHistoryList({ closings }: ClosingsHistoryListProps) {
  if (closings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{ptBR.closingHistory}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {ptBR.noClosingRecords}
          </p>
        </CardContent>
      </Card>
    );
  }

  const sortedClosings = [...closings].sort((a, b) => b.closedAt - a.closedAt);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ptBR.closingHistory}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedClosings.map((closing) => (
            <div key={closing.id}>
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      {formatDateTimePtBR(closing.closedAt)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {ptBR.initial}: {formatCurrency(closing.initialFloat)} • {ptBR.sales}: {formatCurrency(closing.salesTotal)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(closing.grandTotal)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>{ptBR.cash}: {formatCurrency(closing.cashTotal)}</div>
                  <div>{ptBR.credit}: {formatCurrency(closing.creditTotal)}</div>
                  <div>{ptBR.debit}: {formatCurrency(closing.debitTotal)}</div>
                  <div>{ptBR.pix}: {formatCurrency(closing.pixTotal)}</div>
                </div>
              </div>
              <Separator className="mt-4" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
