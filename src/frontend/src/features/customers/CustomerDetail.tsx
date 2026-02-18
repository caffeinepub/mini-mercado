import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Loader2 } from 'lucide-react';
import type { Customer } from '../../types/domain';
import { formatCurrency } from '../../utils/money';
import { ptBR, getPaymentMethodLabel, formatDateTimePtBR } from '../../i18n/ptBR';
import { useListSalesByCustomer } from '../../hooks/useQueries';

interface CustomerDetailProps {
  customer: Customer;
  onBack: () => void;
}

export function CustomerDetail({ customer, onBack }: CustomerDetailProps) {
  const { data: customerSales = [], isLoading } = useListSalesByCustomer(customer.id);

  const totalPurchases = customer.totalPurchasesCents ? customer.totalPurchasesCents / 100 : 0;
  const isEligible = customer.eligibleForRaffle || false;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{customer.name}</h2>
          <p className="text-muted-foreground">{customer.phone}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalPurchases)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status do Sorteio</CardTitle>
          </CardHeader>
          <CardContent>
            {isEligible ? (
              <Badge className="bg-chart-2 text-white">
                <Trophy className="h-4 w-4 mr-1" />
                Elegível para Sorteio
              </Badge>
            ) : (
              <Badge variant="outline">
                Não Elegível (mínimo R$ 50,00)
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{ptBR.purchaseHistory}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : customerSales.length === 0 ? (
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
                            {item.productName} × {item.quantity} = {formatCurrency(item.subtotal)}
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
