import { memo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';
import type { Product } from '../../types/domain';
import { formatCurrency } from '../../utils/money';
import { ptBR, getCategoryLabel } from '../../i18n/ptBR';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

// Memoized row component to prevent unnecessary re-renders
const ProductRow = memo(({ product, onEdit, onDelete }: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) => (
  <TableRow>
    <TableCell>
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="h-12 w-12 object-cover rounded"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="h-12 w-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
          {ptBR.noImage}
        </div>
      )}
    </TableCell>
    <TableCell className="font-medium">{product.name}</TableCell>
    <TableCell>{getCategoryLabel(product.category)}</TableCell>
    <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
    <TableCell className="text-right">
      <div className="flex items-center justify-end gap-2">
        {product.stock < 5 && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {ptBR.low}
          </Badge>
        )}
        <span>{product.stock}</span>
      </div>
    </TableCell>
    <TableCell className="text-right">
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(product)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(product)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </TableCell>
  </TableRow>
));

ProductRow.displayName = 'ProductRow';

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {ptBR.noProductsFound}
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">{ptBR.image}</TableHead>
            <TableHead>{ptBR.name}</TableHead>
            <TableHead>{ptBR.category}</TableHead>
            <TableHead className="text-right">{ptBR.price}</TableHead>
            <TableHead className="text-right">{ptBR.stock}</TableHead>
            <TableHead className="text-right">{ptBR.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
