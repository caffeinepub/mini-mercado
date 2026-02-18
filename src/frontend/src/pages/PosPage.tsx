import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, ShoppingCart, Loader2, AlertTriangle } from 'lucide-react';
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
import { saveDraft, loadDraft, clearDraft } from '../features/pos/draftSaleStorage';
import type { CartItem } from '../features/pos/cartTypes';

export function PosPage() {
  const { products } = useAppStore();
  const cart = useCart();
  const [customerSelection, setCustomerSelection] = useState<'none' | 'final-consumer' | 'customer'>('none');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [saleCompleted, setSaleCompleted] = useState(false);
  const [lastSaleId, setLastSaleId] = useState<string | null>(null);
  const [lastSaleTotal, setLastSaleTotal] = useState(0);
  const [saleError, setSaleError] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);

  // Backend queries
  const { data: customers = [], isLoading: customersLoading } = useListCustomers();
  const { data: currentCashSession, isLoading: sessionLoading } = useGetOpenRegisterSession();
  const recordSale = useRecordSale();

  // Restore draft on mount
  useEffect(() => {
    if (draftRestored) return;
    
    const draft = loadDraft();
    if (draft && draft.cartItems.length > 0) {
      // Restore customer selection
      if (draft.customerSelection === 'final-consumer') {
        setCustomerSelection('final-consumer');
        setSelectedCustomerId(null);
      } else if (draft.customerSelection === 'customer' && draft.customerId) {
        setCustomerSelection('customer');
        setSelectedCustomerId(draft.customerId);
      }

      // Restore cart items
      const restoredItems: CartItem[] = [];
      draft.cartItems.forEach((draftItem) => {
        const product = products.find((p) => p.id === draftItem.productId);
        if (product && product.stock >= draftItem.quantity) {
          restoredItems.push({
            product,
            quantity: draftItem.quantity,
          });
        }
      });

      if (restoredItems.length > 0) {
        cart.setCartItems(restoredItems);
      }
    }
    
    setDraftRestored(true);
  }, [draftRestored, products, cart]);

  // Auto-save draft when customer or cart changes
  useEffect(() => {
    if (!draftRestored) return;

    if (customerSelection !== 'none' || cart.items.length > 0) {
      saveDraft({
        customerId: selectedCustomerId,
        customerSelection,
        cartItems: cart.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        timestamp: Date.now(),
      });
    }
  }, [customerSelection, selectedCustomerId, cart.items, draftRestored]);

  const handleAddToCart = useCallback((product: typeof products[0]) => {
    const success = cart.addItem(product, 1);
    if (!success && cart.error) {
      // Error is already set in cart state
    }
  }, [cart]);

  const handleCompleteSale = useCallback(async (paymentMethod: PaymentMethod, amountPaid: number, change: number) => {
    setSaleError(null);

    try {
      const result = await recordSale.mutateAsync({
        customerId: customerSelection === 'customer' ? selectedCustomerId : null,
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

      setLastSaleId(result.id);
      setLastSaleTotal(cart.total);
      setSaleCompleted(true);
      cart.clearCart();
      setCustomerSelection('none');
      setSelectedCustomerId(null);
      clearDraft();
    } catch (error: any) {
      console.error('Error recording sale:', error);
      setSaleError(error.message || 'Erro ao registrar venda');
    }
  }, [customerSelection, selectedCustomerId, cart, recordSale]);

  const handleNewSale = useCallback(() => {
    setSaleCompleted(false);
    setLastSaleId(null);
    setLastSaleTotal(0);
    setSaleError(null);
  }, []);

  const handleUpdateQuantity = useCallback((productId: string, quantity: number) => {
    cart.updateQuantity(productId, quantity);
  }, [cart]);

  const handleRemoveItem = useCallback((productId: string) => {
    cart.removeItem(productId);
  }, [cart]);

  const handleCustomerChange = useCallback((
    selection: 'none' | 'final-consumer' | 'customer',
    customerId: string | null
  ) => {
    setCustomerSelection(selection);
    setSelectedCustomerId(customerId);
  }, []);

  const isCustomerSelected = customerSelection !== 'none';
  const canProceedToCheckout = isCustomerSelected && cart.items.length > 0 && !!currentCashSession;

  if (saleCompleted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">{ptBR.saleCompletedSuccess}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lastSaleId && (
              <div className="text-center pb-2">
                <p className="text-sm text-muted-foreground">Sale ID</p>
                <p className="text-lg font-mono font-semibold">#{lastSaleId}</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-muted-foreground">{ptBR.total}</p>
              <p className="text-4xl font-bold">R$ {lastSaleTotal.toFixed(2)}</p>
            </div>
            <Button onClick={handleNewSale} className="w-full" size="lg">
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
          <h1 className="text-4xl font-bold">{ptBR.pointOfSale}</h1>
          <p className="text-muted-foreground mt-2">{ptBR.pointOfSaleDesc}</p>
        </div>
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <span className="font-semibold">{cart.items.length} {ptBR.items(cart.items.length)}</span>
        </div>
      </div>

      {!currentCashSession && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{ptBR.cashRegisterNotOpen}</AlertDescription>
        </Alert>
      )}

      {saleError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{saleError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Selection</CardTitle>
              <CardDescription>Choose a customer or select "Final Consumer" to proceed</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerSelector
                customers={customers}
                selectedCustomerId={selectedCustomerId}
                customerSelection={customerSelection}
                onSelectCustomer={handleCustomerChange}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{ptBR.products}</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductPicker
                products={products}
                onAddToCart={handleAddToCart}
                disabled={!isCustomerSelected}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{ptBR.shoppingCart}</CardTitle>
            </CardHeader>
            <CardContent>
              <CartPanel
                items={cart.items}
                total={cart.total}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />
            </CardContent>
          </Card>

          {cart.total >= 50 && customerSelection === 'customer' && selectedCustomerId && (
            <RaffleEligibilityAlert total={cart.total} />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Step 3: {ptBR.checkout}</CardTitle>
            </CardHeader>
            <CardContent>
              {!canProceedToCheckout && (
                <Alert className="mb-4">
                  <AlertDescription>
                    {!isCustomerSelected && 'Please select a customer first. '}
                    {isCustomerSelected && cart.items.length === 0 && 'Please add products to cart. '}
                    {isCustomerSelected && cart.items.length > 0 && !currentCashSession && 'Cash register must be open.'}
                  </AlertDescription>
                </Alert>
              )}
              <CheckoutPanel
                total={cart.total}
                onComplete={handleCompleteSale}
                disabled={!canProceedToCheckout}
                isProcessing={recordSale.isPending}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
