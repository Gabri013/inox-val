import { FirestoreService } from "./base";
import { COLLECTIONS } from "@/types/firebase";

export type ConfigTipo = "CUSTOS" | "CALCULADORA" | "GERAL";

export interface ConfiguracaoDocumento {
  id: string;
  tipo: ConfigTipo;
  versao: number;
  ativa: boolean;
  dados: Record<string, any>;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
  updatedBy?: string;
  empresaId?: string;
  isDeleted?: boolean;
}

class ConfiguracoesService extends FirestoreService<ConfiguracaoDocumento> {
  constructor() {
    super(COLLECTIONS.configuracoes, { softDelete: false });
  }

  async getAtiva(tipo: ConfigTipo) {
    return this.list({
      where: [
        { field: "tipo", operator: "==", value: tipo },
        { field: "ativa", operator: "==", value: true },
      ],
      orderBy: [{ field: "versao", direction: "desc" }],
      limit: 1,
    });
  }

  async createNovaVersao(tipo: ConfigTipo, dados: Record<string, any>) {
    const latest = await this.getAtiva(tipo);
    const versao = latest.success && latest.data?.items[0]?.versao ? latest.data.items[0].versao + 1 : 1;
    if (latest.success && latest.data?.items[0]) {
      await this.update(latest.data.items[0].id, { ativa: false } as Partial<ConfiguracaoDocumento>);
    }
    return this.create({ tipo, versao, ativa: true, dados } as ConfiguracaoDocumento);
  }
}

export const configuracoesService = new ConfiguracoesService();
