/**
 * BIBLIOTECA DE PROJETOS
 * Interface para gerenciar projetos salvos
 */

import { useState } from "react";
import { Folder, Search, Calendar, Copy, Trash2, Download, X } from "lucide-react";
import type { Projeto } from "../types/projeto";
import { formatarMoeda } from "../lib/orcamento";

interface Props {
  projetos: Projeto[];
  onCarregar: (projeto: Projeto) => void;
  onDuplicar: (id: string) => void;
  onDeletar: (id: string) => void;
  onFechar: () => void;
}

export function BibliotecaProjetos({ projetos, onCarregar, onDuplicar, onDeletar, onFechar }: Props) {
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");

  // Filtrar projetos
  const projetosFiltrados = projetos.filter((p) => {
    const matchBusca =
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(busca.toLowerCase()));

    const matchTipo = filtroTipo === "TODOS" || p.configuracao.familia === filtroTipo;

    return matchBusca && matchTipo;
  });

  const formatarData = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      CENTRO: "Mesa de Centro",
      ENCOSTO: "Mesa com Encosto",
      VINCADA: "Mesa Vincada",
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center">
              <Folder className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Biblioteca de Projetos</h2>
              <p className="text-sm text-slate-600">{projetos.length} projetos salvos</p>
            </div>
          </div>
          <button onClick={onFechar} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Filtros */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar projetos..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          {/* Filtros de Tipo */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-600">Tipo:</span>
            {["TODOS", "CENTRO", "ENCOSTO", "VINCADA"].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filtroTipo === tipo ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tipo === "TODOS" ? "Todos" : getTipoLabel(tipo)}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Projetos */}
        <div className="flex-1 overflow-y-auto p-4">
          {projetosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Folder className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {busca || filtroTipo !== "TODOS" ? "Nenhum projeto encontrado" : "Nenhum projeto salvo"}
              </h3>
              <p className="text-sm text-slate-600 max-w-sm">
                {busca || filtroTipo !== "TODOS" ? "Tente ajustar os filtros de busca" : "Calcule uma mesa e clique em 'Salvar Projeto' para começar"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {projetosFiltrados.map((projeto) => (
                <div
                  key={projeto.id}
                  className="bg-white border-2 border-slate-200 rounded-xl p-4 hover:border-sky-400 hover:shadow-md transition-all"
                >
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-lg mb-1 truncate">{projeto.nome}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatarData(projeto.dataModificacao)}</span>
                      </div>
                    </div>

                    {/* Badge do Tipo */}
                    <span className="px-2 py-1 bg-sky-100 text-sky-700 text-xs font-semibold rounded">
                      {getTipoLabel(projeto.configuracao.familia)}
                    </span>
                  </div>

                  {/* Descrição */}
                  {projeto.descricao && <p className="text-sm text-slate-600 mb-3 line-clamp-2">{projeto.descricao}</p>}

                  {/* Especificações */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div className="bg-slate-50 rounded px-2 py-1.5">
                      <div className="text-xs text-slate-500">Dimensões</div>
                      <div className="font-semibold text-slate-900 font-mono text-xs">
                        {projeto.configuracao.C}×{projeto.configuracao.L}×{projeto.configuracao.H}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded px-2 py-1.5">
                      <div className="text-xs text-slate-500">Estrutura</div>
                      <div className="font-semibold text-slate-900 text-xs">
                        {projeto.configuracao.estrutura === "CONTRAVENTADA" ? "Contraventada" : "Prateleira"}
                      </div>
                    </div>
                  </div>

                  {/* Orçamento (se disponível) */}
                  {projeto.orcamento && (
                    <div className="mb-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-green-800">Orçamento</span>
                        <span className="text-sm font-bold text-green-900">
                          {formatarMoeda(projeto.orcamento.custoDetalhado.total)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {projeto.tags && projeto.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                      {projeto.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                      {projeto.tags.length > 3 && <span className="text-xs text-slate-500">+{projeto.tags.length - 3}</span>}
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => onCarregar(projeto)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors text-sm font-semibold"
                    >
                      <Download className="w-4 h-4" />
                      Carregar
                    </button>

                    <button
                      onClick={() => onDuplicar(projeto.id)}
                      className="p-2 border-2 border-slate-300 hover:border-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                      title="Duplicar projeto"
                    >
                      <Copy className="w-4 h-4 text-slate-600" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Deletar "${projeto.nome}"?`)) {
                          onDeletar(projeto.id);
                        }
                      }}
                      className="p-2 border-2 border-slate-300 hover:border-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Deletar projeto"
                    >
                      <Trash2 className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              {projetosFiltrados.length} de {projetos.length} projetos
            </span>
            <button
              onClick={onFechar}
              className="px-4 py-2 border-2 border-slate-300 rounded-lg hover:bg-slate-100 transition-colors font-semibold text-slate-700"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
