// Integração com planilhas Excel para importar custos reais
// Requer instalação do pacote 'xlsx' (SheetJS)
// npm install xlsx

import XLSX from 'xlsx';

export function importarCustosExcel({
  filePath,
  colCodigo = 'Codigo',
  colDescricao = 'Descricao',
  colCusto = 'Custo',
}: {
  filePath: string;
  colCodigo?: string;
  colDescricao?: string;
  colCusto?: string;
}) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);
  const custos: Record<string, { descricao: string; custo: number }> = {};
  for (const row of data as any[]) {
    const codigo = row[colCodigo];
    const descricao = row[colDescricao];
    const custo = row[colCusto] ? Number(row[colCusto]) : 0;
    if (codigo) {
      custos[codigo] = { descricao, custo };
    }
  }
  return custos;
}

// Exemplo de uso:
// const custos = importarCustosExcel({ filePath: 'data/planilha_preco.xlsx', colCodigo: 'Codigo', colDescricao: 'Descricao', colCusto: 'Custo' });
// Os custos podem ser usados para atualizar o sistema de precificação.
