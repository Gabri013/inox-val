/**
 * GERENCIADOR DE LOTE
 * Interface para adicionar e gerenciar múltiplas mesas
 */

import { useState } from "react";
import { Plus, Trash2, Package, Layers, Calculator, X } from "lucide-react";
import type { ItemLote } from "../types/projeto";
import type { Familia, Estrutura, EspelhoLateral } from "../domain/mesas/types";
import { criarItemLote, calcularEstatisticasLote, type ConfiguracaoMesaLote } from "../lib/lote";

interface Props {
  itens: ItemLote[];
  onAtualizarItens: (itens: ItemLote[]) => void;
  onCalcularNesting: () => void;
  onFechar: () => void;
}

export function GerenciadorLote({ itens, onAtualizarItens, onCalcularNesting, onFechar }: Props) {
  const [mostrarForm, setMostrarForm] = useState(false);

  // Form state
  const [nome, setNome] = useState("");
  const [familia, setFamilia] = useState<Familia>("CENTRO");
  const [C, setC] = useState(1500);
  const [L, setL] = useState(700);
  const [H, setH] = useState(900);
  const [espelhoLateral, setEspelhoLateral] = useState<EspelhoLateral>("NENHUM");
  const [cubaComp, setCubaComp] = useState(400);
  const [cubaLarg, setCubaLarg] = useState(300);
  const [cubaProf, setCubaProf] = useState(200);
  const [estrutura, setEstrutura] = useState<Estrutura>("CONTRAVENTADA");

  const stats = calcularEstatisticasLote(itens);

  const handleAdicionarItem = () => {
    if (!nome.trim()) {
      alert("Digite um nome para a mesa!");
      return;
    }

    const config: ConfiguracaoMesaLote = {
      nome: nome.trim(),
      familia,
      C,
      L,
      H,
      espelhoLateral: familia === "CENTRO" ? undefined : espelhoLateral,
      cuba: familia === "VINCADA" ? { comp: cubaComp, larg: cubaLarg, prof: cubaProf } : undefined,
      estrutura,
    };

    const novoItem = criarItemLote(config);

    if (!novoItem) {
      alert("❌ Erro ao criar item. Verifique as configurações.");
      return;
    }

    onAtualizarItens([...itens, novoItem]);

    // Reset form
    setNome(`Mesa ${itens.length + 2}`);
    setMostrarForm(false);

    alert(`✅ "${novoItem.nome}" adicionado ao lote!`);
  };

  const handleRemoverItem = (id: string) => {
    onAtualizarItens(itens.filter((item) => item.id !== id));
  };

  const handleNovoFormulario = () => {
    setNome(`Mesa ${itens.length + 1}`);
    setMostrarForm(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Modo Lote</h2>
              <p className="text-sm text-slate-600">
                {itens.length} {itens.length === 1 ? "mesa" : "mesas"} no lote
              </p>
            </div>
          </div>
          <button onClick={onFechar} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Stats */}
        {itens.length > 0 && (
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalMesas}</div>
                <div className="text-xs text-slate-600">Mesas</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-sky-600">{stats.totalChapas}</div>
                <div className="text-xs text-slate-600">Chapas</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-amber-600">{stats.totalTubos}</div>
                <div className="text-xs text-slate-600">Tubos</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalItens}</div>
                <div className="text-xs text-slate-600">Itens Total</div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Lista de Itens */}
          {itens.length > 0 && (
            <div className="mb-6 space-y-3">
              <h3 className="font-semibold text-slate-900">Mesas no Lote</h3>
              {itens.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white border-2 border-slate-200 rounded-lg p-4 hover:border-purple-400 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{item.nome}</h4>
                        <p className="text-sm text-slate-600">
                          {item.configuracao.familia === "CENTRO" && "Mesa de Centro"}
                          {item.configuracao.familia === "ENCOSTO" && "Mesa com Encosto"}
                          {item.configuracao.familia === "VINCADA" && "Mesa Vincada"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoverItem(item.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-slate-50 rounded px-2 py-1.5">
                      <div className="text-xs text-slate-500">Dimensões</div>
                      <div className="font-semibold text-slate-900 font-mono text-xs">
                        {item.configuracao.C}×{item.configuracao.L}×{item.configuracao.H}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded px-2 py-1.5">
                      <div className="text-xs text-slate-500">Estrutura</div>
                      <div className="font-semibold text-slate-900 text-xs">
                        {item.configuracao.estrutura === "CONTRAVENTADA" ? "Contraventada" : "Prateleira"}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded px-2 py-1.5">
                      <div className="text-xs text-slate-500">Itens BOM</div>
                      <div className="font-semibold text-slate-900 text-xs">
                        {item.bom.ok ? item.bom.bom.length : 0} itens
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Formulário para Adicionar */}
          {!mostrarForm ? (
            <button
              onClick={handleNovoFormulario}
              className="w-full flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-slate-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-slate-600 hover:text-purple-700"
            >
              <Plus className="w-6 h-6" />
              <span className="font-semibold">Adicionar Mesa ao Lote</span>
            </button>
          ) : (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nova Mesa
              </h3>

              {/* Nome */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">Nome da Mesa</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Ex: Mesa Cozinha Industrial"
                />
              </div>

              {/* Família */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">Tipo de Mesa</label>
                <div className="grid grid-cols-3 gap-2">
                  {["CENTRO", "ENCOSTO", "VINCADA"].map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() => setFamilia(tipo as Familia)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        familia === tipo ? "bg-purple-600 text-white" : "bg-white border border-slate-300 text-slate-700 hover:border-purple-400"
                      }`}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimensões */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 text-xs font-semibold text-slate-700">C (mm)</label>
                  <input
                    type="number"
                    value={C}
                    onChange={(e) => setC(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-semibold text-slate-700">L (mm)</label>
                  <input
                    type="number"
                    value={L}
                    onChange={(e) => setL(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-semibold text-slate-700">H (mm)</label>
                  <input
                    type="number"
                    value={H}
                    onChange={(e) => setH(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
              </div>

              {/* Cuba (se VINCADA) */}
              {familia === "VINCADA" && (
                <>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-700">Espelho Lateral</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["ESQUERDO", "DIREITO"].map((lado) => (
                        <button
                          key={lado}
                          onClick={() => setEspelhoLateral(lado as EspelhoLateral)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            espelhoLateral === lado ? "bg-purple-600 text-white" : "bg-white border border-slate-300 text-slate-700"
                          }`}
                        >
                          {lado}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 text-xs font-semibold text-slate-700">Cuba C (mm)</label>
                      <input
                        type="number"
                        value={cubaComp}
                        onChange={(e) => setCubaComp(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-semibold text-slate-700">Cuba L (mm)</label>
                      <input
                        type="number"
                        value={cubaLarg}
                        onChange={(e) => setCubaLarg(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-semibold text-slate-700">Cuba P (mm)</label>
                      <input
                        type="number"
                        value={cubaProf}
                        onChange={(e) => setCubaProf(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Espelho (se ENCOSTO) */}
              {familia === "ENCOSTO" && (
                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">Espelho Lateral</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["NENHUM", "ESQUERDO", "DIREITO"].map((lado) => (
                      <button
                        key={lado}
                        onClick={() => setEspelhoLateral(lado as EspelhoLateral)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          espelhoLateral === lado ? "bg-purple-600 text-white" : "bg-white border border-slate-300 text-slate-700"
                        }`}
                      >
                        {lado}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Estrutura */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">Estrutura</label>
                <div className="grid grid-cols-2 gap-2">
                  {["CONTRAVENTADA", "PRATELEIRA"].map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() => setEstrutura(tipo as Estrutura)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        estrutura === tipo ? "bg-purple-600 text-white" : "bg-white border border-slate-300 text-slate-700"
                      }`}
                    >
                      {tipo === "CONTRAVENTADA" ? "Contraventada" : "Prateleira"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botões */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setMostrarForm(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-semibold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAdicionarItem}
                  className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
                >
                  Adicionar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onFechar}
              className="px-4 py-2.5 border-2 border-slate-300 rounded-lg hover:bg-white transition-colors font-semibold text-slate-700"
            >
              Fechar
            </button>

            {itens.length > 0 && (
              <button
                onClick={onCalcularNesting}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold shadow-sm"
              >
                <Calculator className="w-5 h-5" />
                Calcular Nesting do Lote ({itens.length} {itens.length === 1 ? "mesa" : "mesas"})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
