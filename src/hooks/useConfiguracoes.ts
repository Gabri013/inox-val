import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { configuracoesService, type ConfigTipo, type ConfiguracaoDocumento } from "@/services/firestore/configuracoes.service";
import { toast } from "sonner";

export function useConfiguracaoAtiva(tipo: ConfigTipo) {
  return useQuery({
    queryKey: ["configuracoes", tipo, "ativa"],
    queryFn: async () => {
      const result = await configuracoesService.getAtiva(tipo);
      if (!result.success) {
        throw new Error(result.error || "Erro ao carregar configuração");
      }
      return result.data?.items?.[0] || null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSalvarConfiguracao(tipo: ConfigTipo) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados: Record<string, any>) => {
      const result = await configuracoesService.createNovaVersao(tipo, dados);
      if (!result.success) {
        throw new Error(result.error || "Erro ao salvar configuração");
      }
      return result.data as ConfiguracaoDocumento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracoes", tipo] });
      toast.success("Configuração salva com sucesso!");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar configuração");
    },
  });
}

export function useCalculatorConfig() {
  return useConfiguracaoAtiva("CALCULADORA");
}
