import React from 'react';
import { Page, Text, View, Document, StyleSheet, pdf, Image } from '@react-pdf/renderer';

// Tipos e Interfaces
export type StatusOP = 'PENDENTE' | 'EM_PRODUCAO' | 'CONCLUIDA' | 'PAUSADA';

export interface ItemProduto {
  codigo: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  observacoes?: string;
}

export interface EtapaProcesso {
  etapa: string;
  responsavel?: string;
  inicio?: string;
  termino?: string;
}

export interface Apontamento {
  operador: string;
  lider?: string;
  dataHora?: string;
  tempoProducao?: string;
  pausas?: string;
  motivoPausa?: string;
}

export interface Revisao {
  data: string;
  alteracao: string;
  motivo: string;
}

export interface OrdemProducaoData {
  // 1) Cabecalho
  logoUrl?: string;
  nomeEmpresa?: string;
  numeroOP: string;
  dataEmissao: string;
  status: StatusOP;

  // 2) Cliente
  cliente: string;

  // 3) Origem
  numeroOrcamento?: string;
  numeroPedido?: string;
  dataAprovacao?: string;

  // 4) Produto / Itens
  itens: ItemProduto[];

  // 5) Prazo
  dataEntrega: string;
  diasRestantes?: number;
  prioridade?: 'BAIXA' | 'NORMAL' | 'ALTA' | 'URGENTE';

  // 6) Processo de Producao
  processos: EtapaProcesso[];

  // 7) Apontamentos
  apontamentos?: Apontamento[];

  // 8) Observacoes
  observacoesGerais?: string;
  observacoesCliente?: string;

  // 9) Revisoes
  revisoes?: Revisao[];

  // 10) Rodape
  geradoPor?: string;
  dataHoraGeracao?: string;
  assinaturas?: {
    producao?: string;
    qualidade?: string;
    aprovacao?: string;
  };
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
    fontSize: 9,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },

  // Cabecalho
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottom: '3px solid #2563eb',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 4,
  },
  nomeEmpresa: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  numeroOP: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  dataEmissao: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 4,
  },
  statusBadge: {
    padding: 6,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  statusPendente: {
    backgroundColor: '#fbbf24',
    color: '#78350f',
  },
  statusEmProducao: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  },
  statusConcluida: {
    backgroundColor: '#10b981',
    color: '#ffffff',
  },
  statusPausada: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
  },

  // Secoes
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#2563eb',
    padding: 5,
    paddingLeft: 8,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Grid de informacoes
  infoGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 6,
    borderRadius: 4,
    border: '1px solid #cbd5e1',
  },
  infoLabel: {
    fontSize: 7,
    color: '#64748b',
    fontWeight: 'bold',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 9,
    color: '#1e293b',
    fontWeight: 'normal',
  },

  // Cliente
  clienteBox: {
    backgroundColor: '#eff6ff',
    padding: 8,
    borderRadius: 4,
    border: '2px solid #3b82f6',
  },
  clienteLabel: {
    fontSize: 8,
    color: '#1e40af',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  clienteNome: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: 'bold',
  },

  // Prazo
  prazoBox: {
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 4,
    border: '2px solid #f59e0b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prazoInfo: {
    flex: 1,
  },
  prazoDias: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#92400e',
  },
  prazoLabel: {
    fontSize: 7,
    color: '#92400e',
  },

  // Tabelas
  table: {
    width: '100%',
    border: '1px solid #cbd5e1',
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderBottom: '1px solid #cbd5e1',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e2e8f0',
  },
  tableRowEven: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    padding: 5,
    fontSize: 8,
    color: '#1e293b',
    borderRight: '1px solid #e2e8f0',
  },
  tableHeaderCell: {
    padding: 5,
    fontSize: 7,
    fontWeight: 'bold',
    color: '#ffffff',
    borderRight: '1px solid #475569',
    textTransform: 'uppercase',
  },
  tableCellLeft: {
    textAlign: 'left',
  },
  tableCellCenter: {
    textAlign: 'center',
  },

  // Observacoes
  obsBox: {
    backgroundColor: '#fffbeb',
    padding: 8,
    borderRadius: 4,
    border: '1px solid #fbbf24',
    minHeight: 30,
    marginBottom: 6,
  },
  obsLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 3,
  },
  obsText: {
    fontSize: 8,
    color: '#451a03',
    lineHeight: 1.4,
  },

  // Assinaturas
  assinaturasBox: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  assinaturaItem: {
    flex: 1,
    border: '1px solid #cbd5e1',
    borderRadius: 4,
    padding: 6,
    minHeight: 40,
  },
  assinaturaLabel: {
    fontSize: 7,
    color: '#64748b',
    marginBottom: 20,
  },
  assinaturaLinha: {
    borderTop: '1px solid #94a3b8',
    paddingTop: 2,
  },
  assinaturaNome: {
    fontSize: 7,
    color: '#475569',
    textAlign: 'center',
  },

  // Rodape
  footer: {
    marginTop: 12,
    paddingTop: 8,
    borderTop: '1px solid #cbd5e1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#94a3b8',
  },
});

const OrdemProducaoPDFDoc = ({ data }: { data: OrdemProducaoData }) => {
  const getStatusStyle = () => {
    switch (data.status) {
      case 'PENDENTE':
        return styles.statusPendente;
      case 'EM_PRODUCAO':
        return styles.statusEmProducao;
      case 'CONCLUIDA':
        return styles.statusConcluida;
      case 'PAUSADA':
        return styles.statusPausada;
      default:
        return styles.statusPendente;
    }
  };

  const getStatusText = () => {
    switch (data.status) {
      case 'PENDENTE':
        return 'PENDENTE';
      case 'EM_PRODUCAO':
        return 'EM PRODUCAO';
      case 'CONCLUIDA':
        return 'CONCLUIDA';
      case 'PAUSADA':
        return 'PAUSADA';
      default:
        return 'PENDENTE';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 1) CABECALHO */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {data.logoUrl && <Image src={data.logoUrl} style={styles.logo} />}
            {data.nomeEmpresa && <Text style={styles.nomeEmpresa}>{data.nomeEmpresa}</Text>}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.numeroOP}>OP Nº {data.numeroOP}</Text>
            <Text style={styles.dataEmissao}>Emitida em: {data.dataEmissao}</Text>
            <View style={[styles.statusBadge, getStatusStyle()]}>
              <Text>{getStatusText()}</Text>
            </View>
          </View>
        </View>

        {/* 2) CLIENTE */}
        <View style={[styles.section, { marginBottom: 4 }]}>
          <View style={styles.clienteBox}>
            <Text style={styles.clienteLabel}>CLIENTE</Text>
            <Text style={styles.clienteNome}>{data.cliente}</Text>
          </View>
        </View>

        {/* 3) ORIGEM */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. ORIGEM</Text>
          <View style={styles.infoGrid}>
            {data.numeroOrcamento && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Nº do Orcamento</Text>
                <Text style={styles.infoValue}>{data.numeroOrcamento}</Text>
              </View>
            )}
            {data.numeroPedido && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Nº do Pedido</Text>
                <Text style={styles.infoValue}>{data.numeroPedido}</Text>
              </View>
            )}
            {data.dataAprovacao && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Data de Aprovacao</Text>
                <Text style={styles.infoValue}>{data.dataAprovacao}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 4) PRODUTO / ITENS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. PRODUTO / ITENS</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Codigo</Text>
              <Text style={[styles.tableHeaderCell, { width: '40%' }]}>Descricao</Text>
              <Text style={[styles.tableHeaderCell, { width: '12%' }]}>Qtd</Text>
              <Text style={[styles.tableHeaderCell, { width: '10%' }]}>Un.</Text>
              <Text style={[styles.tableHeaderCell, { width: '23%', borderRight: 'none' }]}>Observacoes</Text>
            </View>
            {data.itens.map((item, idx) => (
              <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : {}]}>
                <Text style={[styles.tableCell, styles.tableCellCenter, { width: '15%' }]}>{item.codigo}</Text>
                <Text style={[styles.tableCell, styles.tableCellLeft, { width: '40%' }]}>{item.descricao}</Text>
                <Text style={[styles.tableCell, styles.tableCellCenter, { width: '12%' }]}>{item.quantidade}</Text>
                <Text style={[styles.tableCell, styles.tableCellCenter, { width: '10%' }]}>{item.unidade}</Text>
                <Text style={[styles.tableCell, styles.tableCellLeft, { width: '23%', borderRight: 'none' }]}>{item.observacoes || '-'}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 5) PRAZO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. PRAZO</Text>
          <View style={styles.prazoBox}>
            <View style={styles.prazoInfo}>
              <Text style={styles.infoLabel}>Data de Entrega</Text>
              <Text style={styles.infoValue}>{data.dataEntrega}</Text>
            </View>
            {data.diasRestantes !== undefined && (
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.prazoDias}>{data.diasRestantes}</Text>
                <Text style={styles.prazoLabel}>dias restantes</Text>
              </View>
            )}
            {data.prioridade && (
              <View style={{ backgroundColor: '#dc2626', padding: 6, borderRadius: 4 }}>
                <Text style={{ color: '#ffffff', fontSize: 9, fontWeight: 'bold' }}>
                  {data.prioridade}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 6) PROCESSO DE PRODUCAO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. PROCESSO DE PRODUCAO</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '50%' }]}>Etapa</Text>
              <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Responsavel</Text>
              <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Inicio</Text>
              <Text style={[styles.tableHeaderCell, { width: '15%', borderRight: 'none' }]}>Termino</Text>
            </View>
            {data.processos.map((proc, idx) => (
              <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : {}]}>
                <Text style={[styles.tableCell, styles.tableCellLeft, { width: '50%' }]}>{proc.etapa}</Text>
                <Text style={[styles.tableCell, styles.tableCellCenter, { width: '20%' }]}>{proc.responsavel || '-'}</Text>
                <Text style={[styles.tableCell, styles.tableCellCenter, { width: '15%' }]}>{proc.inicio || '-'}</Text>
                <Text style={[styles.tableCell, styles.tableCellCenter, { width: '15%', borderRight: 'none' }]}>{proc.termino || '-'}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 7) APONTAMENTOS */}
        {data.apontamentos && data.apontamentos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. APONTAMENTOS</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Operador</Text>
                <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Lider</Text>
                <Text style={[styles.tableHeaderCell, { width: '18%' }]}>Data/Hora</Text>
                <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Tempo Prod.</Text>
                <Text style={[styles.tableHeaderCell, { width: '12%' }]}>Pausas</Text>
                <Text style={[styles.tableHeaderCell, { width: '20%', borderRight: 'none' }]}>Motivo Pausa</Text>
              </View>
              {data.apontamentos.map((apt, idx) => (
                <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : {}]}>
                  <Text style={[styles.tableCell, { width: '20%' }]}>{apt.operador}</Text>
                  <Text style={[styles.tableCell, { width: '15%' }]}>{apt.lider || '-'}</Text>
                  <Text style={[styles.tableCell, { width: '18%' }]}>{apt.dataHora || '-'}</Text>
                  <Text style={[styles.tableCell, { width: '15%' }]}>{apt.tempoProducao || '-'}</Text>
                  <Text style={[styles.tableCell, { width: '12%' }]}>{apt.pausas || '-'}</Text>
                  <Text style={[styles.tableCell, styles.tableCellLeft, { width: '20%', borderRight: 'none' }]}>{apt.motivoPausa || '-'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 8) OBSERVACOES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. OBSERVACOES</Text>
          {data.observacoesGerais && (
            <View style={styles.obsBox}>
              <Text style={styles.obsLabel}>OBSERVACOES GERAIS</Text>
              <Text style={styles.obsText}>{data.observacoesGerais}</Text>
            </View>
          )}
          {data.observacoesCliente && (
            <View style={styles.obsBox}>
              <Text style={styles.obsLabel}>OBSERVACOES DO CLIENTE</Text>
              <Text style={styles.obsText}>{data.observacoesCliente}</Text>
            </View>
          )}
        </View>

        {/* 9) REVISOES */}
        {data.revisoes && data.revisoes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. REVISOES</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Data</Text>
                <Text style={[styles.tableHeaderCell, { width: '40%' }]}>Alteracao</Text>
                <Text style={[styles.tableHeaderCell, { width: '45%', borderRight: 'none' }]}>Motivo</Text>
              </View>
              {data.revisoes.map((rev, idx) => (
                <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : {}]}>
                  <Text style={[styles.tableCell, styles.tableCellCenter, { width: '15%' }]}>{rev.data}</Text>
                  <Text style={[styles.tableCell, styles.tableCellLeft, { width: '40%' }]}>{rev.alteracao}</Text>
                  <Text style={[styles.tableCell, styles.tableCellLeft, { width: '45%', borderRight: 'none' }]}>{rev.motivo}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 10) ASSINATURAS */}
        {data.assinaturas && (
          <View style={styles.assinaturasBox}>
            <View style={styles.assinaturaItem}>
              <Text style={styles.assinaturaLabel}>PRODUCAO</Text>
              <View style={styles.assinaturaLinha}>
                <Text style={styles.assinaturaNome}>{data.assinaturas.producao || ''}</Text>
              </View>
            </View>
            <View style={styles.assinaturaItem}>
              <Text style={styles.assinaturaLabel}>QUALIDADE</Text>
              <View style={styles.assinaturaLinha}>
                <Text style={styles.assinaturaNome}>{data.assinaturas.qualidade || ''}</Text>
              </View>
            </View>
            <View style={styles.assinaturaItem}>
              <Text style={styles.assinaturaLabel}>APROVACAO</Text>
              <View style={styles.assinaturaLinha}>
                <Text style={styles.assinaturaNome}>{data.assinaturas.aprovacao || ''}</Text>
              </View>
            </View>
          </View>
        )}

        {/* RODAPE */}
        <View style={styles.footer}>
          <Text>
            {data.geradoPor ? `Gerado por: ${data.geradoPor}` : 'Sistema de Producao'}
          </Text>
          <Text>
            {data.dataHoraGeracao || new Date().toLocaleString('pt-BR')}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default function OrdemProducaoPDF({
  data,
  fileName = 'ordem-producao.pdf',
  downloadLabel = 'Baixar Ordem de Producao (PDF)',
  loadingLabel = 'Gerando PDF...'
}: OrdemProducaoPDFProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const doc = <OrdemProducaoPDFDoc data={data} />;
      const asPdf = pdf();
      asPdf.updateContainer(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
    >
      {isGenerating ? loadingLabel : downloadLabel}
    </button>
  );
}
