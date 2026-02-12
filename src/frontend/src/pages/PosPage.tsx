import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, ShoppingCart } from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import { useCart } from '../features/pos/useCart';
import { ProductPicker } from '../features/pos/ProductPicker';
import { CartPanel } from '../features/pos/CartPanel';
import { CheckoutPanel } from '../features/pos/CheckoutPanel';
import { CustomerSelector } from '../features/pos/CustomerSelector';
import { RaffleEligibilityAlert } from '../features/pos/RaffleEligibilityAlert';
import { cartItemsToSaleItems } from '../features/pos/cartTypes';
import { ptBR } from '../i18n/ptBR';
import type { PaymentMethod } from '../types/domain';

export function PosPage() {
  const { products, customers, addSale, currentCashSession } = useAppStore();
  const cart = useCart();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
  const [saleCompleted, setSaleCompleted] = useState(false);
  const [lastSaleTotal, setLastSaleTotal] = useState(0);

  const handleAddToCart = (product: typeof products[0]) => {
    const success = cart.addItem(product, 1);
    if (!success && cart.error) {
      // Error is already set in cart state
    }
  };

  const handleCompleteSale = (paymentMethod: PaymentMethod, amountPaid: number, change: number) => {
    const customer = customers.find((c) => c.id === selectedCustomerId);
    
    addSale({
      items: cartItemsToSaleItems(cart.items),
      total: cart.total,
      amountPaid,
      change,
      paymentMethod,
      customerId: customer?.id,
      customerName: customer?.name,
    });

    setLastSaleTotal(cart.total);
    setSaleCompleted(true);
    cart.clearCart();
    setSelectedCustomerId(undefined);
  };

  const handleNewSale = () => {
    setSaleCompleted(false);
    setLastSaleTotal(0);
  };

  if (saleCompleted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{ptBR.pointOfSale}</h1>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-chart-2" />
              <CardTitle className="text-2xl">{ptBR.saleCompletedSuccess}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <RaffleEligibilityAlert total={lastSaleTotal} />
            <Button onClick={handleNewSale} size="lg" className="w-full">
              <ShoppingCart className="h-5 w-5 mr-2" />
              {ptBR.startNewSale}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{ptBR.pointOfSale}</h1>
          <p className="text-muted-foreground mt-1">{ptBR.pointOfSaleDesc}</p>
        </div>
        {!currentCashSession && (
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription>
              {ptBR.cashRegisterNotOpen}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{ptBR.products}</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductPicker products={products} onAddToCart={handleAddToCart} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{ptBR.shoppingCart}</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{cart.error}</AlertDescription>
                </Alert>
              )}
              <CartPanel
                items={cart.items}
                total={cart.total}
                onUpdateQuantity={cart.updateQuantity}
                onRemoveItem={cart.removeItem}
              />
            </CardContent>
          </Card>

          {cart.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{ptBR.checkout}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RaffleEligibilityAlert total={cart.total} />
                <CustomerSelector
                  customers={customers}
                  selectedCustomerId={selectedCustomerId}
                  onSelectCustomer={setSelectedCustomerId}
                />
                <CheckoutPanel
                  total={cart.total}
                  onComplete={handleCompleteSale}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
