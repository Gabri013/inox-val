/**
 * SISTEMA DE EXPORTAÇÃO
 * PDF, Excel/CSV e PNG
 */

import type { Resultado } from "../domain/mesas/types";
import type { ResultadoNesting } from "./nestingProfissional";
import type { Orcamento } from "../types/projeto";
import { formatarMoeda, formatarTempo } from "./orcamento";

// ========== EXPORTAR CSV (BOM) ==========

export function exportarBOMparaCSV(bom: Resultado["bom"]): void {
  if (!bom || bom.length === 0) {
    alert("Nenhuma BOM para exportar!");
    return;
  }

  const headers = ["Item", "Descrição", "Quantidade", "Material", "Espessura (mm)", "Dimensões", "Observações"];

  const rows = bom.map((item, index) => {
    let dimensoes = "";

    if (item.w && item.h) {
      dimensoes = `${item.w}×${item.h}mm`;
    } else if (item.diametro && item.comprimento) {
      dimensoes = `Ø${item.diametro}×${item.comprimento}mm`;
    } else if (item.comprimento) {
      dimensoes = `${item.comprimento}mm`;
    }

    return [
      index + 1,
      item.desc,
      item.qtd,
      item.material || "AISI304",
      item.esp || "-",
      dimensoes,
      item.acabamento || "-",
    ];
  });

  const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

  downloadFile(csvContent, "BOM_Mesa_Inox.csv", "text/csv");
}

// ========== EXPORTAR EXCEL (via HTML Table) ==========

export function exportarBOMparaExcel(bom: Resultado["bom"]): void {
  if (!bom || bom.length === 0) {
    alert("Nenhuma BOM para exportar!");
    return;
  }

  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8">
      <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid black; padding: 8px; text-align: left; }
        th { background-color: #0ea5e9; color: white; font-weight: bold; }
      </style>
    </head>
    <body>
      <h2>Bill of Materials - Mesa Inox</h2>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Descrição</th>
            <th>Qtd</th>
            <th>Material</th>
            <th>Espessura</th>
            <th>Dimensões</th>
            <th>Acabamento</th>
          </tr>
        </thead>
        <tbody>
  `;

  bom.forEach((item, index) => {
    let dimensoes = "";

    if (item.w && item.h) {
      dimensoes = `${item.w}×${item.h}mm`;
    } else if (item.diametro && item.comprimento) {
      dimensoes = `Ø${item.diametro}×${item.comprimento}mm`;
    } else if (item.comprimento) {
      dimensoes = `${item.comprimento}mm`;
    }

    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${item.desc}</td>
        <td>${item.qtd}</td>
        <td>${item.material || "AISI304"}</td>
        <td>${item.esp ? item.esp + "mm" : "-"}</td>
        <td>${dimensoes}</td>
        <td>${item.acabamento || "-"}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  downloadFile(html, "BOM_Mesa_Inox.xls", "application/vnd.ms-excel");
}

// ========== EXPORTAR PDF (simplificado via print) ==========

export function exportarRelatorioCompleto(
  configuracao: any,
  bom: Resultado,
  nesting?: ResultadoNesting,
  orcamento?: Orcamento
): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Por favor, permita pop-ups para exportar PDF");
    return;
  }

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Relatório - Mesa Inox</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
        h1 { color: #0ea5e9; margin-bottom: 10px; }
        h2 { color: #334155; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
        h3 { color: #475569; margin-top: 20px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 12px; }
        th { background-color: #0ea5e9; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .info-box { border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; }
        .info-label { font-size: 11px; color: #64748b; margin-bottom: 5px; }
        .info-value { font-size: 16px; font-weight: bold; color: #1e293b; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .date { color: #64748b; font-size: 12px; }
        .total-box { background: #f0fdf4; border: 2px solid #22c55e; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .total-label { font-size: 14px; color: #166534; margin-bottom: 5px; }
        .total-value { font-size: 32px; font-weight: bold; color: #15803d; }
        @media print {
          body { padding: 20px; }
          h2 { page-break-before: always; }
          h2:first-of-type { page-break-before: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>Relatório Técnico - Bancada Inox</h1>
          <p class="date">Gerado em: ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}</p>
        </div>
      </div>

      <h2>1. Configuração da Mesa</h2>
      <div class="info-grid">
        <div class="info-box">
          <div class="info-label">Tipo de Mesa</div>
          <div class="info-value">
            ${
              configuracao.familia === "CENTRO"
                ? "Mesa de Centro"
                : configuracao.familia === "ENCOSTO"
                ? "Mesa com Encosto"
                : "Mesa Vincada"
            }
          </div>
        </div>
        <div class="info-box">
          <div class="info-label">Dimensões (C×L×H)</div>
          <div class="info-value">${configuracao.C}×${configuracao.L}×${configuracao.H}mm</div>
        </div>
        <div class="info-box">
          <div class="info-label">Estrutura</div>
          <div class="info-value">${configuracao.estrutura === "CONTRAVENTADA" ? "Contraventada" : "Com Prateleira"}</div>
        </div>
        <div class="info-box">
          <div class="info-label">Número de Pés</div>
          <div class="info-value">${bom.ok ? bom.meta.numPes : "-"}</div>
        </div>
      </div>

      <h2>2. Bill of Materials (BOM)</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Descrição</th>
            <th>Qtd</th>
            <th>Material</th>
            <th>Espessura</th>
            <th>Dimensões</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (bom.ok) {
    bom.bom.forEach((item, index) => {
      let dimensoes = "";

      if (item.w && item.h) {
        dimensoes = `${item.w}×${item.h}mm`;
      } else if (item.diametro && item.comprimento) {
        dimensoes = `Ø${item.diametro}×${item.comprimento}mm`;
      } else if (item.comprimento) {
        dimensoes = `${item.comprimento}mm`;
      }

      html += `
        <tr>
          <td>${index + 1}</td>
          <td>${item.desc}</td>
          <td>${item.qtd}</td>
          <td>${item.material || "AISI304"}</td>
          <td>${item.esp ? item.esp + "mm" : "-"}</td>
          <td>${dimensoes}</td>
        </tr>
      `;
    });
  }

  html += `
        </tbody>
      </table>
  `;

  // Nesting
  if (nesting?.resumo) {
    html += `
      <h2>3. Otimização de Material (Nesting)</h2>
      <div class="info-grid">
        <div class="info-box">
          <div class="info-label">Eficiência Média</div>
          <div class="info-value" style="color: #22c55e;">${nesting.resumo.eficienciaMedia.toFixed(1)}%</div>
        </div>
        <div class="info-box">
          <div class="info-label">Total de Chapas</div>
          <div class="info-value">${nesting.resumo.totalChapas}</div>
        </div>
        <div class="info-box">
          <div class="info-label">Área Total</div>
          <div class="info-value">${nesting.resumo.areaTotal_m2.toFixed(2)}m²</div>
        </div>
        <div class="info-box">
          <div class="info-label">Peso Total</div>
          <div class="info-value">${nesting.resumo.pesoTotal_kg.toFixed(1)}kg</div>
        </div>
      </div>
    `;
  }

  // Orçamento
  if (orcamento) {
    const custo = orcamento.custoDetalhado;
    const tempoTotal =
      custo.maoDeObra.corte.tempo_min +
      custo.maoDeObra.solda.tempo_min +
      custo.maoDeObra.polimento.tempo_min +
      custo.maoDeObra.dobra.tempo_min;

    html += `
      <h2>4. Orçamento</h2>
      
      <h3>4.1. Custo de Material</h3>
      <table>
        <tr><td>Chapas de Inox</td><td style="text-align: right;">${formatarMoeda(custo.material.chapas)}</td></tr>
        <tr><td>Tubos e Perfis</td><td style="text-align: right;">${formatarMoeda(custo.material.tubos)}</td></tr>
        <tr><td>Outros Componentes</td><td style="text-align: right;">${formatarMoeda(custo.material.outros)}</td></tr>
        <tr style="font-weight: bold; background: #f1f5f9;">
          <td>Subtotal Material</td>
          <td style="text-align: right; color: #0ea5e9;">${formatarMoeda(custo.material.total)}</td>
        </tr>
      </table>

      <h3>4.2. Custo de Mão de Obra</h3>
      <table>
        ${custo.maoDeObra.corte.tempo_min > 0 ? `<tr><td>Corte (${formatarTempo(custo.maoDeObra.corte.tempo_min)})</td><td style="text-align: right;">${formatarMoeda(custo.maoDeObra.corte.custo)}</td></tr>` : ""}
        ${custo.maoDeObra.solda.tempo_min > 0 ? `<tr><td>Solda (${formatarTempo(custo.maoDeObra.solda.tempo_min)})</td><td style="text-align: right;">${formatarMoeda(custo.maoDeObra.solda.custo)}</td></tr>` : ""}
        ${custo.maoDeObra.polimento.tempo_min > 0 ? `<tr><td>Polimento (${formatarTempo(custo.maoDeObra.polimento.tempo_min)})</td><td style="text-align: right;">${formatarMoeda(custo.maoDeObra.polimento.custo)}</td></tr>` : ""}
        ${custo.maoDeObra.dobra.tempo_min > 0 ? `<tr><td>Dobra/Vincagem (${formatarTempo(custo.maoDeObra.dobra.tempo_min)})</td><td style="text-align: right;">${formatarMoeda(custo.maoDeObra.dobra.custo)}</td></tr>` : ""}
        <tr style="font-weight: bold; background: #f1f5f9;">
          <td>Subtotal M.O. (${formatarTempo(tempoTotal)})</td>
          <td style="text-align: right; color: #a855f7;">${formatarMoeda(custo.maoDeObra.total)}</td>
        </tr>
      </table>

      <h3>4.3. Composição Final</h3>
      <table>
        <tr><td>Subtotal (Material + M.O.)</td><td style="text-align: right;">${formatarMoeda(custo.subtotal)}</td></tr>
        <tr><td>Margem de Lucro (${custo.margem.percentual}%)</td><td style="text-align: right; color: #22c55e;">+ ${formatarMoeda(custo.margem.valor)}</td></tr>
        ${custo.custoFixo > 0 ? `<tr><td>Custo Fixo</td><td style="text-align: right;">+ ${formatarMoeda(custo.custoFixo)}</td></tr>` : ""}
      </table>

      <div class="total-box">
        <div class="total-label">VALOR TOTAL DO PROJETO</div>
        <div class="total-value">${formatarMoeda(custo.total)}</div>
      </div>
    `;
  }

  html += `
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.print();
  }, 500);
}

// ========== EXPORTAR PNG (Nesting) ==========

export function exportarNestingParaPNG(svgElement: SVGSVGElement, nomeArquivo: string = "nesting.png"): void {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    alert("Erro ao criar canvas");
    return;
  }

  const img = new Image();
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    canvas.width = img.width * 2; // 2x para melhor qualidade
    canvas.height = img.height * 2;
    ctx.scale(2, 2);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = nomeArquivo;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  img.src = url;
}

// ========== HELPER ==========

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
