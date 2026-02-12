import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import type { Customer, Sale } from '../../types/domain';
import { formatCurrency } from '../../utils/money';
import { ptBR, getPaymentMethodLabel, formatDateTimePtBR } from '../../i18n/ptBR';

interface CustomerDetailProps {
  customer: Customer;
  sales: Sale[];
  onBack: () => void;
}

export function CustomerDetail({ customer, sales, onBack }: CustomerDetailProps) {
  const customerSales = sales.filter((sale) => sale.customerId === customer.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{customer.name}</h2>
          <p className="text-muted-foreground">{customer.phone}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{ptBR.purchaseHistory}</CardTitle>
        </CardHeader>
        <CardContent>
          {customerSales.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {ptBR.noPurchasesYet}
            </p>
          ) : (
            <div className="space-y-4">
              {customerSales.map((sale) => (
                <div key={sale.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {formatDateTimePtBR(sale.timestamp)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {sale.items.length} {ptBR.items(sale.items.length)} • {getPaymentMethodLabel(sale.paymentMethod)}
                      </p>
                      <div className="text-xs text-muted-foreground mt-2">
                        {sale.items.map((item, idx) => (
                          <div key={idx}>
                            {item.productName} × {item.quantity}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(sale.total)}</p>
                    </div>
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
