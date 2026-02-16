import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Users, DollarSign, History } from 'lucide-react';
import { ptBR } from '../i18n/ptBR';

interface DashboardPageProps {
  onNavigate: (page: 'inventory' | 'pos' | 'customers' | 'cash-register' | 'sales-history') => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const menuItems = [
    {
      id: 'inventory' as const,
      title: ptBR.inventory,
      description: ptBR.inventoryDescription,
      icon: Package,
      color: 'text-chart-1',
    },
    {
      id: 'pos' as const,
      title: ptBR.pos,
      description: ptBR.posDescription,
      icon: ShoppingCart,
      color: 'text-chart-2',
    },
    {
      id: 'customers' as const,
      title: ptBR.customers,
      description: ptBR.customersDescription,
      icon: Users,
      color: 'text-chart-3',
    },
    {
      id: 'cash-register' as const,
      title: ptBR.cashRegister,
      description: ptBR.cashRegisterDescription,
      icon: DollarSign,
      color: 'text-chart-4',
    },
    {
      id: 'sales-history' as const,
      title: ptBR.salesHistory,
      description: ptBR.salesHistoryDescription,
      icon: History,
      color: 'text-chart-5',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">{ptBR.dashboardTitle}</h1>
        <p className="text-muted-foreground mt-2">{ptBR.dashboardSubtitle}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.id}
              className="cursor-pointer hover:border-primary transition-all hover:shadow-lg"
              onClick={() => onNavigate(item.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-muted ${item.color}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{item.title}</CardTitle>
                    <CardDescription className="text-base mt-1">{item.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
