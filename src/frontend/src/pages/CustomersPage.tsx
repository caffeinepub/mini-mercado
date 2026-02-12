import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, AlertCircle } from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import { CustomerFormDialog } from '../features/customers/CustomerFormDialog';
import { CustomersList } from '../features/customers/CustomersList';
import { CustomerDetail } from '../features/customers/CustomerDetail';
import { ptBR } from '../i18n/ptBR';
import type { Customer } from '../types/domain';

export function CustomersPage() {
  const { customers, sales, addCustomer, updateCustomer, deleteCustomer } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | undefined>(undefined);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingCustomer(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setDialogOpen(true);
  };

  const handleSave = (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, data);
    } else {
      addCustomer(data);
    }
  };

  const handleDelete = (customer: Customer) => {
    setDeleteError(null);
    
    // Check if customer has purchase history
    const customerSales = sales.filter((sale) => sale.customerId === customer.id);
    if (customerSales.length > 0) {
      setDeleteError(ptBR.cannotDeleteCustomer(customer.name, customerSales.length));
      return;
    }

    if (confirm(ptBR.deleteCustomerConfirm(customer.name))) {
      deleteCustomer(customer.id);
    }
  };

  const handleView = (customer: Customer) => {
    setViewingCustomer(customer);
  };

  const handleBack = () => {
    setViewingCustomer(undefined);
  };

  if (viewingCustomer) {
    return (
      <div className="space-y-6">
        <CustomerDetail
          customer={viewingCustomer}
          sales={sales}
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
        <Button onClick={handleAdd} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          {ptBR.addCustomer}
        </Button>
      </div>

      {deleteError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}

      <CustomersList
        customers={customers}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editingCustomer}
        onSave={handleSave}
      />
    </div>
  );
}
