/**
 * ============================================================================
 * GERADOR DE PDF DE PROPOSTA COMERCIAL
 * ============================================================================
 * 
 * Gera PDF profissional com:
 * - Cabeçalho com logo e dados da empresa
 * - Dados do cliente e vendedor
 * - Tabela de itens com descrição, quantidade, valor
 * - Breakdown de custos (opcional)
 * - Totais, impostos, condições
 * - Observações e validade
 * ============================================================================
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Orcamento } from '@/app/types/workflow';
import type { ConfiguracaoCustos } from './custos-config.types';
import { custosService } from './custos.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Opções para geração do PDF
 */
export interface OpcoesPDF {
  mostrarBreakdownCustos?: boolean; // Mostrar detalhamento de custos (interno)
  mostrarObservacoes?: boolean;
  mostrarCondicoesPagamento?: boolean;
  vendedor?: string;
  vendedorEmail?: string;
  vendedorTelefone?: string;
}

/**
 * Formatar moeda brasileira
 */
function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

/**
 * Adicionar cabeçalho do PDF
 */
function adicionarCabecalho(doc: jsPDF, config: ConfiguracaoCustos) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Logo (se existir)
  if (config.empresa.logo) {
    try {
      doc.addImage(config.empresa.logo, 'PNG', 15, 15, 40, 20);
    } catch (e) {
      // Ignorar se logo não carregar
    }
  }
  
  // Dados da empresa (lado direito)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(config.empresa.razaoSocial, pageWidth - 15, 20, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(config.empresa.endereco, pageWidth - 15, 25, { align: 'right' });
  doc.text(`Tel: ${config.empresa.telefone} | E-mail: ${config.empresa.email}`, pageWidth - 15, 30, { align: 'right' });
  
  if (config.empresa.cnpj) {
    doc.text(`CNPJ: ${config.empresa.cnpj}`, pageWidth - 15, 35, { align: 'right' });
  }
  
  if (config.empresa.site) {
    doc.text(config.empresa.site, pageWidth - 15, 40, { align: 'right' });
  }
}

/**
 * Adicionar título da proposta
 */
function adicionarTitulo(doc: jsPDF, orcamento: Orcamento, y: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PROPOSTA COMERCIAL', pageWidth / 2, y, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nº ${orcamento.numero}`, pageWidth / 2, y + 7, { align: 'center' });
  
  return y + 15;
}

/**
 * Adicionar dados do cliente
 */
function adicionarDadosCliente(doc: jsPDF, orcamento: Orcamento, opcoes: OpcoesPDF, y: number): number {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', 15, y);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  y += 6;
  doc.text(`Cliente: ${orcamento.clienteNome}`, 15, y);
  
  if ((orcamento as any).dataEmissao) {
    y += 5;
    const dataFormatada = format(new Date((orcamento as any).dataEmissao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    doc.text(`Data: ${dataFormatada}`, 15, y);
  }
  
  // Vendedor (se informado)
  if (opcoes.vendedor) {
    y += 5;
    doc.text(`Vendedor: ${opcoes.vendedor}`, 15, y);
    
    if (opcoes.vendedorEmail) {
      y += 5;
      doc.text(`E-mail: ${opcoes.vendedorEmail}`, 15, y);
    }
    
    if (opcoes.vendedorTelefone) {
      y += 5;
      doc.text(`Telefone: ${opcoes.vendedorTelefone}`, 15, y);
    }
  }
  
  return y + 10;
}

/**
 * Adicionar tabela de itens
 */
function adicionarTabelaItens(doc: jsPDF, orcamento: Orcamento, y: number): number {
  const dados = orcamento.itens.map((item, index) => [
    (index + 1).toString(),
    item.descricao,
    item.quantidade.toString(),
    (item as any).unidade || 'un',
    formatarMoeda(item.precoUnitario),
    formatarMoeda(item.subtotal),
  ]);
  
  autoTable(doc, {
    startY: y,
    head: [['Item', 'Descrição', 'Qtd', 'Un', 'Valor Unit.', 'Subtotal']],
    body: dados,
    theme: 'striped',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'left', cellWidth: 80 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'right', cellWidth: 30 },
      5: { halign: 'right', cellWidth: 30 },
    },
    margin: { left: 15, right: 15 },
  });
  
  return (doc as any).lastAutoTable.finalY + 5;
}

/**
 * Adicionar totais
 */
function adicionarTotais(doc: jsPDF, orcamento: Orcamento, config: ConfiguracaoCustos, y: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const xLabel = pageWidth - 80;
  const xValue = pageWidth - 15;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Subtotal
  doc.text('Subtotal:', xLabel, y);
  doc.text(formatarMoeda(orcamento.total), xValue, y, { align: 'right' });
  
  // Impostos
  y += 6;
  const aliquotaImposto = config.impostos.regime === 'SIMPLES_NACIONAL' 
    ? config.impostos.aliquotaSimples || 0
    : 0;
  
  if (aliquotaImposto > 0) {
    doc.text(`Impostos (${aliquotaImposto.toFixed(2)}%):`, xLabel, y);
    const valorImposto = orcamento.total * (aliquotaImposto / 100);
    doc.text(formatarMoeda(valorImposto), xValue, y, { align: 'right' });
    y += 6;
  }
  
  // Total final
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('VALOR TOTAL:', xLabel, y);
  doc.text(formatarMoeda(orcamento.total), xValue, y, { align: 'right' });
  
  return y + 10;
}

/**
 * Adicionar condições de pagamento
 */
function adicionarCondicoesPagamento(doc: jsPDF, config: ConfiguracaoCustos, y: number): number {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDIÇÕES DE PAGAMENTO:', 15, y);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  y += 6;
  
  config.condicoesPagamento.forEach((condicao) => {
    doc.text(`• ${condicao}`, 20, y);
    y += 5;
  });
  
  return y + 5;
}

/**
 * Adicionar observações
 */
function adicionarObservacoes(doc: jsPDF, config: ConfiguracaoCustos, y: number): number {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('OBSERVAÇÕES:', 15, y);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  y += 6;
  
  const linhas = config.observacoesPadrao.split('\n');
  linhas.forEach(linha => {
    doc.text(linha, 15, y);
    y += 4;
  });
  
  return y + 5;
}

/**
 * Adicionar rodapé com validade
 */
function adicionarRodape(doc: jsPDF, config: ConfiguracaoCustos, y: number) {
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `Proposta válida por ${config.validadeProposta} dias. Prazo de entrega: ${config.prazoEntregaPadrao} dias úteis após confirmação.`,
    15,
    y
  );
}

/**
 * Gerar PDF da proposta
 */
export function gerarPDFProposta(
  orcamento: Orcamento,
  opcoes: OpcoesPDF = {}
): jsPDF {
  const config = custosService.obterConfiguracao();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  let y = 15;
  
  // Cabeçalho
  adicionarCabecalho(doc, config);
  y = 50;
  
  // Título
  y = adicionarTitulo(doc, orcamento, y);
  
  // Dados do cliente
  y = adicionarDadosCliente(doc, orcamento, opcoes, y);
  
  // Tabela de itens
  y = adicionarTabelaItens(doc, orcamento, y);
  
  // Totais
  y = adicionarTotais(doc, orcamento, config, y);
  
  // Condições de pagamento
  if (opcoes.mostrarCondicoesPagamento !== false) {
    y = adicionarCondicoesPagamento(doc, config, y);
  }
  
  // Observações
  if (opcoes.mostrarObservacoes !== false) {
    y = adicionarObservacoes(doc, config, y);
  }
  
  // Rodapé
  const pageHeight = doc.internal.pageSize.getHeight();
  adicionarRodape(doc, config, pageHeight - 15);
  
  return doc;
}

/**
 * Baixar PDF
 */
export function baixarPDFProposta(
  orcamento: Orcamento,
  opcoes: OpcoesPDF = {}
): void {
  const doc = gerarPDFProposta(orcamento, opcoes);
  doc.save(`Proposta_${orcamento.numero}_${orcamento.clienteNome}.pdf`);
}

/**
 * Visualizar PDF (abre em nova aba)
 */
export function visualizarPDFProposta(
  orcamento: Orcamento,
  opcoes: OpcoesPDF = {}
): void {
  const doc = gerarPDFProposta(orcamento, opcoes);
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
}

export const pdfService = {
  gerarPDFProposta,
  baixarPDFProposta,
  visualizarPDFProposta,
};
