import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShoppingBag, AlertCircle } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { ptBR } from '../i18n/ptBR';

export function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';
  const isError = loginStatus === 'loginError';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">{ptBR.appName}</CardTitle>
            <CardDescription className="mt-2 text-base">
              Sistema completo de gestão para mini mercados
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao fazer login. Por favor, tente novamente.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                'Entrar com Internet Identity'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Faça login de forma segura usando Internet Identity
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
