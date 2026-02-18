import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ChevronDown, ChevronUp, Receipt, Trash2, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useListSales, useDeleteSale, useIsCallerAdmin } from '../hooks/useQueries';
import { useListCustomers } from '../hooks/useQueries';
import { ptBR, formatDateTimePtBR, getPaymentMethodLabel } from '../i18n/ptBR';
import { formatCurrency } from '../utils/money';

export function SalesHistoryPage() {
  const { data: sales = [], isLoading: salesLoading } = useListSales();
  const { data: customers = [], isLoading: customersLoading } = useListCustomers();
  const { data: isAdmin = false, isLoading: adminLoading } = useIsCallerAdmin();
  const deleteSale = useDeleteSale();
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set());

  const isLoading = salesLoading || customersLoading || adminLoading;

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

  const handleDeleteSale = async (saleId: string) => {
    try {
      await deleteSale.mutateAsync(saleId);
    } catch (error: any) {
      console.error('Error deleting sale:', error);
      alert(error.message || 'Failed to delete sale');
    }
  };

  // Memoize customer lookup map to avoid repeated linear scans
  const customerMap = useMemo(() => {
    const map = new Map<string, string>();
    customers.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [customers]);

  const getCustomerName = (customerId: string | null | undefined): string => {
    if (!customerId) return 'Final Consumer';
    return customerMap.get(customerId) || customerId;
  };

  // Memoize sorted sales to avoid re-sorting on every render
  const sortedSales = useMemo(() => {
    return [...sales].sort((a, b) => b.timestamp - a.timestamp);
  }, [sales]);

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
            const customerName = getCustomerName(sale.customerId);

            return (
              <Card key={sale.id}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleSale(sale.id)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">
                            {ptBR.sale} #{sale.id}
                          </CardTitle>
                          <Badge variant="outline">
                            {getPaymentMethodLabel(sale.paymentMethod)}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1">
                          {formatDateTimePtBR(sale.timestamp)} • {customerName}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-2">
                          <p className="font-bold text-xl">{formatCurrency(sale.total)}</p>
                        </div>
                        {isAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                disabled={deleteSale.isPending}
                              >
                                {deleteSale.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Venda</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteSale(sale.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent>
                      <Separator className="mb-4" />
                      <div className="space-y-2">
                        {sale.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>
                              {item.productName} × {item.quantity}
                            </span>
                            <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
