import { useQuery } from "@tanstack/react-query";
import { configuracoesService } from "@/services/firestore/configuracoes.service";
import { useSalvarConfiguracao } from "@/hooks/useConfiguracoes";
import {
  buildEffectivePricingConfig,
  DEFAULT_PRICING_CONFIG,
  PRICING_CONFIG_TYPE,
  type PricingConfig,
} from "../config/pricingConfig";

export function usePricingConfig() {
  const query = useQuery({
    queryKey: ["configuracoes", PRICING_CONFIG_TYPE],
    queryFn: async () => {
      const result = await configuracoesService.getAtiva(PRICING_CONFIG_TYPE);
      if (!result.success) {
        throw new Error(result.error || "Erro ao carregar configuração de precificação");
      }
      const doc = result.data?.items?.[0];
      const raw = (doc?.dados as Partial<PricingConfig> | undefined) || undefined;
      return {
        docId: doc?.id,
        raw,
        effective: buildEffectivePricingConfig(raw),
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const config = query.data?.effective ?? DEFAULT_PRICING_CONFIG;
  const rawConfig = query.data?.raw ?? null;

  const saveConfig = useSalvarConfiguracao(PRICING_CONFIG_TYPE);

  return {
    ...query,
    config,
    rawConfig,
    saveConfig,
  };
}
