import { useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { CashOpenPanel } from '../features/cashregister/CashOpenPanel';
import { CashClosePanel } from '../features/cashregister/CashClosePanel';
import { ClosingsHistoryList } from '../features/cashregister/ClosingsHistoryList';
import { ptBR } from '../i18n/ptBR';
import { useGetOpenRegisterSession, useOpenRegister, useCloseRegister, useListClosingRecords, useListSales } from '../hooks/useQueries';
import { Loader2 } from 'lucide-react';

export function CashRegisterPage() {
  const { setCurrentCashSession, setCashCloseHistory } = useAppStore();
  
  // Backend queries
  const { data: currentCashSession, isLoading: sessionLoading } = useGetOpenRegisterSession();
  const { data: closingRecords = [], isLoading: closingsLoading } = useListClosingRecords();
  const { data: sales = [], isLoading: salesLoading } = useListSales();
  const openRegister = useOpenRegister();
  const closeRegister = useCloseRegister();

  // Sync backend state to local store for compatibility
  useEffect(() => {
    if (currentCashSession) {
      setCurrentCashSession({
        id: currentCashSession.id,
        initialFloat: currentCashSession.initialFloat,
        openedAt: currentCashSession.openedAt,
        isOpen: currentCashSession.isOpen,
      });
    } else {
      setCurrentCashSession(undefined);
    }
  }, [currentCashSession, setCurrentCashSession]);

  const handleOpen = async (initialFloat: number) => {
    try {
      await openRegister.mutateAsync(initialFloat);
    } catch (error: any) {
      console.error('Error opening register:', error);
    }
  };

  const handleClose = async () => {
    if (!currentCashSession) return;

    // Calculate final balance from sales
    const sessionSales = sales.filter(sale => {
      // For now, include all sales since we don't track session IDs in backend sales yet
      return sale.timestamp >= currentCashSession.openedAt;
    });

    const salesTotal = sessionSales.reduce((sum, sale) => sum + sale.total, 0);
    const finalBalance = currentCashSession.initialFloat + salesTotal;

    try {
      await closeRegister.mutateAsync({
        sessionId: currentCashSession.id,
        finalBalance,
      });
    } catch (error: any) {
      console.error('Error closing register:', error);
    }
  };

  if (sessionLoading || closingsLoading || salesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{ptBR.cashRegisterTitle}</h1>
        <p className="text-muted-foreground mt-1">{ptBR.cashRegisterDesc}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <CashOpenPanel
            onOpen={handleOpen}
            isOpen={!!currentCashSession}
            isOpening={openRegister.isPending}
          />
          
          <CashClosePanel
            session={currentCashSession ? {
              id: currentCashSession.id,
              initialFloat: currentCashSession.initialFloat,
              openedAt: currentCashSession.openedAt,
              isOpen: currentCashSession.isOpen,
            } : undefined}
            sales={sales}
            onClose={handleClose}
            isClosing={closeRegister.isPending}
          />
        </div>

        <div>
          <ClosingsHistoryList closings={closingRecords.map(record => ({
            id: record.id,
            sessionId: record.sessionId,
            initialFloat: 0, // Not available from backend
            salesTotal: record.finalBalance, // Approximation
            grandTotal: record.finalBalance,
            cashTotal: 0, // Not available from backend
            creditTotal: 0,
            debitTotal: 0,
            pixTotal: 0,
            closedAt: record.closeTime,
          }))} />
        </div>
      </div>
    </div>
  );
}
