/**
 * ============================================================================
 * SCRIPT DE POPULAÇÃO DO BANCO DE DADOS - MATERIAIS
 * ============================================================================
 * Popula o Firestore com dados reais de materiais e preços
 * 
 * EXECUTAR: npm run populate-materiais
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, setDoc, doc } from 'firebase/firestore';

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
// CHAPAS PADRÃO
// ============================================================================

const chapasPadrao = [
  {
    largura: 2000,
    altura: 1250,
    label: '2000×1250mm',
    ativo: true,
  },
  {
    largura: 3000,
    altura: 1250,
    label: '3000×1250mm',
    ativo: true,
  },
];

// ============================================================================
// PREÇOS DE CHAPAS (valores reais do mercado brasileiro 2024)
// ============================================================================

const precosChapas = [
  // INOX 304
  { tipoInox: '304', espessuraMm: 0.5, precoKg: 45.00, fornecedor: 'ArcelorMittal' },
  { tipoInox: '304', espessuraMm: 0.8, precoKg: 43.50, fornecedor: 'ArcelorMittal' },
  { tipoInox: '304', espessuraMm: 1.0, precoKg: 42.00, fornecedor: 'ArcelorMittal' },
  { tipoInox: '304', espessuraMm: 1.2, precoKg: 41.50, fornecedor: 'ArcelorMittal' },
  { tipoInox: '304', espessuraMm: 1.5, precoKg: 41.00, fornecedor: 'ArcelorMittal' },
  { tipoInox: '304', espessuraMm: 2.0, precoKg: 40.50, fornecedor: 'ArcelorMittal' },
  { tipoInox: '304', espessuraMm: 3.0, precoKg: 40.00, fornecedor: 'ArcelorMittal' },
  
  // INOX 430 (mais barato)
  { tipoInox: '430', espessuraMm: 0.5, precoKg: 38.00, fornecedor: 'Aperam' },
  { tipoInox: '430', espessuraMm: 0.8, precoKg: 36.50, fornecedor: 'Aperam' },
  { tipoInox: '430', espessuraMm: 1.0, precoKg: 35.00, fornecedor: 'Aperam' },
  { tipoInox: '430', espessuraMm: 1.2, precoKg: 34.50, fornecedor: 'Aperam' },
  { tipoInox: '430', espessuraMm: 1.5, precoKg: 34.00, fornecedor: 'Aperam' },
  { tipoInox: '430', espessuraMm: 2.0, precoKg: 33.50, fornecedor: 'Aperam' },
  
  // INOX 316 (mais caro, resistente)
  { tipoInox: '316', espessuraMm: 0.8, precoKg: 58.00, fornecedor: 'Acesita' },
  { tipoInox: '316', espessuraMm: 1.0, precoKg: 55.00, fornecedor: 'Acesita' },
  { tipoInox: '316', espessuraMm: 1.2, precoKg: 54.00, fornecedor: 'Acesita' },
  { tipoInox: '316', espessuraMm: 1.5, precoKg: 53.00, fornecedor: 'Acesita' },
  { tipoInox: '316', espessuraMm: 2.0, precoKg: 52.00, fornecedor: 'Acesita' },
];

// ============================================================================
// TUBOS (kg/m calculados por fórmula)
// ============================================================================

const tubos = [
  // TUBOS REDONDOS (mais comuns)
  {
    tipo: 'redondo',
    descricao: 'Tubo Redondo Ø 25.4mm × 1.2mm',
    diametro: 25.4,
    espessuraParede: 1.2,
    kgPorMetro: 0.70,
    ativo: true,
  },
  {
    tipo: 'redondo',
    descricao: 'Tubo Redondo Ø 31.8mm × 1.2mm',
    diametro: 31.8,
    espessuraParede: 1.2,
    kgPorMetro: 0.90,
    ativo: true,
  },
  {
    tipo: 'redondo',
    descricao: 'Tubo Redondo Ø 38.1mm × 1.2mm',
    diametro: 38.1,
    espessuraParede: 1.2,
    kgPorMetro: 1.10,
    ativo: true,
  },
  {
    tipo: 'redondo',
    descricao: 'Tubo Redondo Ø 50.8mm × 1.5mm',
    diametro: 50.8,
    espessuraParede: 1.5,
    kgPorMetro: 1.85,
    ativo: true,
  },
  
  // TUBOS QUADRADOS
  {
    tipo: 'quadrado',
    descricao: 'Tubo Quadrado 20×20mm × 1.2mm',
    lado: 20,
    espessuraParede: 1.2,
    kgPorMetro: 0.68,
    ativo: true,
  },
  {
    tipo: 'quadrado',
    descricao: 'Tubo Quadrado 25×25mm × 1.2mm',
    lado: 25,
    espessuraParede: 1.2,
    kgPorMetro: 0.88,
    ativo: true,
  },
  {
    tipo: 'quadrado',
    descricao: 'Tubo Quadrado 30×30mm × 1.2mm',
    lado: 30,
    espessuraParede: 1.2,
    kgPorMetro: 1.08,
    ativo: true,
  },
  {
    tipo: 'quadrado',
    descricao: 'Tubo Quadrado 40×40mm × 1.5mm',
    lado: 40,
    espessuraParede: 1.5,
    kgPorMetro: 1.80,
    ativo: true,
  },
  
  // TUBOS RETANGULARES
  {
    tipo: 'retangular',
    descricao: 'Tubo Retangular 20×40mm × 1.2mm',
    largura: 20,
    altura: 40,
    espessuraParede: 1.2,
    kgPorMetro: 1.08,
    ativo: true,
  },
  {
    tipo: 'retangular',
    descricao: 'Tubo Retangular 30×50mm × 1.5mm',
    largura: 30,
    altura: 50,
    espessuraParede: 1.5,
    kgPorMetro: 1.80,
    ativo: true,
  },
];

// ============================================================================
// PREÇOS DE TUBOS
// ============================================================================

const precosTubos = [
  // Tubo redondo Ø25.4
  { tuboIndex: 0, tipoInox: '304', precoKg: 44.00 },
  { tuboIndex: 0, tipoInox: '430', precoKg: 37.00 },
  
  // Tubo redondo Ø31.8
  { tuboIndex: 1, tipoInox: '304', precoKg: 43.50 },
  { tuboIndex: 1, tipoInox: '430', precoKg: 36.50 },
  
  // Tubo redondo Ø38.1
  { tuboIndex: 2, tipoInox: '304', precoKg: 43.00 },
  { tuboIndex: 2, tipoInox: '430', precoKg: 36.00 },
  
  // Tubo redondo Ø50.8
  { tuboIndex: 3, tipoInox: '304', precoKg: 42.50 },
  { tuboIndex: 3, tipoInox: '430', precoKg: 35.50 },
  
  // Tubos quadrados (todos)
  { tuboIndex: 4, tipoInox: '304', precoKg: 43.50 },
  { tuboIndex: 5, tipoInox: '304', precoKg: 43.00 },
  { tuboIndex: 6, tipoInox: '304', precoKg: 42.50 },
  { tuboIndex: 7, tipoInox: '304', precoKg: 42.00 },
  
  // Tubos retangulares
  { tuboIndex: 8, tipoInox: '304', precoKg: 43.00 },
  { tuboIndex: 9, tipoInox: '304', precoKg: 42.50 },
];

// ============================================================================
// CANTONEIRAS
// ============================================================================

const cantoneiras = [
  {
    descricao: 'Cantoneira 20×20×3mm',
    ladoA: 20,
    ladoB: 20,
    espessura: 3,
    kgPorMetro: 0.88,
    ativo: true,
  },
  {
    descricao: 'Cantoneira 25×25×3mm',
    ladoA: 25,
    ladoB: 25,
    espessura: 3,
    kgPorMetro: 1.12,
    ativo: true,
  },
  {
    descricao: 'Cantoneira 30×30×3mm',
    ladoA: 30,
    ladoB: 30,
    espessura: 3,
    kgPorMetro: 1.36,
    ativo: true,
  },
  {
    descricao: 'Cantoneira 40×40×5mm',
    ladoA: 40,
    ladoB: 40,
    espessura: 5,
    kgPorMetro: 2.98,
    ativo: true,
  },
  {
    descricao: 'Cantoneira 50×50×5mm',
    ladoA: 50,
    ladoB: 50,
    espessura: 5,
    kgPorMetro: 3.77,
    ativo: true,
  },
];

// ============================================================================
// ACESSÓRIOS
// ============================================================================

const acessorios = [
  // Fixação
  {
    sku: 'PE-REGULAVEL-304',
    nome: 'Pé Regulável Inox 304',
    descricao: 'Pé regulável em inox 304, rosca M10, altura 100-150mm',
    categoria: 'fixacao',
    unidade: 'un',
    precoUnitario: 15.00,
    estoqueMinimo: 50,
    ativo: true,
  },
  {
    sku: 'CASQUILHO-INOX',
    nome: 'Casquilho Inox',
    descricao: 'Casquilho para pés de mesa, inox 304',
    categoria: 'fixacao',
    unidade: 'un',
    precoUnitario: 3.50,
    estoqueMinimo: 100,
    ativo: true,
  },
  {
    sku: 'RODIZIO-GIRAT-50',
    nome: 'Rodízio Giratório 50mm',
    descricao: 'Rodízio giratório com freio, 50mm, carga 80kg',
    categoria: 'estrutural',
    unidade: 'un',
    precoUnitario: 22.00,
    estoqueMinimo: 40,
    ativo: true,
  },
  {
    sku: 'MAO-FRANCESA-304',
    nome: 'Mão Francesa Inox 304',
    descricao: 'Mão francesa para prateleiras, 250mm',
    categoria: 'estrutural',
    unidade: 'un',
    precoUnitario: 18.00,
    estoqueMinimo: 30,
    ativo: true,
  },
  
  // Hidráulico
  {
    sku: 'VALVULA-ESCOAM',
    nome: 'Válvula de Escoamento',
    descricao: 'Válvula de escoamento para cuba, 3.5"',
    categoria: 'hidraulico',
    unidade: 'un',
    precoUnitario: 35.00,
    estoqueMinimo: 20,
    ativo: true,
  },
  {
    sku: 'TORNEIRA-PAREDE',
    nome: 'Torneira de Parede',
    descricao: 'Torneira para lavatório, parede, 1/2"',
    categoria: 'hidraulico',
    unidade: 'un',
    precoUnitario: 85.00,
    estoqueMinimo: 15,
    ativo: true,
  },
  {
    sku: 'BICA-ALTA-LAVAT',
    nome: 'Bica Alta Lavatório',
    descricao: 'Bica alta giratória inox 304, altura 300mm',
    categoria: 'hidraulico',
    unidade: 'un',
    precoUnitario: 95.00,
    estoqueMinimo: 10,
    ativo: true,
  },
  {
    sku: 'BICA-BAIXA-LAVAT',
    nome: 'Bica Baixa Lavatório',
    descricao: 'Bica baixa fixa inox 304, altura 150mm',
    categoria: 'hidraulico',
    unidade: 'un',
    precoUnitario: 65.00,
    estoqueMinimo: 10,
    ativo: true,
  },
  {
    sku: 'PEDAL-ACION-LAVAT',
    nome: 'Pedal de Acionamento',
    descricao: 'Pedal para acionamento de torneira',
    categoria: 'hidraulico',
    unidade: 'un',
    precoUnitario: 120.00,
    estoqueMinimo: 8,
    ativo: true,
  },
  {
    sku: 'MANGUEIRA-FLEX',
    nome: 'Mangueira Flexível',
    descricao: 'Mangueira flexível 1/2", 40cm',
    categoria: 'hidraulico',
    unidade: 'un',
    precoUnitario: 25.00,
    estoqueMinimo: 30,
    ativo: true,
  },
  {
    sku: 'JOELHO-90-INOX',
    nome: 'Joelho 90° Inox',
    descricao: 'Joelho 90° em inox 304, 1/2"',
    categoria: 'hidraulico',
    unidade: 'un',
    precoUnitario: 12.00,
    estoqueMinimo: 50,
    ativo: true,
  },
  
  // Acabamento
  {
    sku: 'REBITE-INOX-4MM',
    nome: 'Rebite Inox 4mm',
    descricao: 'Rebite de repuxo inox 304, 4mm',
    categoria: 'acabamento',
    unidade: 'un',
    precoUnitario: 0.50,
    estoqueMinimo: 500,
    ativo: true,
  },
  {
    sku: 'PARAFUSO-M6-INOX',
    nome: 'Parafuso M6 Inox',
    descricao: 'Parafuso sextavado M6×20mm inox 304',
    categoria: 'acabamento',
    unidade: 'un',
    precoUnitario: 0.80,
    estoqueMinimo: 500,
    ativo: true,
  },
];

// ============================================================================
// PROCESSOS
// ============================================================================

const processos = [
  {
    tipo: 'corte',
    descricao: 'Corte a Laser / Plasma',
    custoPorHora: 150.00,
    tempoMinimoPorPeca: 5,
    ativo: true,
  },
  {
    tipo: 'dobra',
    descricao: 'Dobra em Prensa',
    custoPorHora: 120.00,
    tempoMinimoPorPeca: 3,
    ativo: true,
  },
  {
    tipo: 'solda',
    descricao: 'Solda TIG',
    custoPorHora: 180.00,
    tempoMinimoPorPeca: 10,
    ativo: true,
  },
  {
    tipo: 'acabamento',
    descricao: 'Polimento e Escovamento',
    custoPorHora: 100.00,
    tempoMinimoPorPeca: 15,
    ativo: true,
  },
  {
    tipo: 'montagem',
    descricao: 'Montagem Final',
    custoPorHora: 90.00,
    tempoMinimoPorPeca: 20,
    ativo: true,
  },
  {
    tipo: 'instalacao',
    descricao: 'Instalação no Local',
    custoPorHora: 120.00,
    tempoMinimoPorPeca: 60,
    ativo: true,
  },
];

// ============================================================================
// CONFIGURAÇÕES
// ============================================================================

const configuracoes = {
  densidadeInoxKgM3: 7900,
  margemPerdaMaterial: 15,
  overheadPercent: 20,
  margemLucroMinima: 25,
  markupPadrao: 2.5,
  dataAtualizacao: new Date().toISOString(),
};

// ============================================================================
// FUNÇÃO PRINCIPAL
// ============================================================================

async function popularBancoDeDados() {
  console.log('🚀 Iniciando população do banco de dados...\n');
  
  try {
    // 1. Chapas Padrão
    console.log('📦 Cadastrando chapas padrão...');
    for (const chapa of chapasPadrao) {
      await addDoc(collection(db, 'materiais_chapas_padrao'), chapa);
    }
    console.log(`✅ ${chapasPadrao.length} chapas cadastradas\n`);
    
    // 2. Preços de Chapas
    console.log('💰 Cadastrando preços de chapas...');
    for (const preco of precosChapas) {
      await addDoc(collection(db, 'materiais_precos_chapas'), {
        ...preco,
        dataAtualizacao: new Date().toISOString(),
      });
    }
    console.log(`✅ ${precosChapas.length} preços de chapas cadastrados\n`);
    
    // 3. Tubos
    console.log('🔩 Cadastrando tubos...');
    const tuboIds: string[] = [];
    for (const tubo of tubos) {
      const docRef = await addDoc(collection(db, 'materiais_tubos'), tubo);
      tuboIds.push(docRef.id);
    }
    console.log(`✅ ${tubos.length} tubos cadastrados\n`);
    
    // 4. Preços de Tubos
    console.log('💰 Cadastrando preços de tubos...');
    for (const preco of precosTubos) {
      await addDoc(collection(db, 'materiais_precos_tubos'), {
        tuboId: tuboIds[preco.tuboIndex],
        tipoInox: preco.tipoInox,
        precoKg: preco.precoKg,
        dataAtualizacao: new Date().toISOString(),
      });
    }
    console.log(`✅ ${precosTubos.length} preços de tubos cadastrados\n`);
    
    // 5. Cantoneiras
    console.log('📐 Cadastrando cantoneiras...');
    const cantoneiraIds: string[] = [];
    for (const cantoneira of cantoneiras) {
      const docRef = await addDoc(collection(db, 'materiais_cantoneiras'), cantoneira);
      cantoneiraIds.push(docRef.id);
    }
    console.log(`✅ ${cantoneiras.length} cantoneiras cadastradas\n`);
    
    // 6. Preços de Cantoneiras (304 padrão)
    console.log('💰 Cadastrando preços de cantoneiras...');
    for (const cantoneiraId of cantoneiraIds) {
      await addDoc(collection(db, 'materiais_precos_cantoneiras'), {
        cantoneiraId,
        tipoInox: '304',
        precoKg: 43.00,
        dataAtualizacao: new Date().toISOString(),
      });
    }
    console.log(`✅ ${cantoneiraIds.length} preços de cantoneiras cadastrados\n`);
    
    // 7. Acessórios
    console.log('🔧 Cadastrando acessórios...');
    for (const acessorio of acessorios) {
      await addDoc(collection(db, 'materiais_acessorios'), {
        ...acessorio,
        dataAtualizacao: new Date().toISOString(),
      });
    }
    console.log(`✅ ${acessorios.length} acessórios cadastrados\n`);
    
    // 8. Processos
    console.log('⚙️ Cadastrando processos...');
    for (const processo of processos) {
      await addDoc(collection(db, 'materiais_processos'), {
        ...processo,
        dataAtualizacao: new Date().toISOString(),
      });
    }
    console.log(`✅ ${processos.length} processos cadastrados\n`);
    
    // 9. Configurações
    console.log('⚙️ Cadastrando configurações...');
    await setDoc(doc(db, 'configuracoes', 'materiais'), configuracoes);
    console.log('✅ Configurações cadastradas\n');
    
    console.log('🎉 Banco de dados populado com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`- ${chapasPadrao.length} chapas padrão`);
    console.log(`- ${precosChapas.length} preços de chapas`);
    console.log(`- ${tubos.length} tubos`);
    console.log(`- ${precosTubos.length} preços de tubos`);
    console.log(`- ${cantoneiras.length} cantoneiras`);
    console.log(`- ${acessorios.length} acessórios`);
    console.log(`- ${processos.length} processos`);
    
  } catch (error) {
    console.error('❌ Erro ao popular banco de dados:', error);
    throw error;
  }
}

// Executar
popularBancoDeDados()
  .then(() => {
    console.log('\n✅ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
