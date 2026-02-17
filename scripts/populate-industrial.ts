/**
 * ============================================================================
 * POPULAR FIRESTORE — ENTIDADES INDUSTRIAIS COM CHAVES ÚNICAS
 * ============================================================================
 * Popula o banco com MaterialKey, TubeKey, AngleKey, etc reais
 * 
 * EXECUTAR: npm run populate-industrial
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import * as repo from '../src/domains/industrial/repository';
import type {
  MaterialKey,
  TubeKey,
  AngleKey,
  AccessorySKU,
  ProcessKey,
  ConfiguracoesSistema,
} from '../src/domains/industrial/entities';

// Configure com suas credenciais
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================================================
// MATERIALS — CHAVES REAIS
// ============================================================================

const materials: MaterialKey[] = [
  // INOX 304 POLIDO
  {
    materialKey: 'CHAPA_304_POLIDO_0.5',
    tipoInox: '304',
    espessuraMm: 0.5,
    acabamento: 'polido',
    densidade: 7900,
    dimensoesChapaDisponiveis: [
      { largura: 2000, altura: 1250, label: '2000×1250' },
      { largura: 3000, altura: 1250, label: '3000×1250' },
    ],
    precoPorKg: 45.00,
    fornecedor: 'ArcelorMittal',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  {
    materialKey: 'CHAPA_304_POLIDO_0.8',
    tipoInox: '304',
    espessuraMm: 0.8,
    acabamento: 'polido',
    densidade: 7900,
    dimensoesChapaDisponiveis: [
      { largura: 2000, altura: 1250, label: '2000×1250' },
      { largura: 3000, altura: 1250, label: '3000×1250' },
    ],
    precoPorKg: 43.50,
    fornecedor: 'ArcelorMittal',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  {
    materialKey: 'CHAPA_304_POLIDO_1.0',
    tipoInox: '304',
    espessuraMm: 1.0,
    acabamento: 'polido',
    densidade: 7900,
    dimensoesChapaDisponiveis: [
      { largura: 2000, altura: 1250, label: '2000×1250' },
      { largura: 3000, altura: 1250, label: '3000×1250' },
    ],
    precoPorKg: 42.00,
    fornecedor: 'ArcelorMittal',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  {
    materialKey: 'CHAPA_304_POLIDO_1.2',
    tipoInox: '304',
    espessuraMm: 1.2,
    acabamento: 'polido',
    densidade: 7900,
    dimensoesChapaDisponiveis: [
      { largura: 2000, altura: 1250, label: '2000×1250' },
      { largura: 3000, altura: 1250, label: '3000×1250' },
    ],
    precoPorKg: 41.50,
    fornecedor: 'ArcelorMittal',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  {
    materialKey: 'CHAPA_304_POLIDO_1.5',
    tipoInox: '304',
    espessuraMm: 1.5,
    acabamento: 'polido',
    densidade: 7900,
    dimensoesChapaDisponiveis: [
      { largura: 2000, altura: 1250, label: '2000×1250' },
      { largura: 3000, altura: 1250, label: '3000×1250' },
    ],
    precoPorKg: 41.00,
    fornecedor: 'ArcelorMittal',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  {
    materialKey: 'CHAPA_304_POLIDO_2.0',
    tipoInox: '304',
    espessuraMm: 2.0,
    acabamento: 'polido',
    densidade: 7900,
    dimensoesChapaDisponiveis: [
      { largura: 2000, altura: 1250, label: '2000×1250' },
      { largura: 3000, altura: 1250, label: '3000×1250' },
    ],
    precoPorKg: 40.50,
    fornecedor: 'ArcelorMittal',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  
  // INOX 304 ESCOVADO
  {
    materialKey: 'CHAPA_304_ESCOVADO_1.0',
    tipoInox: '304',
    espessuraMm: 1.0,
    acabamento: 'escovado',
    densidade: 7900,
    dimensoesChapaDisponiveis: [
      { largura: 2000, altura: 1250, label: '2000×1250' },
      { largura: 3000, altura: 1250, label: '3000×1250' },
    ],
    precoPorKg: 44.00,
    fornecedor: 'ArcelorMittal',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  {
    materialKey: 'CHAPA_304_ESCOVADO_1.2',
    tipoInox: '304',
    espessuraMm: 1.2,
    acabamento: 'escovado',
    densidade: 7900,
    dimensoesChapaDisponiveis: [
      { largura: 2000, altura: 1250, label: '2000×1250' },
      { largura: 3000, altura: 1250, label: '3000×1250' },
    ],
    precoPorKg: 43.50,
    fornecedor: 'ArcelorMittal',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  
  // INOX 430
  {
    materialKey: 'CHAPA_430_2B_1.0',
    tipoInox: '430',
    espessuraMm: 1.0,
    acabamento: '2B',
    densidade: 7900,
    dimensoesChapaDisponiveis: [
      { largura: 2000, altura: 1250, label: '2000×1250' },
      { largura: 3000, altura: 1250, label: '3000×1250' },
    ],
    precoPorKg: 35.00,
    fornecedor: 'Aperam',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  {
    materialKey: 'CHAPA_430_2B_1.2',
    tipoInox: '430',
    espessuraMm: 1.2,
    acabamento: '2B',
    densidade: 7900,
    dimensoesChapaDisponiveis: [
      { largura: 2000, altura: 1250, label: '2000×1250' },
      { largura: 3000, altura: 1250, label: '3000×1250' },
    ],
    precoPorKg: 34.50,
    fornecedor: 'Aperam',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  
  // INOX 316L
  {
    materialKey: 'CHAPA_316L_POLIDO_1.0',
    tipoInox: '316L',
    espessuraMm: 1.0,
    acabamento: 'polido',
    densidade: 7900,
    dimensoesChapaDisponiveis: [
      { largura: 2000, altura: 1250, label: '2000×1250' },
      { largura: 3000, altura: 1250, label: '3000×1250' },
    ],
    precoPorKg: 55.00,
    fornecedor: 'Acesita',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  {
    materialKey: 'CHAPA_316L_POLIDO_1.5',
    tipoInox: '316L',
    espessuraMm: 1.5,
    acabamento: 'polido',
    densidade: 7900,
    dimensoesChapaDisponiveis: [
      { largura: 2000, altura: 1250, label: '2000×1250' },
      { largura: 3000, altura: 1250, label: '3000×1250' },
    ],
    precoPorKg: 53.00,
    fornecedor: 'Acesita',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
];

// ============================================================================
// TUBES — CHAVES REAIS
// ============================================================================

const tubes: TubeKey[] = [
  // REDONDOS
  {
    tubeKey: 'TUBE_R_25.4x1.2_304',
    formato: 'REDONDO',
    dimensoes: { diametro: 25.4, espessuraParede: 1.2 },
    tipoInox: '304',
    kgPorMetro: 0.70,
    precoPorKg: 44.00,
    precoPorMetro: 0.70 * 44.00,
    fornecedor: 'Tuper',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  {
    tubeKey: 'TUBE_R_38.1x1.2_304',
    formato: 'REDONDO',
    dimensoes: { diametro: 38.1, espessuraParede: 1.2 },
    tipoInox: '304',
    kgPorMetro: 1.10,
    precoPorKg: 43.00,
    precoPorMetro: 1.10 * 43.00,
    fornecedor: 'Tuper',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  {
    tubeKey: 'TUBE_R_50.8x1.5_304',
    formato: 'REDONDO',
    dimensoes: { diametro: 50.8, espessuraParede: 1.5 },
    tipoInox: '304',
    kgPorMetro: 1.85,
    precoPorKg: 42.50,
    precoPorMetro: 1.85 * 42.50,
    fornecedor: 'Tuper',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  
  // QUADRADOS
  {
    tubeKey: 'TUBE_Q_20x20x1.2_304',
    formato: 'QUADRADO',
    dimensoes: { largura: 20, espessuraParede: 1.2 },
    tipoInox: '304',
    kgPorMetro: 0.68,
    precoPorKg: 43.50,
    precoPorMetro: 0.68 * 43.50,
    fornecedor: 'Tuper',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  {
    tubeKey: 'TUBE_Q_25x25x1.2_304',
    formato: 'QUADRADO',
    dimensoes: { largura: 25, espessuraParede: 1.2 },
    tipoInox: '304',
    kgPorMetro: 0.88,
    precoPorKg: 43.00,
    precoPorMetro: 0.88 * 43.00,
    fornecedor: 'Tuper',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  {
    tubeKey: 'TUBE_Q_40x40x1.2_304',
    formato: 'QUADRADO',
    dimensoes: { largura: 40, espessuraParede: 1.2 },
    tipoInox: '304',
    kgPorMetro: 1.45,
    precoPorKg: 42.50,
    precoPorMetro: 1.45 * 42.50,
    fornecedor: 'Tuper',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  
  // RETANGULARES
  {
    tubeKey: 'TUBE_RET_20x40x1.2_304',
    formato: 'RETANGULAR',
    dimensoes: { largura: 20, altura: 40, espessuraParede: 1.2 },
    tipoInox: '304',
    kgPorMetro: 1.08,
    precoPorKg: 43.00,
    precoPorMetro: 1.08 * 43.00,
    fornecedor: 'Tuper',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
];

// ============================================================================
// ANGLES — CHAVES REAIS
// ============================================================================

const angles: AngleKey[] = [
  {
    angleKey: 'ANGLE_20x20x3_304',
    ladoA: 20,
    ladoB: 20,
    espessura: 3,
    tipoInox: '304',
    kgPorMetro: 0.88,
    precoPorKg: 43.00,
    precoPorMetro: 0.88 * 43.00,
    fornecedor: 'Gerdau',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  {
    angleKey: 'ANGLE_30x30x3_304',
    ladoA: 30,
    ladoB: 30,
    espessura: 3,
    tipoInox: '304',
    kgPorMetro: 1.36,
    precoPorKg: 43.00,
    precoPorMetro: 1.36 * 43.00,
    fornecedor: 'Gerdau',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  {
    angleKey: 'ANGLE_40x40x5_304',
    ladoA: 40,
    ladoB: 40,
    espessura: 5,
    tipoInox: '304',
    kgPorMetro: 2.98,
    precoPorKg: 42.50,
    precoPorMetro: 2.98 * 42.50,
    fornecedor: 'Gerdau',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
];

// ============================================================================
// ACCESSORIES — SKUs REAIS
// ============================================================================

const accessories: AccessorySKU[] = [
  {
    sku: 'PE-REGULAVEL-304-M10',
    descricao: 'Pé Regulável Inox 304, rosca M10, altura 100-150mm',
    precoUnitario: 15.00,
    fornecedor: 'Hafele',
    categoria: 'fixacao',
    unidade: 'un',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  {
    sku: 'RODIZIO-GIRAT-50MM-80KG',
    descricao: 'Rodízio Giratório com freio, 50mm, carga 80kg',
    precoUnitario: 22.00,
    fornecedor: 'Colson',
    categoria: 'estrutural',
    unidade: 'un',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  {
    sku: 'VALVULA-ESCOAM-3.5',
    descricao: 'Válvula de escoamento para cuba, 3.5"',
    precoUnitario: 35.00,
    fornecedor: 'Tramontina',
    categoria: 'hidraulico',
    unidade: 'un',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
  {
    sku: 'MAO-FRANCESA-250MM-304',
    descricao: 'Mão francesa para prateleiras, 250mm, inox 304',
    precoUnitario: 18.00,
    fornecedor: 'Metalnox',
    categoria: 'estrutural',
    unidade: 'un',
    dataAtualizacao: new Date().toISOString(),
    ativo: true,
  },
];

// ============================================================================
// PROCESSES — CHAVES REAIS
// ============================================================================

const processes: ProcessKey[] = [
  {
    processKey: 'CORTE_LASER_304',
    tipo: 'CORTE',
    descricao: 'Corte a laser para inox 304',
    custoPorHora: 150.00,
    custoSetup: 50.00,
    custoPorMetro: 5.00,
    espessuraMaxima: 6.0,
    materialCompativel: ['304', '316', '316L'],
    ativo: true,
    dataAtualizacao: new Date().toISOString(),
  },
  {
    processKey: 'CORTE_PLASMA_430',
    tipo: 'CORTE',
    descricao: 'Corte a plasma para inox 430',
    custoPorHora: 100.00,
    custoSetup: 30.00,
    custoPorMetro: 3.00,
    espessuraMaxima: 20.0,
    materialCompativel: ['430'],
    ativo: true,
    dataAtualizacao: new Date().toISOString(),
  },
  {
    processKey: 'DOBRA_PRENSA_100T',
    tipo: 'DOBRA',
    descricao: 'Dobra em prensa hidráulica 100T',
    custoPorHora: 120.00,
    custoSetup: 40.00,
    custoPorDobra: 8.00,
    espessuraMaxima: 3.0,
    ativo: true,
    dataAtualizacao: new Date().toISOString(),
  },
  {
    processKey: 'SOLDA_TIG_304',
    tipo: 'SOLDA',
    descricao: 'Solda TIG para inox 304',
    custoPorHora: 180.00,
    custoSetup: 30.00,
    custoPorMetro: 12.00,
    materialCompativel: ['304', '316', '316L'],
    ativo: true,
    dataAtualizacao: new Date().toISOString(),
  },
  {
    processKey: 'POLIMENTO_ORBITAL',
    tipo: 'ACABAMENTO',
    descricao: 'Polimento com lixadeira orbital',
    custoPorHora: 100.00,
    custoPorM2: 25.00,
    ativo: true,
    dataAtualizacao: new Date().toISOString(),
  },
  {
    processKey: 'MONTAGEM_GERAL',
    tipo: 'MONTAGEM',
    descricao: 'Montagem final do produto',
    custoPorHora: 90.00,
    custoSetup: 20.00,
    ativo: true,
    dataAtualizacao: new Date().toISOString(),
  },
];

// ============================================================================
// CONFIGURAÇÕES
// ============================================================================

const config: ConfiguracoesSistema = {
  kerfMm: 0.2,
  margemMinimaEntrePecasMm: 5,
  margemBordaMm: 10,
  perdaMinimaOperacional: 5,
  perdaSetup: 2,
  freteCompraPorKg: 0.50,
  freteEntregaFixo: 150.00,
  embalagemPorProduto: 50.00,
  consumiveisPorHora: 30.00,
  retrabalhoEstimado: 3,
  overheadPercent: 20,
  overheadIncideEmAcessorios: false,
  margemMinima: 25,
  margemAlvo: 35,
  markup: 2.5,
  lucroMinimoAbsoluto: 500,
  diasValidadePreco: 30,
  aproveitamentoMinimoAceitavel: 60,
  perdaMaximaAceitavel: 20,
  dataAtualizacao: new Date().toISOString(),
};

// ============================================================================
// EXECUTAR POPULAÇÃO
// ============================================================================

async function popularBanco() {
  console.log('🚀 Iniciando população do banco industrial...\n');
  
  try {
    // Materials
    console.log('📦 Cadastrando materiais (MaterialKey)...');
    for (const material of materials) {
      await repo.criarMaterial(material);
    }
    console.log(`✅ ${materials.length} materiais cadastrados\n`);
    
    // Tubes
    console.log('🔩 Cadastrando tubos (TubeKey)...');
    for (const tube of tubes) {
      await repo.criarTubo(tube);
    }
    console.log(`✅ ${tubes.length} tubos cadastrados\n`);
    
    // Angles
    console.log('📐 Cadastrando cantoneiras (AngleKey)...');
    for (const angle of angles) {
      await repo.criarCantoneira(angle);
    }
    console.log(`✅ ${angles.length} cantoneiras cadastradas\n`);
    
    // Accessories
    console.log('🔧 Cadastrando acessórios (SKU)...');
    for (const accessory of accessories) {
      await repo.criarAcessorio(accessory);
    }
    console.log(`✅ ${accessories.length} acessórios cadastrados\n`);
    
    // Processes
    console.log('⚙️ Cadastrando processos (ProcessKey)...');
    for (const process of processes) {
      await repo.criarProcesso(process);
    }
    console.log(`✅ ${processes.length} processos cadastrados\n`);
    
    // Config
    console.log('⚙️ Salvando configurações...');
    await repo.atualizarConfiguracoes(config);
    console.log('✅ Configurações salvas\n');
    
    console.log('🎉 Banco de dados industrial populado com sucesso!\n');
    console.log('📊 Resumo:');
    console.log(`- ${materials.length} chaves MaterialKey`);
    console.log(`- ${tubes.length} chaves TubeKey`);
    console.log(`- ${angles.length} chaves AngleKey`);
    console.log(`- ${accessories.length} SKUs`);
    console.log(`- ${processes.length} chaves ProcessKey`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  }
}

popularBanco()
  .then(() => {
    console.log('\n✅ Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
