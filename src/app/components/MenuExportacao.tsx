/**
 * MENU DE EXPORTAÇÃO
 * Interface para exportar BOM e Nesting em diversos formatos
 */

import { useState } from "react";
import { Download, FileText, FileSpreadsheet, X, CheckCircle2 } from "lucide-react";
import type { Resultado } from "../domain/mesas/types";
import type { ResultadoNesting } from "../lib/nestingProfissional";
import type { Orcamento } from "../types/projeto";
import { exportarBOMparaCSV, exportarBOMparaExcel, exportarRelatorioCompleto } from "../lib/exportacao";

interface Props {
  configuracao: any;
  bom: Resultado;
  nesting?: ResultadoNesting;
  orcamento?: Orcamento;
  onFechar: () => void;
}

export function MenuExportacao({ configuracao, bom, nesting, orcamento, onFechar }: Props) {
  const [opcoes, setOpcoes] = useState({
    incluirBOM: true,
    incluirNesting: true,
    incluirOrcamento: true,
  });

  const handleExportarCSV = () => {
    if (!bom.ok) return;
    exportarBOMparaCSV(bom.bom);
    alert("✅ BOM exportado em CSV!");
  };

  const handleExportarExcel = () => {
    if (!bom.ok) return;
    exportarBOMparaExcel(bom.bom);
    alert("✅ BOM exportado em Excel!");
  };

  const handleExportarPDF = () => {
    exportarRelatorioCompleto(configuracao, bom, nesting, orcamento);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Exportar Relatório</h2>
              <p className="text-sm text-slate-600">Escolha o formato de exportação</p>
            </div>
          </div>
          <button onClick={onFechar} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Opções de Conteúdo */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Conteúdo do Relatório</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={opcoes.incluirBOM}
                  onChange={(e) => setOpcoes({ ...opcoes, incluirBOM: e.target.checked })}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-900">Bill of Materials (BOM)</div>
                  <div className="text-sm text-slate-600">Lista completa de componentes</div>
                </div>
                {opcoes.incluirBOM && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              </label>

              {nesting && (
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={opcoes.incluirNesting}
                    onChange={(e) => setOpcoes({ ...opcoes, incluirNesting: e.target.checked })}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">Nesting & Otimização</div>
                    <div className="text-sm text-slate-600">Estatísticas de aproveitamento</div>
                  </div>
                  {opcoes.incluirNesting && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                </label>
              )}

              {orcamento && (
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={opcoes.incluirOrcamento}
                    onChange={(e) => setOpcoes({ ...opcoes, incluirOrcamento: e.target.checked })}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">Orçamento Detalhado</div>
                    <div className="text-sm text-slate-600">Custos e precificação</div>
                  </div>
                  {opcoes.incluirOrcamento && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                </label>
              )}
            </div>
          </div>

          {/* Formatos de Exportação */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Formato de Exportação</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* PDF Completo */}
              <button
                onClick={handleExportarPDF}
                className="flex flex-col items-center gap-3 p-4 border-2 border-slate-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
              >
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-500 transition-colors">
                  <FileText className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-slate-900 text-sm">PDF Completo</div>
                  <div className="text-xs text-slate-600">Relatório imprimível</div>
                </div>
              </button>

              {/* Excel */}
              <button
                onClick={handleExportarExcel}
                disabled={!bom.ok}
                className="flex flex-col items-center gap-3 p-4 border-2 border-slate-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-500 transition-colors">
                  <FileSpreadsheet className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-slate-900 text-sm">Excel (.xls)</div>
                  <div className="text-xs text-slate-600">Somente BOM</div>
                </div>
              </button>

              {/* CSV */}
              <button
                onClick={handleExportarCSV}
                disabled={!bom.ok}
                className="flex flex-col items-center gap-3 p-4 border-2 border-slate-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                  <FileSpreadsheet className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-slate-900 text-sm">CSV</div>
                  <div className="text-xs text-slate-600">Somente BOM</div>
                </div>
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <div className="flex gap-3">
              <div className="text-blue-600 flex-shrink-0">💡</div>
              <div className="text-blue-900">
                <strong>Dica:</strong> Para exportar imagens do nesting, use o botão de download em cada visualização de chapa.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onFechar}
            className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg hover:bg-white transition-colors font-semibold text-slate-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
