import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Receipt } from 'lucide-react';
import { useState } from 'react';
import { useListSales } from '../hooks/useQueries';
import { useListCustomers } from '../hooks/useQueries';
import { ptBR, formatDateTimePtBR, getPaymentMethodLabel } from '../i18n/ptBR';
import { formatCurrency } from '../utils/money';

export function SalesHistoryPage() {
  const { data: sales = [], isLoading: salesLoading } = useListSales();
  const { data: customers = [], isLoading: customersLoading } = useListCustomers();
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set());

  const isLoading = salesLoading || customersLoading;

  const toggleSale = (saleId: string) => {
    setExpandedSales((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(saleId)) {
        newSet.delete(saleId);
      } else {
        newSet.add(saleId);
      }
      return newSet;
    });
  };

  const getCustomerName = (customerId: string): string => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || customerId;
  };

  // Sort sales by timestamp descending (most recent first)
  const sortedSales = [...sales].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">{ptBR.salesHistory}</h1>
        <p className="text-muted-foreground mt-2">{ptBR.salesHistoryDesc}</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">{ptBR.loadingSales}</p>
          </div>
        </div>
      ) : sortedSales.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">{ptBR.noSalesFound}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedSales.map((sale) => {
            const isExpanded = expandedSales.has(sale.id);
            return (
              <Card key={sale.id}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleSale(sale.id)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">
                            {ptBR.sale} #{sale.id}
                          </CardTitle>
                          <Badge variant="outline">
                            {getPaymentMethodLabel(sale.paymentMethod)}
                          </Badge>
                        </div>
                        <CardDescription>
                          {formatDateTimePtBR(sale.timestamp)} • {getCustomerName(sale.customerId)}
                        </CardDescription>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-2xl font-bold">{formatCurrency(sale.total)}</div>
                        {sale.paymentMethod === 'Cash' && sale.change > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {ptBR.change}: {formatCurrency(sale.change)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between py-2 hover:bg-muted/50 rounded px-2 transition-colors">
                        <span className="text-sm font-medium">
                          {ptBR.viewItems} ({sale.items.length} {ptBR.items(sale.items.length)})
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <Separator className="my-2" />
                      <div className="space-y-2 mt-4">
                        {sale.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 px-2 hover:bg-muted/30 rounded"
                          >
                            <div className="flex-1">
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.quantity}x {formatCurrency(item.unitPrice)} {ptBR.each}
                              </div>
                            </div>
                            <div className="font-semibold">{formatCurrency(item.subtotal)}</div>
                          </div>
                        ))}
                        <Separator className="my-2" />
                        <div className="flex items-center justify-between py-2 px-2 bg-muted/50 rounded">
                          <span className="font-bold">{ptBR.total}</span>
                          <span className="font-bold text-lg">{formatCurrency(sale.total)}</span>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </CardContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
