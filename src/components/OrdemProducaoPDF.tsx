import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';

export interface OrdemProducaoProcessoRow {
  processo: string;
  inicio?: string;
  termino?: string;
  obs?: string;
  responsavel?: string;
  lider?: string;
}

export interface OrdemProducaoRevisaoRow {
  revisao: string;
  data?: string;
  novoPrazo?: string;
  motivo?: string;
}

export interface OrdemProducaoData {
  logoUrl?: string;
  titulo?: string;
  numero?: string;
  numeroLabel?: string;
  headerLines?: string[];
  produto?: string;
  codigo?: string;
  pedido?: string;
  cliente?: string;
  quantidade?: number;
  unidade?: string;
  dataEmissao?: string;
  prazo?: string;
  emissaoPedido?: string;
  informacao?: string;
  observacao?: string;
  observacaoLabel?: string;
  processosTitulo?: string;
  processosColumns?: string[];
  processos?: string[];
  processosRows?: OrdemProducaoProcessoRow[];
  revisoesTitulo?: string;
  revisoesColumns?: string[];
  revisoes?: OrdemProducaoRevisaoRow[];
  observacaoFinal?: string;
  observacaoFinalLabel?: string;
  rodape?: string;
  geradoEm?: string;
  geradoEmLabel?: string;
}

export interface OrdemProducaoPDFProps {
  data: OrdemProducaoData;
  fileName?: string;
  downloadLabel?: string;
  loadingLabel?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 90,
    height: 30,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  section: {
    marginBottom: 8,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#eee',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 2,
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
    textAlign: 'center',
  },
  obs: {
    minHeight: 30,
    border: '1px solid #000',
    padding: 2,
    marginBottom: 4,
  },
  small: {
    fontSize: 8,
    color: '#888',
  },
});

const DEFAULT_PROCESS_COLUMNS = ['Processo', 'Início', 'Término', 'Obs', 'Responsável', 'Líder'];
const DEFAULT_REVISAO_COLUMNS = ['Revisão', 'Data', 'Novo Prazo', 'Motivo / Justificativa'];

const joinLine = (parts: Array<string | undefined>) => parts.filter(Boolean).join('   ');

const buildHeaderLines = (data: OrdemProducaoData) => {
  if (data.headerLines && data.headerLines.length > 0) {
    return data.headerLines.filter((line) => line && line.trim());
  }

  const lines: string[] = [];

  if (data.produto) {
    lines.push(`Descrição do produto: ${data.produto}`);
  }

  const codigo = data.codigo ? `Código do Produto: ${data.codigo}` : undefined;
  const qtdParts: string[] = [];
  if (data.quantidade !== undefined) qtdParts.push(String(data.quantidade));
  if (data.unidade) qtdParts.push(data.unidade);
  const qtdValue = qtdParts.join(' ').trim();
  const qtde = qtdValue ? `Qtde: ${qtdValue}` : undefined;
  const linhaCodigo = joinLine([codigo, qtde]);
  if (linhaCodigo) lines.push(linhaCodigo);

  const linhaPrazo = joinLine([
    data.dataEmissao ? `Data da emissão: ${data.dataEmissao}` : undefined,
    data.prazo ? `Prazo: ${data.prazo}` : undefined,
  ]);
  if (linhaPrazo) lines.push(linhaPrazo);

  const linhaPedido = joinLine([
    data.pedido ? `Nº do pedido: ${data.pedido}` : undefined,
    data.cliente ? `Cliente: ${data.cliente}` : undefined,
  ]);
  if (linhaPedido) lines.push(linhaPedido);

  const linhaEmissao = joinLine([
    data.emissaoPedido ? `Emissão do pedido: ${data.emissaoPedido}` : undefined,
    data.informacao ? `Inform. Adicion.: ${data.informacao}` : undefined,
  ]);
  if (linhaEmissao) lines.push(linhaEmissao);

  return lines;
};

const buildProcessRows = (data: OrdemProducaoData) => {
  if (data.processosRows && data.processosRows.length > 0) {
    return data.processosRows;
  }

  return (data.processos || []).map((proc, idx) => ({
    processo: `${idx + 1} ${proc}`,
  }));
};

const OrdemProducaoPDFDoc = ({ data }: { data: OrdemProducaoData }) => {
  const headerLines = buildHeaderLines(data);
  const processColumns = data.processosColumns && data.processosColumns.length > 0
    ? data.processosColumns
    : DEFAULT_PROCESS_COLUMNS;
  const revisaoColumns = data.revisoesColumns && data.revisoesColumns.length > 0
    ? data.revisoesColumns
    : DEFAULT_REVISAO_COLUMNS;

  const processColumnWidth = `${(100 / processColumns.length).toFixed(2)}%`;
  const revisaoColumnWidth = `${(100 / revisaoColumns.length).toFixed(2)}%`;

  const processRows = buildProcessRows(data);
  const revisoes = data.revisoes && data.revisoes.length > 0
    ? data.revisoes
    : [{ revisao: '1', data: '', novoPrazo: '', motivo: '' }, { revisao: '2', data: '', novoPrazo: '', motivo: '' }];

  const rodape = data.rodape
    ? data.rodape
    : `${data.geradoEmLabel || 'Gerado em'} ${data.geradoEm || new Date().toLocaleString()}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {data.logoUrl && <Image src={data.logoUrl} style={styles.logo} />}
          {data.numero && (
            <Text style={{ fontSize: 10, textAlign: 'right' }}>
              {data.numeroLabel || 'Nº da Ordem de Produção'}: {data.numero}
            </Text>
          )}
        </View>

        <Text style={styles.title}>{data.titulo || 'ORDEM DE PRODUÇÃO'}</Text>

        {headerLines.length > 0 && (
          <View style={styles.section}>
            {headerLines.map((linha, idx) => (
              <Text key={`${linha}-${idx}`}>{linha}</Text>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text>{data.observacaoLabel || 'Observação'}:</Text>
          <View style={styles.obs}><Text>{data.observacao || ''}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>
            {data.processosTitulo || 'PROCESSO'}
          </Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              {processColumns.map((col, idx) => (
                <Text key={`${col}-${idx}`} style={[styles.tableColHeader, { width: processColumnWidth }]}>
                  {col}
                </Text>
              ))}
            </View>
            {processRows.map((row, idx) => {
              const values = [
                row.processo,
                row.inicio,
                row.termino,
                row.obs,
                row.responsavel,
                row.lider,
              ];
              return (
                <View style={styles.tableRow} key={`${row.processo}-${idx}`}>
                  {processColumns.map((_, colIdx) => (
                    <Text key={`proc-${idx}-${colIdx}`} style={[styles.tableCol, { width: processColumnWidth }]}>
                      {values[colIdx] || ''}
                    </Text>
                  ))}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>
            {data.revisoesTitulo || 'CONTROLE DE REVISÃO DE PRAZO O.P.'}
          </Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              {revisaoColumns.map((col, idx) => (
                <Text key={`${col}-${idx}`} style={[styles.tableColHeader, { width: revisaoColumnWidth }]}>
                  {col}
                </Text>
              ))}
            </View>
            {revisoes.map((rev, idx) => {
              const values = [rev.revisao, rev.data, rev.novoPrazo, rev.motivo];
              return (
                <View style={styles.tableRow} key={`rev-${idx}`}>
                  {revisaoColumns.map((_, colIdx) => (
                    <Text key={`rev-${idx}-${colIdx}`} style={[styles.tableCol, { width: revisaoColumnWidth }]}>
                      {values[colIdx] || ''}
                    </Text>
                  ))}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text>{data.observacaoFinalLabel || 'Observação Final'}</Text>
          <View style={styles.obs}><Text>{data.observacaoFinal || ''}</Text></View>
        </View>

        <Text style={styles.small}>{rodape}</Text>
      </Page>
    </Document>
  );
};

export default function OrdemProducaoPDF({
  data,
  fileName = 'ordem-producao.pdf',
  downloadLabel = 'Baixar Ordem de Produção (PDF)',
  loadingLabel = 'Gerando PDF...'
}: OrdemProducaoPDFProps) {
  return (
    <PDFDownloadLink document={<OrdemProducaoPDFDoc data={data} />} fileName={fileName}>
      {({ loading }) => (loading ? loadingLabel : downloadLabel)}
    </PDFDownloadLink>
  );
}
