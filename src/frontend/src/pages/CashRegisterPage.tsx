import { useAppStore } from '../hooks/useAppStore';
import { CashOpenPanel } from '../features/cashregister/CashOpenPanel';
import { CashClosePanel } from '../features/cashregister/CashClosePanel';
import { ClosingsHistoryList } from '../features/cashregister/ClosingsHistoryList';
import { calculatePaymentBreakdown, getSessionSales } from '../features/cashregister/reporting';
import { ptBR } from '../i18n/ptBR';

export function CashRegisterPage() {
  const { currentCashSession, sales, cashCloseHistory, openCashSession, closeCashSession } = useAppStore();

  const handleOpen = (initialFloat: number) => {
    openCashSession(initialFloat);
  };

  const handleClose = () => {
    if (!currentCashSession) return;

    const sessionSales = getSessionSales(sales, currentCashSession.id);
    const breakdown = calculatePaymentBreakdown(sessionSales);

    closeCashSession({
      sessionId: currentCashSession.id,
      initialFloat: currentCashSession.initialFloat,
      salesTotal: breakdown.total,
      grandTotal: currentCashSession.initialFloat + breakdown.total,
      cashTotal: breakdown.cash,
      creditTotal: breakdown.credit,
      debitTotal: breakdown.debit,
      pixTotal: breakdown.pix,
    });
  };

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
          />
          
          <CashClosePanel
            session={currentCashSession}
            sales={sales}
            onClose={handleClose}
          />
        </div>

        <div>
          <ClosingsHistoryList closings={cashCloseHistory} />
        </div>
      </div>
    </div>
  );
}
