import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, Loader2 } from 'lucide-react';
import { ptBR } from '../../i18n/ptBR';

interface CashOpenPanelProps {
  onOpen: (initialFloat: number) => void;
  isOpen: boolean;
  isOpening?: boolean;
}

export function CashOpenPanel({ onOpen, isOpen, isOpening }: CashOpenPanelProps) {
  const [initialFloat, setInitialFloat] = useState('');

  const handleOpen = () => {
    const amount = parseFloat(initialFloat);
    if (isNaN(amount) || amount < 0) {
      return;
    }
    onOpen(amount);
    setInitialFloat('');
  };

  if (isOpen) {
    return (
      <Alert>
        <DollarSign className="h-4 w-4" />
        <AlertDescription>
          {ptBR.cashRegisterCurrentlyOpen}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ptBR.openCashRegister}</CardTitle>
        <CardDescription>{ptBR.openCashRegisterDesc}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="initial-float">{ptBR.initialFloat}</Label>
            <Input
              id="initial-float"
              type="number"
              step="0.01"
              min="0"
              value={initialFloat}
              onChange={(e) => setInitialFloat(e.target.value)}
              placeholder="0.00"
              disabled={isOpening}
            />
          </div>
          <Button onClick={handleOpen} disabled={!initialFloat || isOpening} size="lg">
            {isOpening ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Abrindo...
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                {ptBR.openCashRegister}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
