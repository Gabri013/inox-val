/**
 * Componente de Visualização de Resultados da Calculadora Rápida
 * Mostra BOM completa, Nesting otimizado e Precificação detalhada
 */

import { ResultadoCalculadora } from '../types';
import { MODELOS_BOM } from '../../../bom/models';
import { Package, Layers, DollarSign, TrendingUp, FileText, CheckCircle } from 'lucide-react';
import { NestingVisualizer } from '../../../nesting/components/NestingVisualizer';

interface ResultadoCalculadoraProps {
  resultado: ResultadoCalculadora;
  onSalvar?: () => void;
  onNovo?: () => void;
  salvarLabel?: string;
}

export function ResultadoCalculadoraView({
  resultado,
  onSalvar,
  onNovo,
  salvarLabel = 'Salvar Orçamento',
}: ResultadoCalculadoraProps) {
  const { bomResult, nesting, precificacao, entrada } = resultado;
  
  const modeloInfo = MODELOS_BOM.find(m => m.value === entrada.modelo);

  return (
    <div className="space-y-6">
      {/* CABEÇALHO COM RESUMO RÁPIDO */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Orçamento Calculado</h2>
            <p className="text-green-100">
              {modeloInfo?.label || entrada.modelo}
            </p>
            <p className="text-sm text-green-100 mt-1">
              L{entrada.config.l} × C{entrada.config.c} × A{entrada.config.h} mm • {entrada.config.material}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-100 mb-1">Preço Final</div>
            <div className="text-4xl font-bold">
              R$ {precificacao.precoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-green-100 mt-1">
              Custo: R${' '}
              {precificacao.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • Margem:{' '}
              {entrada.precificacao.margemLucro}%
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="flex gap-3 mt-6 flex-wrap">
          {onSalvar && (
            <button
              onClick={onSalvar}
              className="px-6 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
            >
              {salvarLabel}
            </button>
          )}
          {onNovo && (
            <button
              onClick={onNovo}
              className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
            >
              Novo Cálculo
            </button>
          )}
          <button className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
            Exportar PDF
          </button>
        </div>
      </div>

      {/* GRID DE INDICADORES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm text-neutral-600">Itens BOM</div>
          </div>
          <div className="text-2xl font-bold">{bomResult.bom.length}</div>
          <div className="text-xs text-neutral-500 mt-1">
            {bomResult.totais.numComponentes} componentes
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-sm text-neutral-600">Nesting</div>
          </div>
          <div className="text-2xl font-bold">{nesting.melhorOpcao.quantidadeChapas}</div>
          <div className="text-xs text-neutral-500 mt-1">
            {nesting.melhorOpcao.chapa.nome}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-sm text-neutral-600">Aproveitamento</div>
          </div>
          <div className="text-2xl font-bold">{nesting.melhorOpcao.aproveitamento}%</div>
          <div className="text-xs text-neutral-500 mt-1">
            Sobra: {nesting.melhorOpcao.sobra}%
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-sm text-neutral-600">Peso Total</div>
          </div>
          <div className="text-2xl font-bold">{bomResult.totais.pesoTotal.toFixed(1)} kg</div>
          <div className="text-xs text-neutral-500 mt-1">
            {bomResult.totais.areaChapas.toFixed(2)} m²
          </div>
        </div>
      </div>

      {/* ETAPA 1: BOM DETALHADA */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">BOM - Bill of Materials</h3>
            <p className="text-sm text-neutral-600">Lista completa de materiais gerada pelo modelo</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">Item</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">Descrição</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-neutral-700">Qtd</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">Dimensões</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">Material</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-700">Peso (kg)</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-700">Custo (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {bomResult.bom.map((item, idx) => (
                <tr key={idx} className="hover:bg-neutral-50">
                  <td className="py-3 px-4 text-sm text-neutral-600">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-neutral-900">{item.desc}</div>
                    {item.obs && <div className="text-xs text-neutral-500 mt-0.5">{item.obs}</div>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2 py-1 bg-neutral-100 rounded text-sm font-medium">
                      {item.qtd} {item.unidade}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-600">
                    {item.w && item.h ? (
                      <span>{item.w}×{item.h} mm</span>
                    ) : item.h ? (
                      <span>{item.h} mm</span>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-neutral-700">{item.material || '—'}</div>
                    {item.processo && <div className="text-xs text-neutral-500">{item.processo}</div>}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-neutral-700">
                    {item.pesoTotal ? item.pesoTotal.toFixed(2) : '—'}
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-medium text-neutral-900">
                    {item.custoTotal ? item.custoTotal.toFixed(2) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-neutral-50 border-t-2 border-neutral-300">
              <tr>
                <td colSpan={5} className="py-3 px-4 text-right font-semibold">TOTAL</td>
                <td className="py-3 px-4 text-right font-bold">{bomResult.totais.pesoTotal.toFixed(2)} kg</td>
                <td className="py-3 px-4 text-right font-bold text-lg">R$ {bomResult.totais.custoMaterial.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ETAPA 2: NESTING */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Nesting - Otimização de Chapas</h3>
            <p className="text-sm text-neutral-600">Cálculo de aproveitamento e desperdício</p>
          </div>
        </div>

        {/* Melhor Opção Destacada */}
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-900">Melhor Opção</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            <div>
              <div className="text-xs text-neutral-600 mb-1">Chapa</div>
              <div className="font-medium">{nesting.melhorOpcao.chapa.nome}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-600 mb-1">Quantidade</div>
              <div className="font-medium">{nesting.melhorOpcao.quantidadeChapas} unidades</div>
            </div>
            <div>
              <div className="text-xs text-neutral-600 mb-1">Aproveitamento</div>
              <div className="font-medium text-green-600">{nesting.melhorOpcao.aproveitamento}%</div>
            </div>
            <div>
              <div className="text-xs text-neutral-600 mb-1">Área Total</div>
              <div className="font-medium">{nesting.melhorOpcao.areaTotal} m²</div>
            </div>
          </div>
        </div>

        {/* Comparação de Opções */}
        <div>
          <h4 className="font-medium mb-3">Comparação de Chapas Disponíveis</h4>
          <div className="space-y-2">
            {nesting.opcoes.map((opcao, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  opcao.chapa.id === nesting.melhorOpcao.chapa.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{opcao.chapa.nome}</div>
                    <div className="text-sm text-neutral-600 mt-1">
                      {opcao.quantidadeChapas} chapas • {opcao.areaTotal} m² total
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{opcao.aproveitamento}%</div>
                    <div className="text-xs text-neutral-500">aproveitamento</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Visualização 2D do Nesting (melhor opção) */}
        {(nesting.melhorOpcao.itensAlocados as any)?.length > 0 && (
          <div className="mt-6">
            <NestingVisualizer
              resultado={nesting.melhorOpcao as any}
              larguraChapa={nesting.melhorOpcao.chapa.largura}
              alturaChapa={nesting.melhorOpcao.chapa.comprimento}
              nomeChapa={nesting.melhorOpcao.chapa.nome}
            />
          </div>
        )}
      </div>

      {/* ETAPA 3: PRECIFICAÇÃO */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-500 rounded-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Precificação Detalhada</h3>
            <p className="text-sm text-neutral-600">Breakdown completo de custos</p>
          </div>
        </div>

        {/* Custos de Material */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">{precificacao.custosMaterial.categoria}</h4>
          <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
            {precificacao.custosMaterial.itens.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-neutral-700">{item.descricao}</span>
                  <span className="text-neutral-500 ml-2">
                    ({item.quantidade} {item.unidade})
                  </span>
                </div>
                <div className="font-medium">R$ {item.subtotal.toFixed(2)}</div>
              </div>
            ))}
            {precificacao.custosMaterial.itens.length > 5 && (
              <div className="text-xs text-neutral-500 text-center pt-2">
                ... e mais {precificacao.custosMaterial.itens.length - 5} itens
              </div>
            )}
            <div className="border-t border-neutral-200 pt-2 mt-2 flex justify-between font-medium">
              <span>Subtotal Material</span>
              <span>R$ {precificacao.subtotalMaterial.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Resumo Final */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-neutral-200">
            <span className="text-neutral-700">Subtotal Material</span>
            <span className="font-medium">R$ {precificacao.subtotalMaterial.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-neutral-200">
            <span className="text-neutral-700">
              Perda de Material ({entrada.precificacao.perdaMaterial}%)
            </span>
            <span className="font-medium text-orange-600">+ R$ {precificacao.perdaMaterial.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-neutral-200">
            <span className="text-neutral-700">Total com Perda</span>
            <span className="font-medium">R$ {precificacao.totalComPerda.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-neutral-200">
            <span className="text-neutral-700">Mão de Obra</span>
            <span className="font-medium">+ R$ {precificacao.custoMaoObra.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b-2 border-neutral-300">
            <span className="font-semibold">Custo Total</span>
            <span className="font-bold text-lg">R$ {precificacao.custoTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-neutral-200">
            <span className="text-neutral-700">
              Margem de Lucro ({entrada.precificacao.margemLucro}%)
            </span>
            <span className="font-medium text-green-600">+ R$ {precificacao.margemLucro.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-3 bg-green-50 rounded-lg px-4 border-2 border-green-500">
            <span className="font-bold text-lg">PREÇO FINAL</span>
            <span className="font-bold text-2xl text-green-600">
              R$ {precificacao.precoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Breakdown Gráfico */}
        <div className="mt-6">
          <h4 className="font-medium mb-3">Composição do Preço</h4>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Material</span>
                <span className="font-medium">{precificacao.breakdown.percentualMaterial}%</span>
              </div>
              <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${precificacao.breakdown.percentualMaterial}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Mão de Obra</span>
                <span className="font-medium">{precificacao.breakdown.percentualMaoObra}%</span>
              </div>
              <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${precificacao.breakdown.percentualMaoObra}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Margem de Lucro</span>
                <span className="font-medium">{precificacao.breakdown.percentualMargem}%</span>
              </div>
              <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${precificacao.breakdown.percentualMargem}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
