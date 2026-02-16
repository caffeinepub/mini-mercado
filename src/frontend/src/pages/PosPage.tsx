import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, ShoppingCart, Loader2 } from 'lucide-react';
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
import { useRecordSale } from '../hooks/useQueries';
import { useGetOpenRegisterSession, useListCustomers } from '../hooks/useQueries';

export function PosPage() {
  const { products } = useAppStore();
  const cart = useCart();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
  const [saleCompleted, setSaleCompleted] = useState(false);
  const [lastSaleTotal, setLastSaleTotal] = useState(0);
  const [saleError, setSaleError] = useState<string | null>(null);

  // Backend queries
  const { data: customers = [], isLoading: customersLoading } = useListCustomers();
  const { data: currentCashSession, isLoading: sessionLoading } = useGetOpenRegisterSession();
  const recordSale = useRecordSale();

  const handleAddToCart = (product: typeof products[0]) => {
    const success = cart.addItem(product, 1);
    if (!success && cart.error) {
      // Error is already set in cart state
    }
  };

  const handleCompleteSale = async (paymentMethod: PaymentMethod, amountPaid: number, change: number) => {
    if (!selectedCustomerId) {
      setSaleError('Por favor, selecione um cliente');
      return;
    }

    setSaleError(null);

    try {
      await recordSale.mutateAsync({
        customerId: selectedCustomerId,
        items: cartItemsToSaleItems(cart.items),
        paymentMethod,
        amountPaid,
      });

      // Update product stock locally
      cart.items.forEach((item) => {
        useAppStore.getState().updateProduct(item.product.id, {
          stock: item.product.stock - item.quantity,
        });
      });

      setLastSaleTotal(cart.total);
      setSaleCompleted(true);
      cart.clearCart();
      setSelectedCustomerId(undefined);
    } catch (error: any) {
      console.error('Error recording sale:', error);
      setSaleError(error.message || 'Erro ao registrar venda');
    }
  };

  const handleNewSale = () => {
    setSaleCompleted(false);
    setLastSaleTotal(0);
    setSaleError(null);
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
        {!sessionLoading && !currentCashSession && (
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
              {saleError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{saleError}</AlertDescription>
                </Alert>
              )}
              {recordSale.error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    {recordSale.error instanceof Error ? recordSale.error.message : 'Erro ao registrar venda'}
                  </AlertDescription>
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
                {customersLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <CustomerSelector
                    customers={customers}
                    selectedCustomerId={selectedCustomerId}
                    onSelectCustomer={setSelectedCustomerId}
                  />
                )}
                <CheckoutPanel
                  total={cart.total}
                  onComplete={handleCompleteSale}
                  disabled={recordSale.isPending || !selectedCustomerId}
                  isProcessing={recordSale.isPending}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
