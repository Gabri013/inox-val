import fs from 'fs';
import path from 'path';

// Função para importar custos dos arquivos CSV
export function importarCustosCSV({
  csvPath,
  colCodigo = 'Codigo',
  colDescricao = 'Descricao',
  colCusto = 'Custo',
}: {
  csvPath: string;
  colCodigo?: string;
  colDescricao?: string;
  colCusto?: string;
}) {
  const raw = fs.readFileSync(csvPath, 'utf-8');
  const lines = raw.split('\n');
  const header = lines[0].replace(/"/g, '').split(',');
  const idxCodigo = header.indexOf(colCodigo);
  const idxDescricao = header.indexOf(colDescricao);
  const idxCusto = header.indexOf(colCusto);
  const custos: Record<string, { descricao: string; custo: number }> = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].replace(/"/g, '').split(',');
    if (cols.length < Math.max(idxCodigo, idxDescricao, idxCusto)) continue;
    const codigo = cols[idxCodigo];
    const descricao = cols[idxDescricao];
    const custo = idxCusto >= 0 ? Number(cols[idxCusto]) : 0;
    if (codigo) {
      custos[codigo] = { descricao, custo };
    }
  }
  return custos;
}

// Exemplo de uso:
// const custos = importarCustosCSV({ csvPath: 'caminho/levantamento_ordens_2022.csv', colCodigo: 'Codigo', colDescricao: 'Descricao', colCusto: 'Custo' });
// Os custos podem ser usados para atualizar o sistema de precificação.
