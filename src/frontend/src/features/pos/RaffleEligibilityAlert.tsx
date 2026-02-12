import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy } from 'lucide-react';
import { ptBR } from '../../i18n/ptBR';

interface RaffleEligibilityAlertProps {
  total: number;
}

const RAFFLE_THRESHOLD = 50.0;

export function RaffleEligibilityAlert({ total }: RaffleEligibilityAlertProps) {
  if (total < RAFFLE_THRESHOLD) {
    return null;
  }

  return (
    <Alert className="bg-chart-1/10 border-chart-1">
      <Trophy className="h-5 w-5 text-chart-1" />
      <AlertDescription className="font-bold text-lg text-chart-1">
        {ptBR.raffleEligible}
      </AlertDescription>
    </Alert>
  );
}
