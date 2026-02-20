import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetOpenRegisterSession, useListSales, useOpenRegister, useCloseRegister, useListClosingRecords } from '../hooks/useQueries';
import { CashOpenPanel } from '../features/cashregister/CashOpenPanel';
import { CashClosePanel } from '../features/cashregister/CashClosePanel';
import { ClosingsHistoryList } from '../features/cashregister/ClosingsHistoryList';
import { ptBR } from '../i18n/ptBR';
import { useAppStore } from '../hooks/useAppStore';
import { useEffect, useMemo } from 'react';
import { getActiveSales } from '../features/sales/salesUtils';

export function CashRegisterPage() {
  const { data: openSession, isLoading: sessionLoading } = useGetOpenRegisterSession();
  const { data: allSales = [], isLoading: salesLoading } = useListSales();
  const { data: closingRecords = [], isLoading: closingsLoading } = useListClosingRecords();
  const openRegister = useOpenRegister();
  const closeRegister = useCloseRegister();
  
  const setCurrentCashSession = useAppStore((state) => state.setCurrentCashSession);
  const setSales = useAppStore((state) => state.setSales);
  const setCashCloseHistory = useAppStore((state) => state.setCashCloseHistory);

  // Filter to only active sales for cash register calculations
  const activeSales = useMemo(() => getActiveSales(allSales), [allSales]);

  useEffect(() => {
    if (openSession) {
      setCurrentCashSession({
        id: openSession.id,
        initialFloat: openSession.initialFloat,
        openedAt: openSession.openedAt,
        isOpen: openSession.isOpen,
      });
    } else {
      setCurrentCashSession(undefined);
    }
  }, [openSession, setCurrentCashSession]);

  useEffect(() => {
    setSales(activeSales);
  }, [activeSales, setSales]);

  useEffect(() => {
    setCashCloseHistory(closingRecords);
  }, [closingRecords, setCashCloseHistory]);

  const handleOpenRegister = async (initialFloat: number) => {
    try {
      await openRegister.mutateAsync(initialFloat);
    } catch (error: any) {
      console.error('Error opening register:', error);
      alert(error.message || 'Failed to open register');
    }
  };

  const handleCloseRegister = async (finalBalance: number) => {
    if (!openSession) return;
    
    try {
      await closeRegister.mutateAsync({
        sessionId: openSession.id,
        finalBalance,
      });
    } catch (error: any) {
      console.error('Error closing register:', error);
      alert(error.message || 'Failed to close register');
    }
  };

  const isLoading = sessionLoading || salesLoading || closingsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">{ptBR.cashRegisterTitle}</h1>
        <p className="text-muted-foreground mt-2">{ptBR.cashRegisterDesc}</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <CashOpenPanel
            isOpen={!!openSession}
            onOpen={handleOpenRegister}
            isOpening={openRegister.isPending}
          />
          <CashClosePanel
            session={openSession || undefined}
            sales={activeSales}
            onClose={handleCloseRegister}
            isClosing={closeRegister.isPending}
          />
        </div>
      )}

      <ClosingsHistoryList closings={closingRecords} sales={activeSales} />
    </div>
  );
}
