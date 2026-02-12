import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Customer } from '../../types/domain';

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomerId?: string;
  onSelectCustomer: (customerId: string | undefined) => void;
}

export function CustomerSelector({ customers, selectedCustomerId, onSelectCustomer }: CustomerSelectorProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="customer">Link to Customer (Optional)</Label>
      <Select
        value={selectedCustomerId || 'none'}
        onValueChange={(value) => onSelectCustomer(value === 'none' ? undefined : value)}
      >
        <SelectTrigger id="customer">
          <SelectValue placeholder="No customer selected" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No customer</SelectItem>
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id}>
              {customer.name} - {customer.phone}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
