import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Página não encontrada</h2>
        <p className="text-muted-foreground max-w-md">
          A página que você está procurando não existe ou foi movida.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild variant="outline" className="gap-2">
          <Link to="/">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>
        <Button asChild className="gap-2">
          <Link to="/">
            <Home className="size-4" />
            Ir para Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
