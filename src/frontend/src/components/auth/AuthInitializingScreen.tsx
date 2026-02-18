import { Loader2, ShoppingBag } from 'lucide-react';

export function AuthInitializingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <ShoppingBag className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-lg font-medium text-muted-foreground">
            Carregando...
          </p>
        </div>
      </div>
    </div>
  );
}
