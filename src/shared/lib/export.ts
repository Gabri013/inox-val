/**
 * Utilitários de exportação de dados (CSV e PDF)
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ResultadoCalculadora } from '@/domains/catalogo';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Configurações da empresa para branding
 */
export interface EmpresaConfig {
  nome: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  website?: string;
  logo?: string; // Base64 ou URL
}

/**
 * Configuração padrão da empresa
 * TODO: Mover para configurações do usuário/sistema
 */
const EMPRESA_DEFAULT: EmpresaConfig = {
  nome: 'Indústria de Inox LTDA',
  cnpj: '00.000.000/0001-00',
  endereco: 'Rua Industrial, 1000 - Distrito Industrial',
  telefone: '(11) 1234-5678',
  email: 'contato@industria-inox.com.br',
  website: 'www.industria-inox.com.br',
};

/**
 * Formata moeda brasileira
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata data brasileira
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

/**
 * Exporta orçamento para CSV
 */
export function exportarOrcamentoCSV(
  resultado: ResultadoCalculadora,
  empresa: EmpresaConfig = EMPRESA_DEFAULT
): void {
  const linhas: string[] = [];

  // Cabeçalho da empresa
  linhas.push(`"${empresa.nome}"`);
  if (empresa.cnpj) linhas.push(`"CNPJ: ${empresa.cnpj}"`);
  if (empresa.endereco) linhas.push(`"${empresa.endereco}"`);
  if (empresa.telefone || empresa.email) {
    linhas.push(`"${empresa.telefone || ''} | ${empresa.email || ''}"`);
  }
  linhas.push('');

  // Dados do orçamento
  linhas.push('"ORÇAMENTO"');
  linhas.push(`"Código:","${resultado.orcamento.codigo}"`);
  linhas.push(`"Data:","${formatDate(resultado.orcamento.data)}"`);
  linhas.push('');

  // Itens do orçamento
  linhas.push('"ITENS DO ORÇAMENTO"');
  linhas.push('"Item","Código","Produto","Quantidade","Valor Unit.","Valor Total"');
  
  resultado.orcamento.itens.forEach((item, idx) => {
    const produto = item.produtoPadrao;
    if (!produto) return;
    
    const valorUnit = produto.precoVenda;
    const valorTotal = valorUnit * item.quantidade;
    
    linhas.push(
      `"${idx + 1}","${produto.codigo}","${produto.nome}","${item.quantidade}","${formatCurrency(valorUnit)}","${formatCurrency(valorTotal)}"`
    );
  });
  
  linhas.push('');

  // Consumo de materiais
  linhas.push('"CONSUMO DE MATERIAIS (BOM)"');
  linhas.push('"Código","Material","Quantidade","Unidade","Custo Unit.","Custo Total"');
  
  resultado.consumoMateriais.forEach((consumo) => {
    const insumo = consumo.insumo;
    if (!insumo) return;
    
    linhas.push(
      `"${insumo.codigo}","${insumo.nome}","${consumo.quantidadeTotal.toFixed(2)}","${consumo.unidade}","${formatCurrency(consumo.custoUnitario)}","${formatCurrency(consumo.custoTotal)}"`
    );
  });
  
  linhas.push('');

  // Nesting (se houver)
  if (resultado.nestingPorChapa.length > 0) {
    linhas.push('"APROVEITAMENTO DE CHAPAS (NESTING)"');
    linhas.push('"Código","Material","Chapas Necessárias","Aproveitamento %","Perda %"');
    
    resultado.nestingPorChapa.forEach((nesting) => {
      const material = nesting.material;
      if (!material) return;
      
      linhas.push(
        `"${material.codigo}","${material.nome}","${nesting.chapasNecessarias}","${nesting.aproveitamento.toFixed(1)}%","${nesting.perdaMaterial.toFixed(1)}%"`
      );
    });
    
    linhas.push('');
  }

  // Resumo financeiro
  linhas.push('"RESUMO FINANCEIRO"');
  linhas.push(`"Total de Itens:","${resultado.resumo.totalItens}"`);
  linhas.push(`"Custo Material:","${formatCurrency(resultado.resumo.custoMaterial)}"`);
  linhas.push(`"Custo Mão de Obra:","${formatCurrency(resultado.resumo.custoMaoObra)}"`);
  linhas.push(`"Custo Total:","${formatCurrency(resultado.resumo.custoTotal)}"`);
  linhas.push(`"Margem de Lucro:","${resultado.resumo.margemLucro}%"`);
  linhas.push(`"Lucro Estimado:","${formatCurrency(resultado.resumo.lucroEstimado)}"`);
  linhas.push(`"VALOR DE VENDA:","${formatCurrency(resultado.resumo.valorVenda)}"`);

  // Gerar arquivo
  const csv = linhas.join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM para Excel
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Orcamento_${resultado.orcamento.codigo}_${format(new Date(), 'yyyyMMdd')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Exporta orçamento para PDF com layout profissional
 */
export function exportarOrcamentoPDF(
  resultado: ResultadoCalculadora,
  empresa: EmpresaConfig = EMPRESA_DEFAULT
): void {
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // ========== CABEÇALHO ==========
  
  // Logo (se houver)
  // if (empresa.logo) {
  //   doc.addImage(empresa.logo, 'PNG', margin, yPosition, 30, 30);
  // }

  // Dados da empresa
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(empresa.nome, margin, yPosition);
  yPosition += 7;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  if (empresa.cnpj) {
    doc.text(`CNPJ: ${empresa.cnpj}`, margin, yPosition);
    yPosition += 4;
  }
  
  if (empresa.endereco) {
    doc.text(empresa.endereco, margin, yPosition);
    yPosition += 4;
  }
  
  if (empresa.telefone && empresa.email) {
    doc.text(`${empresa.telefone} | ${empresa.email}`, margin, yPosition);
    yPosition += 4;
  }
  
  if (empresa.website) {
    doc.setTextColor(0, 0, 255);
    doc.text(empresa.website, margin, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 4;
  }
  
  yPosition += 5;

  // Linha separadora
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // ========== TÍTULO DO ORÇAMENTO ==========
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ORÇAMENTO', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;
  
  // Box com informações do orçamento
  doc.setFillColor(245, 247, 250);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Código:', margin + 5, yPosition + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(resultado.orcamento.codigo, margin + 25, yPosition + 7);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Data:', margin + 5, yPosition + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(resultado.orcamento.data), margin + 20, yPosition + 14);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Validade:', pageWidth - margin - 60, yPosition + 7);
  doc.setFont('helvetica', 'normal');
  doc.text('30 dias', pageWidth - margin - 30, yPosition + 7);
  
  yPosition += 25;

  // ========== ITENS DO ORÇAMENTO ==========
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Itens do Orçamento', margin, yPosition);
  yPosition += 7;
  
  const itensData = resultado.orcamento.itens.map((item, idx) => {
    const produto = item.produtoPadrao;
    if (!produto) return [];
    
    return [
      (idx + 1).toString(),
      produto.codigo,
      produto.nome,
      item.quantidade.toString(),
      formatCurrency(produto.precoVenda),
      formatCurrency(produto.precoVenda * item.quantidade),
    ];
  });
  
  autoTable(doc, {
    startY: yPosition,
    head: [['#', 'Código', 'Produto', 'Qtd', 'Valor Unit.', 'Valor Total']],
    body: itensData,
    theme: 'striped',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 25 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // ========== CONSUMO DE MATERIAIS ==========
  
  // Verificar se precisa de nova página
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = margin;
  }
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Consumo de Materiais (BOM)', margin, yPosition);
  yPosition += 7;
  
  const materiaisData = resultado.consumoMateriais.map((consumo) => {
    const insumo = consumo.insumo;
    if (!insumo) return [];
    
    return [
      insumo.codigo,
      insumo.nome,
      consumo.quantidadeTotal.toFixed(2),
      consumo.unidade,
      formatCurrency(consumo.custoUnitario),
      formatCurrency(consumo.custoTotal),
    ];
  });
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Código', 'Material', 'Qtd', 'Un', 'Custo Unit.', 'Custo Total']],
    body: materiaisData,
    theme: 'striped',
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 20, halign: 'right' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 28, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // ========== NESTING (se houver) ==========
  
  if (resultado.nestingPorChapa.length > 0) {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Aproveitamento de Chapas (Nesting)', margin, yPosition);
    yPosition += 7;
    
    const nestingData = resultado.nestingPorChapa.map((nesting) => {
      const material = nesting.material;
      if (!material) return [];
      
      return [
        material.codigo,
        material.nome,
        nesting.chapasNecessarias.toString(),
        `${nesting.aproveitamento.toFixed(1)}%`,
        `${nesting.perdaMaterial.toFixed(1)}%`,
      ];
    });
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Código', 'Material', 'Chapas', 'Aproveitamento', 'Perda']],
      body: nestingData,
      theme: 'striped',
      headStyles: {
        fillColor: [46, 204, 113],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // ========== RESUMO FINANCEIRO ==========
  
  // Garantir que o resumo esteja em uma página limpa se não houver espaço
  if (yPosition > pageHeight - 70) {
    doc.addPage();
    yPosition = margin;
  }
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Financeiro', margin, yPosition);
  yPosition += 7;
  
  // Box do resumo
  const boxHeight = 55;
  doc.setFillColor(245, 247, 250);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, boxHeight, 'F');
  
  const resumoX = margin + 5;
  let resumoY = yPosition + 8;
  const labelX = resumoX;
  const valueX = pageWidth - margin - 45;
  
  doc.setFontSize(10);
  
  // Custos
  doc.setFont('helvetica', 'normal');
  doc.text('Custo Material:', labelX, resumoY);
  doc.text(formatCurrency(resultado.resumo.custoMaterial), valueX, resumoY, { align: 'right' });
  resumoY += 7;
  
  doc.text('Custo Mão de Obra:', labelX, resumoY);
  doc.text(formatCurrency(resultado.resumo.custoMaoObra), valueX, resumoY, { align: 'right' });
  resumoY += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Custo Total:', labelX, resumoY);
  doc.text(formatCurrency(resultado.resumo.custoTotal), valueX, resumoY, { align: 'right' });
  resumoY += 10;
  
  // Margem e Lucro
  doc.setFont('helvetica', 'normal');
  doc.text(`Margem de Lucro (${resultado.resumo.margemLucro}%):`, labelX, resumoY);
  doc.text(formatCurrency(resultado.resumo.lucroEstimado), valueX, resumoY, { align: 'right' });
  resumoY += 10;
  
  // Valor final (destaque)
  doc.setFillColor(46, 204, 113);
  doc.rect(margin, resumoY - 5, pageWidth - 2 * margin, 12, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('VALOR TOTAL:', labelX, resumoY + 3);
  doc.text(formatCurrency(resultado.resumo.valorVenda), valueX, resumoY + 3, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  
  yPosition += boxHeight + 10;

  // ========== RODAPÉ ==========
  
  // Garantir que o rodapé esteja na última página
  const totalPages = doc.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Linha separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
    
    // Texto do rodapé
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(
      'Orçamento gerado automaticamente pelo sistema ERP Industrial',
      pageWidth / 2,
      pageHeight - 12,
      { align: 'center' }
    );
    
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - margin,
      pageHeight - 12,
      { align: 'right' }
    );
    
    doc.setTextColor(0, 0, 0);
  }

  // ========== SALVAR PDF ==========
  
  const fileName = `Orcamento_${resultado.orcamento.codigo}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(fileName);
}