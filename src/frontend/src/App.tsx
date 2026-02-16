import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { PosPage } from './pages/PosPage';
import { CustomersPage } from './pages/CustomersPage';
import { CashRegisterPage } from './pages/CashRegisterPage';
import { SalesHistoryPage } from './pages/SalesHistoryPage';
import { ptBR } from './i18n/ptBR';

type Page = 'dashboard' | 'inventory' | 'pos' | 'customers' | 'cash-register' | 'sales-history';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'inventory':
        return <InventoryPage />;
      case 'pos':
        return <PosPage />;
      case 'customers':
        return <CustomersPage />;
      case 'cash-register':
        return <CashRegisterPage />;
      case 'sales-history':
        return <SalesHistoryPage />;
      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">{ptBR.appName}</h1>
            </div>
            {currentPage !== 'dashboard' && (
              <Button
                variant="outline"
                onClick={() => setCurrentPage('dashboard')}
              >
                <Home className="h-4 w-4 mr-2" />
                {ptBR.dashboard}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>

      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {ptBR.appName} • {ptBR.builtWithLove}{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'mini-market-manager'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
