/**
 * MODAL DE CONFIGURAÇÃO DE PREÇOS
 * Permite editar tabela de preços de materiais e mão de obra
 */

import { useState } from "react";
import { X, Save, RotateCcw, DollarSign } from "lucide-react";
import type { TabelaPrecos } from "../types/projeto";
import { TABELA_PRECOS_PADRAO } from "../lib/database";

interface Props {
  tabelaAtual: TabelaPrecos;
  onSalvar: (tabela: TabelaPrecos) => void;
  onFechar: () => void;
}

export function ModalConfigurarPrecos({ tabelaAtual, onSalvar, onFechar }: Props) {
  const [tabela, setTabela] = useState<TabelaPrecos>(tabelaAtual);

  const handleSalvar = () => {
    onSalvar(tabela);
    onFechar();
  };

  const handleResetar = () => {
    if (confirm("Resetar para valores padrão?")) {
      setTabela(TABELA_PRECOS_PADRAO);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Configurar Preços</h2>
              <p className="text-sm text-slate-600">Ajuste os valores para sua região</p>
            </div>
          </div>
          <button onClick={onFechar} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Materiais */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Preços de Material (R$/m²)</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(tabela.materiais).map(([key, valor]) => {
                const label = key.replace("AISI304", "AISI 304").replace("AISI430", "AISI 430").replace("_", " · ");

                return (
                  <div key={key} className="bg-slate-50 rounded-lg p-4">
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-700 mb-2 block">{label}</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">R$</span>
                        <input
                          type="number"
                          value={valor}
                          onChange={(e) => {
                            const novaTabela = { ...tabela };
                            novaTabela.materiais[key as keyof typeof tabela.materiais] = Number(e.target.value);
                            setTabela(novaTabela);
                          }}
                          className="w-full pl-10 pr-16 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-semibold"
                          step="0.01"
                          min="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">/m²</span>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Mão de Obra */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Custos de Mão de Obra (R$/min)</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(tabela.maoDeObra).map(([key, valor]) => {
                const labels: Record<string, string> = {
                  corte: "Corte (Plasma/Laser)",
                  solda: "Soldador",
                  polimento: "Polidor/Acabamento",
                  dobra: "Dobra/Vincagem",
                };

                return (
                  <div key={key} className="bg-slate-50 rounded-lg p-4">
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-700 mb-2 block">{labels[key]}</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">R$</span>
                        <input
                          type="number"
                          value={valor}
                          onChange={(e) => {
                            const novaTabela = { ...tabela };
                            novaTabela.maoDeObra[key as keyof typeof tabela.maoDeObra] = Number(e.target.value);
                            setTabela(novaTabela);
                          }}
                          className="w-full pl-10 pr-16 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-semibold"
                          step="0.10"
                          min="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">/min</span>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Margem e Custo Fixo */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Margem e Custos Adicionais</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Margem */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
                <label className="block">
                  <span className="text-sm font-semibold text-green-900 mb-2 block">Margem de Lucro</span>
                  <div className="relative">
                    <input
                      type="number"
                      value={tabela.margemPadrao}
                      onChange={(e) => setTabela({ ...tabela, margemPadrao: Number(e.target.value) })}
                      className="w-full pl-4 pr-12 py-2.5 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-bold text-lg bg-white"
                      step="1"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-700 font-bold text-lg">%</span>
                  </div>
                  <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                      style={{ width: `${tabela.margemPadrao}%` }}
                    />
                  </div>
                </label>
              </div>

              {/* Custo Fixo */}
              <div className="bg-slate-50 rounded-lg p-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700 mb-2 block">Custo Fixo por Projeto</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">R$</span>
                    <input
                      type="number"
                      value={tabela.custoFixo || 0}
                      onChange={(e) => setTabela({ ...tabela, custoFixo: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-semibold"
                      step="10"
                      min="0"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Ex: frete, embalagem, impostos</p>
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleResetar}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-slate-300 rounded-lg hover:bg-slate-100 transition-colors text-sm font-semibold text-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
            Resetar Padrão
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onFechar}
              className="px-4 py-2.5 border-2 border-slate-300 rounded-lg hover:bg-slate-100 transition-colors text-sm font-semibold text-slate-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-semibold shadow-sm"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
