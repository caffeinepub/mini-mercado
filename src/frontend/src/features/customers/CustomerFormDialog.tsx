import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Customer } from '../../types/domain';
import { ptBR } from '../../i18n/ptBR';

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
  onSave: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function CustomerFormDialog({ open, onOpenChange, customer, onSave }: CustomerFormDialogProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
    } else {
      setName('');
      setPhone('');
    }
  }, [customer, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      onSave({ name, phone });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{customer ? ptBR.editCustomer : ptBR.addNewCustomer}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customer-name">{ptBR.customerName}</Label>
              <Input
                id="customer-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={ptBR.customerNamePlaceholder}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="customer-phone">{ptBR.phoneNumber}</Label>
              <Input
                id="customer-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder={ptBR.phoneNumberPlaceholder}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {ptBR.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? ptBR.saving : ptBR.saveCustomer}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
