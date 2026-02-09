import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';

export interface OrdemProducaoData {
  logoUrl?: string;
  titulo?: string;
  numero: string;
  produto: string;
  codigo: string;
  pedido: string;
  cliente: string;
  quantidade: number;
  unidade: string;
  dataEmissao: string;
  prazo: string;
  emissaoPedido: string;
  informacao?: string;
  observacao?: string;
  processos: string[];
  revisoes?: Array<{ revisao: string; data: string; novoPrazo: string; motivo: string }>;
  observacaoFinal?: string;
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
    width: '12%',
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
    width: '12%',
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

const OrdemProducaoPDFDoc = ({ data }: { data: OrdemProducaoData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        {data.logoUrl && <Image src={data.logoUrl} style={styles.logo} />}
        <Text style={{ fontSize: 10, textAlign: 'right' }}>Nº da Ordem de Produção: {data.numero}</Text>
      </View>
      <Text style={styles.title}>{data.titulo || 'ORDEM DE PRODUÇÃO'}</Text>
      <View style={styles.section}>
        <Text>Descrição do produto: {data.produto}</Text>
        <Text>Código do Produto: {data.codigo}   Qtde: {data.quantidade} {data.unidade}</Text>
        <Text>Data da emissão: {data.dataEmissao}   Prazo: {data.prazo}</Text>
        <Text>Nº do pedido: {data.pedido}   Cliente: {data.cliente}</Text>
        <Text>Emissão do pedido: {data.emissaoPedido}   Inform. Adicion: {data.informacao || ''}</Text>
      </View>
      <View style={styles.section}>
        <Text>Observação:</Text>
        <View style={styles.obs}><Text>{data.observacao || ''}</Text></View>
      </View>
      <View style={styles.section}>
        <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>PROCESSO</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColHeader}>PROCESSO</Text>
            <Text style={styles.tableColHeader}>INÍCIO</Text>
            <Text style={styles.tableColHeader}>TÉRMINO</Text>
            <Text style={styles.tableColHeader}>OBS</Text>
            <Text style={styles.tableColHeader}>RESPONSÁVEL</Text>
            <Text style={styles.tableColHeader}>LÍDER</Text>
          </View>
          {data.processos.map((proc, idx) => (
            <View style={styles.tableRow} key={proc}>
              <Text style={styles.tableCol}>{idx + 1} {proc}</Text>
              <Text style={styles.tableCol}></Text>
              <Text style={styles.tableCol}></Text>
              <Text style={styles.tableCol}></Text>
              <Text style={styles.tableCol}></Text>
              <Text style={styles.tableCol}></Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>CONTROLE DE REVISÃO DE PRAZO O.P.</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColHeader}>REVISÃO</Text>
            <Text style={styles.tableColHeader}>DATA</Text>
            <Text style={styles.tableColHeader}>NOVO PRAZO</Text>
            <Text style={styles.tableColHeader}>MOTIVO / JUSTIFICATIVA</Text>
          </View>
          {(data.revisoes && data.revisoes.length > 0
            ? data.revisoes
            : [{ revisao: '1', data: '', novoPrazo: '', motivo: '' }, { revisao: '2', data: '', novoPrazo: '', motivo: '' }]
          ).map((rev, idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={styles.tableCol}>{rev.revisao}</Text>
              <Text style={styles.tableCol}>{rev.data}</Text>
              <Text style={styles.tableCol}>{rev.novoPrazo}</Text>
              <Text style={styles.tableCol}>{rev.motivo}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text>OBSERVAÇÃO</Text>
        <View style={styles.obs}><Text>{data.observacaoFinal || ''}</Text></View>
      </View>
      <Text style={styles.small}>Gerado em {new Date().toLocaleString()}</Text>
    </Page>
  </Document>
);

export default function OrdemProducaoPDF({ data }: { data: OrdemProducaoData }) {
  return (
    <PDFDownloadLink document={<OrdemProducaoPDFDoc data={data} />} fileName="ordem-producao.pdf">
      {({ loading }) => (loading ? 'Gerando PDF...' : 'Baixar Ordem de Produção (PDF)')}
    </PDFDownloadLink>
  );
}
