import fs from 'node:fs';
import path from 'node:path';

type CellEntry = { value: any; formula?: string };
type SheetData = Record<string, CellEntry>;

function loadWorkbook(xlsxPath: string) {
  const XLSX = require('xlsx');
  return XLSX.readFile(xlsxPath, { cellFormula: true, cellNF: false, cellText: false });
}

function loadModel(modelPath: string) {
  return JSON.parse(fs.readFileSync(modelPath, 'utf8')) as {
    sheets: { name: string; cells: SheetData }[];
  };
}

function flattenSheet(sheet: any): Record<string, any> {
  const out: Record<string, any> = {};
  Object.keys(sheet).forEach((cell) => {
    if (cell.startsWith('!')) return;
    out[cell] = sheet[cell].v ?? null;
  });
  return out;
}

function compareSheets(model: SheetData, actual: Record<string, any>) {
  const divergences: string[] = [];
  Object.entries(model).forEach(([cell, entry]) => {
    const expected = entry.value ?? null;
    const got = actual[cell] ?? null;
    if (expected === null && got === null) return;
    if (typeof expected === 'number' || typeof got === 'number') {
      const e = Number(expected ?? 0);
      const g = Number(got ?? 0);
      const delta = Math.abs(e - g);
      if (delta > 0.0001) {
        divergences.push(`${cell}: expected ${expected} got ${got}`);
      }
      return;
    }
    if (expected !== got) {
      divergences.push(`${cell}: expected ${expected} got ${got}`);
    }
  });
  return divergences;
}

function main() {
  const xlsxPath = process.argv[2] || 'data/planilha_preco.xlsx';
  const modelPath = process.argv[3] || 'src/domains/precificacao/embedded/planilha.model.json';
  if (!fs.existsSync(xlsxPath) || !fs.existsSync(modelPath)) {
    throw new Error('Arquivos de entrada nao encontrados.');
  }

  const workbook = loadWorkbook(xlsxPath);
  const model = loadModel(modelPath);
  const divergences: string[] = [];

  model.sheets.forEach((sheetModel) => {
    const sheet = workbook.Sheets[sheetModel.name];
    if (!sheet) {
      divergences.push(`Sheet ausente: ${sheetModel.name}`);
      return;
    }
    const actual = flattenSheet(sheet);
    divergences.push(...compareSheets(sheetModel.cells, actual).map((d) => `${sheetModel.name} ${d}`));
  });

  const outPath = path.resolve('docs/precificacao/DIVERGENCIAS.md');
  if (divergences.length) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, divergences.join('\n'));
    console.error('Divergencias encontradas. Ver docs/precificacao/DIVERGENCIAS.md');
    process.exit(1);
  }

  console.log('Equivalencia OK.');
}

main();
