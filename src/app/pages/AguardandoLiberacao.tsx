/**
 * ============================================================================
 * PÃGINA AGUARDANDO LIBERAÃ‡ÃƒO
 * ============================================================================
 */

import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

type LocationState = {
  email?: string;
};

export function AguardandoLiberacao() {
  const location = useLocation();

  const email = useMemo(() => {
    const stateEmail = (location.state as LocationState | null)?.email;
    if (stateEmail) return stateEmail;
    return localStorage.getItem('inoxval_pending_email') || '';
  }, [location.state]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Aguardando liberaÃ§Ã£o</CardTitle>
          <CardDescription>
            Conta criada/conta aguardando liberaÃ§Ã£o do administrador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>PeÃ§a para o admin ativar seu usuÃ¡rio.</p>
          {email ? (
            <div className="rounded-md border bg-white px-3 py-2 text-xs text-slate-600">
              Email: <span className="font-medium text-slate-800">{email}</span>
            </div>
          ) : null}
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link to="/login">Voltar para Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default AguardandoLiberacao;
