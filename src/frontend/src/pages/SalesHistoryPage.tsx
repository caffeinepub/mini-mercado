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
import { ChevronDown, ChevronUp, Receipt, Trash2, Loader2, XCircle, Edit } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useListSales, useDeleteSale, useIsCallerAdmin, useCancelSale, useEditSale } from '../hooks/useQueries';
import { useListCustomers } from '../hooks/useQueries';
import { ptBR, formatDateTimePtBR, getPaymentMethodLabel } from '../i18n/ptBR';
import { formatCurrency } from '../utils/money';
import { SalesFilters } from '../features/sales/SalesFilters';
import { filterSalesByStatus, type SaleFilter } from '../features/sales/salesUtils';
import { SaleCancelDialog } from '../components/sales/SaleCancelDialog';
import { SaleEditDialog } from '../components/sales/SaleEditDialog';
import type { Sale, PaymentMethod, SaleItem } from '../types/domain';

export function SalesHistoryPage() {
  const { data: sales = [], isLoading: salesLoading } = useListSales();
  const { data: customers = [], isLoading: customersLoading } = useListCustomers();
  const { data: isAdmin = false, isLoading: adminLoading } = useIsCallerAdmin();
  const deleteSale = useDeleteSale();
  const cancelSale = useCancelSale();
  const editSale = useEditSale();
  
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<SaleFilter>(() => {
    const saved = sessionStorage.getItem('salesHistoryFilter');
    return (saved as SaleFilter) || 'active';
  });
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const isLoading = salesLoading || customersLoading || adminLoading;

  const handleFilterChange = (newFilter: SaleFilter) => {
    setFilter(newFilter);
    sessionStorage.setItem('salesHistoryFilter', newFilter);
  };

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

  const handleCancelClick = (sale: Sale) => {
    setSelectedSale(sale);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedSale) return;
    
    try {
      await cancelSale.mutateAsync(selectedSale.id);
      setCancelDialogOpen(false);
      setSelectedSale(null);
    } catch (error: any) {
      console.error('Error cancelling sale:', error);
      alert(error.message || 'Falha ao cancelar venda');
    }
  };

  const handleEditClick = (sale: Sale) => {
    setSelectedSale(sale);
    setEditDialogOpen(true);
  };

  const handleEditSave = async (paymentMethod: PaymentMethod, items: SaleItem[]) => {
    if (!selectedSale) return;
    
    try {
      await editSale.mutateAsync({
        saleId: selectedSale.id,
        paymentMethod,
        items,
      });
      setEditDialogOpen(false);
      setSelectedSale(null);
    } catch (error: any) {
      console.error('Error editing sale:', error);
      alert(error.message || 'Falha ao editar venda');
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

  // Memoize sorted and filtered sales
  const filteredSales = useMemo(() => {
    const filtered = filterSalesByStatus(sales, filter);
    return [...filtered].sort((a, b) => b.timestamp - a.timestamp);
  }, [sales, filter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">{ptBR.salesHistory}</h1>
        <p className="text-muted-foreground mt-2">{ptBR.salesHistoryDesc}</p>
      </div>

      <SalesFilters currentFilter={filter} onFilterChange={handleFilterChange} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">{ptBR.loadingSales}</p>
          </div>
        </div>
      ) : filteredSales.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                {filter === 'active' && 'Nenhuma venda ativa encontrada.'}
                {filter === 'cancelled' && 'Nenhuma venda cancelada encontrada.'}
                {filter === 'all' && ptBR.noSalesFound}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSales.map((sale) => {
            const isExpanded = expandedSales.has(sale.id);
            const customerName = getCustomerName(sale.customerId);
            const isCancelled = sale.status === 'cancelled';
            const isActive = sale.status === 'active';

            return (
              <Card key={sale.id} className={isCancelled ? 'opacity-60' : ''}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleSale(sale.id)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className={`text-lg ${isCancelled ? 'line-through' : ''}`}>
                            {ptBR.sale} #{sale.id}
                          </CardTitle>
                          <Badge variant="outline">
                            {getPaymentMethodLabel(sale.paymentMethod)}
                          </Badge>
                          {isCancelled && (
                            <Badge variant="destructive">CANCELADA</Badge>
                          )}
                        </div>
                        <CardDescription className="mt-1">
                          {formatDateTimePtBR(sale.timestamp)} • {customerName}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-2">
                          <p className={`font-bold text-xl ${isCancelled ? 'line-through' : ''}`}>
                            {formatCurrency(sale.total)}
                          </p>
                        </div>
                        {isActive && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(sale)}
                              disabled={editSale.isPending}
                              title="Editar venda"
                            >
                              {editSale.isPending && selectedSale?.id === sale.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Edit className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-orange-600 hover:text-orange-700"
                              onClick={() => handleCancelClick(sale)}
                              disabled={cancelSale.isPending}
                              title="Cancelar venda"
                            >
                              {cancelSale.isPending && selectedSale?.id === sale.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                        {isAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                disabled={deleteSale.isPending}
                                title="Excluir venda (admin)"
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

      <SaleCancelDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelConfirm}
        isLoading={cancelSale.isPending}
      />

      <SaleEditDialog
        sale={selectedSale}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleEditSave}
        isLoading={editSale.isPending}
      />
    </div>
  );
}
