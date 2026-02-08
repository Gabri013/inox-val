import fs from 'node:fs';
import path from 'node:path';

type CellValue = string | number | boolean | null;

type CellEntry = {
  value: CellValue;
  formula?: string;
};

type SheetModel = {
  name: string;
  cells: Record<string, CellEntry>;
};

type WorkbookModel = {
  generatedAt: string;
  sheets: SheetModel[];
};

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadWorkbook(xlsxPath: string) {
  // Lazy require to avoid forcing dependency for non-extraction usage.
  const XLSX = require('xlsx');
  return XLSX.readFile(xlsxPath, { cellFormula: true, cellNF: false, cellText: false });
}

function normalizeCell(cell: any): CellEntry {
  if (!cell) return { value: null };
  const value = typeof cell.v === 'undefined' ? null : cell.v;
  const formula = typeof cell.f === 'string' ? cell.f : undefined;
  return formula ? { value, formula } : { value };
}

function buildModel(xlsxPath: string): WorkbookModel {
  const workbook = loadWorkbook(xlsxPath);
  const sheets: SheetModel[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const cells: Record<string, CellEntry> = {};
    for (const address of Object.keys(sheet)) {
      if (address.startsWith('!')) continue;
      cells[address] = normalizeCell(sheet[address]);
    }
    sheets.push({ name: sheetName, cells });
  }

  return { generatedAt: new Date().toISOString(), sheets };
}

function buildInventory(model: WorkbookModel) {
  let totalCells = 0;
  let totalFormulas = 0;
  const lines: string[] = [];
  lines.push('# Inventario Planilha');
  lines.push('');
  lines.push(`Gerado em: ${model.generatedAt}`);
  lines.push('');

  for (const sheet of model.sheets) {
    const cellEntries = Object.values(sheet.cells);
    const formulaCount = cellEntries.filter((cell) => !!cell.formula).length;
    totalCells += cellEntries.length;
    totalFormulas += formulaCount;
    lines.push(`## ${sheet.name}`);
    lines.push(`- Celulas: ${cellEntries.length}`);
    lines.push(`- Formulas: ${formulaCount}`);
    lines.push('');
  }

  lines.push('## Totais');
  lines.push(`- Celulas: ${totalCells}`);
  lines.push(`- Formulas: ${totalFormulas}`);
  lines.push('');

  return lines.join('\n');
}

function main() {
  const xlsxPath = process.argv[2] || 'data/planilha_preco.xlsx';
  if (!fs.existsSync(xlsxPath)) {
    throw new Error(`Arquivo XLSX nao encontrado: ${xlsxPath}`);
  }

  const model = buildModel(xlsxPath);
  const outputDir = path.resolve('src/domains/precificacao/embedded');
  ensureDir(outputDir);
  const docsDir = path.resolve('docs/precificacao');
  ensureDir(docsDir);

  fs.writeFileSync(path.join(outputDir, 'planilha.model.json'), JSON.stringify(model, null, 2));
  fs.writeFileSync(path.join(docsDir, 'INVENTARIO_PLANILHA.md'), buildInventory(model));
  console.log('Model e inventario gerados.');
}

main();
