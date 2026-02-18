import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, AlertCircle, Loader2, Search } from 'lucide-react';
import { CustomerFormDialog } from '../features/customers/CustomerFormDialog';
import { CustomersList } from '../features/customers/CustomersList';
import { CustomerDetail } from '../features/customers/CustomerDetail';
import { ptBR } from '../i18n/ptBR';
import type { Customer } from '../types/domain';
import { useListCustomers, useCreateCustomer, useUpdateCustomer } from '../hooks/useQueries';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

export function CustomersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | undefined>(undefined);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  // Backend queries
  const { data: customers = [], isLoading: customersLoading } = useListCustomers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const filteredCustomers = useMemo(() => {
    if (!debouncedSearch) return customers;
    const search = debouncedSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.phone.includes(search)
    );
  }, [customers, debouncedSearch]);

  const handleAdd = useCallback(() => {
    setEditingCustomer(undefined);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((customer: Customer) => {
    setEditingCustomer(customer);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(async (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingCustomer) {
        await updateCustomer.mutateAsync({
          id: editingCustomer.id,
          name: data.name,
          phone: data.phone,
        });
      } else {
        await createCustomer.mutateAsync({
          id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: data.name,
          phone: data.phone,
        });
      }
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving customer:', error);
    }
  }, [editingCustomer, createCustomer, updateCustomer]);

  const handleDelete = useCallback((customer: Customer) => {
    setDeleteError(null);
    
    // Note: Backend doesn't support delete yet, so we show an error
    setDeleteError('A exclusão de clientes não está disponível no momento.');
  }, []);

  const handleView = useCallback((customer: Customer) => {
    setViewingCustomer(customer);
  }, []);

  const handleBack = useCallback(() => {
    setViewingCustomer(undefined);
  }, []);

  if (viewingCustomer) {
    return (
      <div className="space-y-6">
        <CustomerDetail
          customer={viewingCustomer}
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{ptBR.customerManagement}</h1>
          <p className="text-muted-foreground mt-1">{ptBR.customerManagementDesc}</p>
        </div>
        <Button onClick={handleAdd} size="lg" disabled={createCustomer.isPending}>
          {createCustomer.isPending ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Plus className="h-5 w-5 mr-2" />
          )}
          {ptBR.addCustomer}
        </Button>
      </div>

      {deleteError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}

      {(createCustomer.error || updateCustomer.error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {createCustomer.error instanceof Error ? createCustomer.error.message : updateCustomer.error instanceof Error ? updateCustomer.error.message : 'Erro ao salvar cliente'}
          </AlertDescription>
        </Alert>
      )}

      {customers.length > 10 && (
        <div className="max-w-md">
          <Label htmlFor="customer-search">Buscar Clientes</Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="customer-search"
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )}

      {customersLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <CustomersList
          customers={filteredCustomers}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editingCustomer}
        onSave={handleSave}
        isSaving={createCustomer.isPending || updateCustomer.isPending}
      />
    </div>
  );
}
