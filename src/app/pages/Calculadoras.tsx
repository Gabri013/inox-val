import { Link } from 'react-router-dom';
import { Calculator, Zap, Wand2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

export default function Calculadoras() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Calculadoras"
        description="Escolha o tipo de cálculo que você quer fazer"
        icon={Calculator}
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="size-5" />
              Calculadora de Orçamentos (Industrial)
            </CardTitle>
            <CardDescription>
              Wizard completo (mesas industriais), com nesting e orçamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button asChild>
              <Link to="/calculadora/industrial">Abrir Industrial</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="size-5" />
              Calculadora de Orçamentos (Rápida)
            </CardTitle>
            <CardDescription>
              Cálculo rápido por modelo BOM (BOM + nesting + preço).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button asChild variant="secondary">
              <Link to="/calculadora/rapida">Abrir Rápida</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
