import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { Customer } from '../../types/domain';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  customerSelection: 'none' | 'final-consumer' | 'customer';
  onSelectCustomer: (selection: 'none' | 'final-consumer' | 'customer', customerId: string | null) => void;
}

export function CustomerSelector({ 
  customers, 
  selectedCustomerId, 
  customerSelection,
  onSelectCustomer 
}: CustomerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const [visibleCount, setVisibleCount] = useState(50);

  const filteredCustomers = useMemo(() => {
    if (!debouncedSearch) return customers;
    const search = debouncedSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.phone.includes(search)
    );
  }, [customers, debouncedSearch]);

  const displayedCustomers = useMemo(() => {
    return filteredCustomers.slice(0, visibleCount);
  }, [filteredCustomers, visibleCount]);

  const hasMore = filteredCustomers.length > visibleCount;

  const selectValue = customerSelection === 'final-consumer' 
    ? 'final-consumer' 
    : customerSelection === 'customer' && selectedCustomerId 
      ? selectedCustomerId 
      : 'none';

  return (
    <div className="grid gap-2">
      <Label htmlFor="customer" className="text-base font-semibold">
        Step 1: Choose Customer *
      </Label>
      <Select
        value={selectValue}
        onValueChange={(value) => {
          if (value === 'none') {
            onSelectCustomer('none', null);
          } else if (value === 'final-consumer') {
            onSelectCustomer('final-consumer', null);
          } else {
            onSelectCustomer('customer', value);
          }
          setSearchTerm('');
          setVisibleCount(50);
        }}
      >
        <SelectTrigger id="customer" className="h-12">
          <SelectValue placeholder="Select customer or Final Consumer" />
        </SelectTrigger>
        <SelectContent>
          {customers.length > 10 && (
            <div className="px-2 py-1.5 sticky top-0 bg-popover z-10">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setVisibleCount(50);
                  }}
                  className="h-8 pl-8 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          <SelectItem value="final-consumer">Final Consumer (No customer)</SelectItem>
          {displayedCustomers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id}>
              {customer.name} - {customer.phone}
            </SelectItem>
          ))}
          {hasMore && (
            <div className="px-2 py-1.5 text-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setVisibleCount((prev) => prev + 50);
                }}
                className="text-xs text-primary hover:underline"
              >
                Load more ({filteredCustomers.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
