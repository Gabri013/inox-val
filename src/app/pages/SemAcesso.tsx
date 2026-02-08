import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

export default function SemAcesso() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Lock className="size-6" />
        </div>
        <h1 className="text-2xl font-semibold">Acesso negado</h1>
        <p className="text-muted-foreground">
          Sua conta nao possui permissao para acessar esta pagina.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Voltar ao inicio
          </Link>
          <Link
            to="/perfil"
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Ver perfil
          </Link>
        </div>
      </div>
    </div>
  );
}
