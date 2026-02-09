/**
 * ============================================================================
 * SCRIPT: POPULAR BANCO DE DADOS FIRESTORE
 * ============================================================================
 * 
 * Este script cria automaticamente TODAS as coleções do Firestore
 * inserindo dados de exemplo em cada uma.
 * 
 * COMO USAR:
 * 1. Certifique-se que o .env está configurado
 * 2. Execute: node scripts/populate-firestore.js
 * 3. Aguarde a criação de todas as coleções
 * 
 * COLEÇÕES CRIADAS:
 * - empresas (1 empresa)
 * - usuarios + users (1 usuário seed)
 * - clientes (3 clientes)
 * - materiais (5 materiais)
 * - estoque_materiais (5 itens)
 * - produtos (2 produtos)
 * - estoque_itens (2 itens)
 * - estoque_movimentos (1 movimento)
 * - compras (1 compra)
 * - configuracoes (2 configs)
 * - orcamentos (1 orçamento)
 * - ordens_producao (1 ordem)
 * - solicitacoes_compra (1 solicitação)
 * - apontamentos (1 apontamento)
 * - calculos (1 cálculo)
 * 
 * ============================================================================
 */

import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import {
  getFirestore,
  FieldValue
} from 'firebase-admin/firestore';

const QUIET = process.env.SEED_QUIET === 'true';
const log = (...args) => {
  if (!QUIET) console.log(...args);

const info = (...args) => {
  if (!QUIET) console.info(...args);

const warn = (...args) => console.warn(...args);
const logError = (...args) => console.error(...args);

log('🔥 Iniciando população do Firestore...\n');

// Inicializar Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(new URL('../.secrets/serviceAccountKey.json', import.meta.url))
);

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);
const PROJECT_ID = serviceAccount.project_id;
const serverTimestamp = () => FieldValue.serverTimestamp();

// Empresa de exemplo (use SEED_EMPRESA_ID para alinhar com o app)
const EMPRESA_ID = process.env.SEED_EMPRESA_ID || 'empresa-demo-001';

// ============================================================================
// DADOS DE EXEMPLO
// ============================================================================


// Funções utilitárias para gerar dados mock
function gerarClientesMock(qtd) {
  return Array.from({ length: qtd }, (_, i) => ({
    empresaId: EMPRESA_ID,
    nome: `Cliente Teste ${i + 1}`,
    cnpj: `${10000000000000 + i}`,
    email: `cliente${i + 1}@teste.com`,
    telefone: `1199${String(1000000 + i).slice(1)}`,
    cidade: 'São Paulo',
    estado: 'SP',
    endereco: `Rua Teste, ${i + 1}`,
    cep: '01234-567',
    status: 'Ativo',
    totalCompras: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
}

function gerarMateriaisMock(qtd) {
  return Array.from({ length: qtd }, (_, i) => ({
    empresaId: EMPRESA_ID,
    codigo: `MAT-${i + 1}`,
    nome: `Material Teste ${i + 1}`,

    data: new Date().toISOString(),
    validade: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
    status: 'Aprovado',
    itens: [],
    subtotal: 1000 + i * 10,
    desconto: 0,
    descontoPercentual: 0,
    total: 1000 + i * 10,
    observacoes: 'Orçamento mock',
    condicoesPagamento: '50% entrada, 50% na entrega',
    prazoEntrega: '15 dias úteis',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    aprovadoEm: serverTimestamp(),
  }));
}

function gerarComprasMock(qtd) {
  return Array.from({ length: qtd }, (_, i) => ({
    empresaId: EMPRESA_ID,
    numero: `CMP-${2026}-${i + 1}`,
    data: new Date().toISOString(),
    status: i % 3 === 0 ? 'PENDENTE' : (i % 3 === 1 ? 'AGUARDANDO_APROVACAO' : 'CONCLUIDA'),
    fornecedorNome: `Fornecedor ${i + 1}`,
    itens: [],
    total: 500 + i * 10,
    justificativa: 'Compra mock',
    observacoes: 'Compra criada pelo seed',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isDeleted: false,
  }));
}

function gerarOrdensProducaoMock(qtd, orcamentos, clientes) {
  return Array.from({ length: qtd }, (_, i) => ({
    empresaId: EMPRESA_ID,
    numero: `OP-${2026}-${i + 1}`,
    orcamentoId: orcamentos[i % orcamentos.length]?.id || 'orcamento-temp',
    orcamentoNumero: orcamentos[i % orcamentos.length]?.numero || 'ORC-temp',
    clienteId: clientes[i % clientes.length]?.id || 'cliente-temp',
    clienteNome: clientes[i % clientes.length]?.nome || 'Cliente Seed',
    status: i % 4 === 0 ? 'Aberta' : (i % 4 === 1 ? 'Em Produção' : (i % 4 === 2 ? 'Pausada' : 'Concluída')),
    dataAbertura: new Date().toISOString(),
    prioridade: 'Normal',
    prazoEntrega: new Date(Date.now() + 15*24*60*60*1000).toISOString(),
    itens: [],
    observacoes: 'Ordem mock',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
}

const dadosExemplo = {
  clientes: gerarClientesMock(50),
  materiais: gerarMateriaisMock(50),
  empresas: [
    {
      id: EMPRESA_ID,
      empresaId: EMPRESA_ID,
      razaoSocial: 'Inox Val Indústria e Comércio LTDA',
      nomeFantasia: 'Inox Val',
      cnpj: '12345678000199',
      inscricaoEstadual: '123456789',
      email: 'contato@inoxval.com.br',
      telefone: '11912345678',
      endereco: 'Avenida Industrial, 500',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      ativo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  ],
  produtos: gerarProdutosMock(50),
  configuracoes: [
    {
      tipo: 'CUSTOS',
      versao: 1,
      ativa: true,
      dados: {
        margemPadrao: 35,
        impostosPercentual: 8.5,


  configuracoes: [
    {
      tipo: 'CUSTOS',
      versao: 1,
      ativa: true,
      dados: {
        margemPadrao: 35,
        impostosPercentual: 8.5,
        maoObraHora: 65,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      tipo: 'CALCULADORA',
      versao: 1,
      ativa: true,
      dados: {
        chapaPadrao: '3000x1500',
        desperdicioPadrao: 6,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  ],




// ============================================================================
// FUNÇÕES DE POPULAÇÃO
// ============================================================================

async function popularClientes() {
  info('📋 Criando clientes...');
  let count = 0;
  const created = [];
  
  for (const cliente of dadosExemplo.clientes) {
    try {
      const docRef = await db.collection('clientes').add(cliente);
      log(`  ✅ Cliente criado: ${cliente.nome} (${docRef.id})`);
      count++;
      created.push({ id: docRef.id, nome: cliente.nome });
  
  
  
    } catch (err) {
      logError(`  ❌ Erro ao criar ${cliente.nome}:`, err?.message);
    }
  }
  
  info(`✅ ${count}/${dadosExemplo.clientes.length} clientes criados\n`);
  return created;
}

async function popularMateriais() {
  info('📦 Criando materiais...');
  let count = 0;
  
  for (const material of dadosExemplo.materiais) {
    try {
      const docRef = await db.collection('materiais').add(material);
      log(`  ✅ Material criado: ${material.nome} (${docRef.id})`);
      count++;
      
      // Criar estoque para este material
      await db.collection('estoque_materiais').add({
        empresaId: EMPRESA_ID,
        materialId: docRef.id,
        materialNome: material.nome,
        materialCodigo: material.codigo,
        quantidade: material.estoqueAtual,
        unidade: material.unidade,
        localizacao: 'Galpão A - Prateleira 1',
        lote: `LOTE-${Date.now()}`,
        dataEntrada: new Date().toISOString(),
        ultimaMovimentacao: new Date().toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
    } catch (err) {
      logError(`  ❌ Erro ao criar ${material.nome}:`, err?.message);
    }
  }
  
  info(`✅ ${count}/${dadosExemplo.materiais.length} materiais + estoques criados\n`);
  return count;
}

async function popularProdutos() {
  info('🧱 Criando produtos...');
  let count = 0;
  const created = [];

  for (const produto of dadosExemplo.produtos) {
    try {
      const docRef = await db.collection('produtos').add({
        ...produto,
        empresaId: EMPRESA_ID,
      });
      log(`  ✅ Produto criado: ${produto.nome} (${docRef.id})`);
      count++;
      created.push({ id: docRef.id, ...produto });
    } catch (err) {
      logError(`  ❌ Erro ao criar ${produto.nome}:`, err?.message);
    }
  }

  info(`✅ ${count}/${dadosExemplo.produtos.length} produtos criados\n`);
  return created;
}

async function popularEstoqueItens(produtosCriados) {
  info('📦 Criando estoque_itens...');
  let count = 0;

  for (const produto of produtosCriados) {
    try {
      const docRef = await db.collection('estoque_itens').add({
        empresaId: EMPRESA_ID,
        produtoId: produto.id,
        produtoNome: produto.nome,
        produtoCodigo: produto.codigo,
        saldo: produto.estoque || 0,
        saldoDisponivel: produto.estoque || 0,
        saldoReservado: 0,
        estoqueMinimo: produto.estoqueMinimo || 0,
        unidade: produto.unidade,
        ultimaMovimentacao: new Date().toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      log(`  ✅ Estoque criado: ${produto.nome} (${docRef.id})`);
      count++;
    } catch (err) {
      logError(`  ❌ Erro ao criar estoque para ${produto.nome}:`, err?.message);
    }
  }

  info(`✅ ${count} itens de estoque criados\n`);
  return count;
}

async function criarMovimentoEstoque(produto) {
  info('📦 Criando estoque_movimentos...');
  try {
    const docRef = await db.collection('estoque_movimentos').add({
      empresaId: EMPRESA_ID,
      produtoId: produto.id,
      produtoNome: produto.nome,
      produtoCodigo: produto.codigo,
      tipo: 'ENTRADA',
      quantidade: produto.estoque || 0,
      saldoAnterior: 0,
      saldoNovo: produto.estoque || 0,
      origem: 'Carga inicial',
      observacoes: 'Movimento criado no seed',
      usuario: 'seed-script',
      data: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: 'seed-script',
      updatedBy: 'seed-script',
      isDeleted: false,
    });
    log(`  ✅ Movimento criado (${docRef.id})`);
    info(`✅ 1 movimento criado\n`);
    return docRef.id;
  } catch (err) {
    logError('  ❌ Erro ao criar movimento de estoque:', err?.message);
    return null;
  }
}

async function criarCompraExemplo(produto) {
  info('🧾 Criando compra (nova coleção)...');

  const compra = {
    empresaId: EMPRESA_ID,
    numero: `CMP-${new Date().getFullYear()}-001`,
    data: new Date().toISOString(),
    status: 'Solicitada',
    fornecedorNome: 'Fornecedor Exemplo',
    itens: [
      {
        id: '1',
        produtoId: produto.id,
        produtoNome: produto.nome,
        quantidade: 2,
        unidade: produto.unidade,
        precoUnitario: produto.custo,
        subtotal: produto.custo * 2,
      },
    ],
    total: produto.custo * 2,
    justificativa: 'Reposição de estoque',
    observacoes: 'Compra criada pelo seed',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = await db.collection('compras').add(compra);
    log(`  ✅ Compra criada: ${compra.numero} (${docRef.id})`);
    info('✅ 1 compra criada\n');
    return docRef.id;
  } catch (err) {
    logError('  ❌ Erro ao criar compra:', err?.message);
    return null;
  }
}

async function criarConfiguracoes() {
  info('⚙️ Criando configurações...');
  let count = 0;

  for (const config of dadosExemplo.configuracoes) {
    try {
      const docRef = await db.collection('configuracoes').add({
        ...config,
        empresaId: EMPRESA_ID,
      });
      log(`  ✅ Config criada: ${config.tipo} v${config.versao} (${docRef.id})`);
      count++;
    } catch (err) {
      logError(`  ❌ Erro ao criar config ${config.tipo}:`, err?.message);
    }
  }

  info(`✅ ${count}/${dadosExemplo.configuracoes.length} configurações criadas\n`);
  return count;
}

async function criarUsuariosExemplo() {
  info('👥 Criando usuário seed...');
  const user = dadosExemplo.usuarios[0];
  try {
    const payload = {
      ...user,
      empresaId: EMPRESA_ID,
    };

    const userId = 'seed-admin';
    await db.collection('usuarios').doc(userId).set(payload);
    await db.collection('users').doc(userId).set(payload);
    log(`  ✅ Usuário criado: ${user.email} (id: ${userId})`);
    info('✅ 1 usuário criado\n');
    return userId;
  } catch (err) {
    logError('  ❌ Erro ao criar usuário:', err?.message);
    return null;
  }
}

async function criarCalculoEvento(userId) {
  info('🧮 Criando cálculo (calculos)...');
  try {
    const docRef = await db.collection('calculos').add({
      empresaId: EMPRESA_ID,
      userId: userId || 'seed-script',
      timestamp: serverTimestamp(),
      modelo: 'MPLC',
      inputs: { comprimento: 2000, largura: 800, altura: 850 },
      outputs: { custoTotal: 1250.5, precoFinal: 1850.0 },
      configSnapshot: { versaoCustos: 1, versaoCalc: 1 },
      durationMs: 420,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    log(`  ✅ Cálculo criado (${docRef.id})`);
    info('✅ 1 cálculo criado\n');
    return docRef.id;
  } catch (err) {
    logError('  ❌ Erro ao criar cálculo:', err?.message);
    return null;
  }
}

async function popularEmpresas() {
  info('🏢 Criando empresa...');
  let count = 0;
  
  for (const empresa of dadosExemplo.empresas) {
    try {
      await db.collection('empresas').doc(empresa.id).set(empresa);
      log(`  ✅ Empresa criada: ${empresa.nomeFantasia}`);
      count++;
    } catch (err) {
      logError(`  ❌ Erro ao criar empresa:`, err?.message);
    }
  }
  
  info(`✅ ${count}/${dadosExemplo.empresas.length} empresas criadas\n`);
  return count;
}

async function criarOrcamentoExemplo(clienteId, clienteNome) {
  info('💰 Criando orçamento de exemplo...');
  
  const orcamento = {
    empresaId: EMPRESA_ID,
    numero: `ORC-${new Date().getFullYear()}-001`,
    clienteId: clienteId,
    clienteNome: clienteNome,
    data: new Date().toISOString(),
    validade: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
    status: 'Aprovado',
    itens: [
      {
        id: '1',
        modeloId: 'portas-janelas-basculante',
        quantidade: 5,
        precoUnitario: 850.00,
        subtotal: 4250.00,
        especificacoes: {
          comprimento: 1200,
          largura: 800,
          espessura: 1.5,
          acabamento: 'Lixado',
          observacoes: 'Com dobradiças e fechadura',
        },
        bom: [
          {
            materialId: 'chapa-inox-304',
            tipo: 'Chapa',
            quantidade: 3.5,
            unidade: 'M2',
          },
          {
            materialId: 'perfil-u-100',
            tipo: 'Perfil',
            quantidade: 12,
            unidade: 'M',
          },
        ],
      },
    ],
    subtotal: 4250.00,
    desconto: 0,
    descontoPercentual: 0,
    total: 4250.00,
    observacoes: 'Prazo de entrega: 15 dias úteis',
    condicoesPagamento: '50% entrada, 50% na entrega',
    prazoEntrega: '15 dias úteis',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    aprovadoEm: serverTimestamp(),
  };
  
  try {
    const docRef = await db.collection('orcamentos').add(orcamento);
    log(`  ✅ Orçamento criado: ${orcamento.numero} (${docRef.id})`);
    info(`✅ 1 orçamento criado\n`);
    return docRef.id;
  } catch (err) {
    logError(`  ❌ Erro ao criar orçamento:`, err?.message);
    return null;
  }
}

async function criarOrdemProducao(orcamentoId, orcamentoNumero, clienteId, clienteNome) {
  info('🏭 Criando ordem de produção...');
  
  const ordem = {
    empresaId: EMPRESA_ID,
    numero: `OP-${new Date().getFullYear()}-001`,
    orcamentoId: orcamentoId,
    orcamentoNumero: orcamentoNumero,
    clienteId: clienteId,
    clienteNome: clienteNome,
    status: 'Aberta',
    dataAbertura: new Date().toISOString(),
    prioridade: 'Normal',
    prazoEntrega: new Date(Date.now() + 15*24*60*60*1000).toISOString(),
    itens: [
      {
        id: '1',
        modeloId: 'portas-janelas-basculante',
        quantidade: 5,
        quantidadeProduzida: 0,
        especificacoes: {
          comprimento: 1200,
          largura: 800,
          espessura: 1.5,
          acabamento: 'Lixado',
        },
        bom: [
          {
            materialId: 'chapa-inox-304',
            tipo: 'Chapa',
            quantidade: 3.5,
            unidade: 'M2',
          },
        ],
      },
    ],
    observacoes: 'Cliente precisa urgente',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  try {
    const docRef = await db.collection('ordens_producao').add(ordem);
    log(`  ✅ Ordem de produção criada: ${ordem.numero} (${docRef.id})`);
    info(`✅ 1 ordem de produção criada\n`);
    return docRef.id;
  } catch (err) {
    logError(`  ❌ Erro ao criar ordem:`, err?.message);
    return null;
  }
}

async function criarSolicitacaoCompra() {
  info('🛒 Criando solicitação de compra...');
  
  const solicitacao = {
    empresaId: EMPRESA_ID,
    numero: `SC-${new Date().getFullYear()}-001`,
    dataSolicitacao: new Date().toISOString(),
    status: 'Pendente',
    solicitante: 'João Silva',
    urgencia: 'Normal',
    itens: [
      {
        materialCodigo: 'CHAPA-INOX-304-1.5',
        materialNome: 'Chapa Inox 304 - 1.5mm',
        quantidade: 20,
        unidade: 'M2',
        motivoSolicitacao: 'Estoque abaixo do mínimo',
      },
    ],
    observacoes: 'Solicitar orçamento com 3 fornecedores',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  try {
    const docRef = await db.collection('solicitacoes_compra').add(solicitacao);
    log(`  ✅ Solicitação criada: ${solicitacao.numero} (${docRef.id})`);
    info(`✅ 1 solicitação de compra criada\n`);
    return docRef.id;
  } catch (err) {
    logError(`  ❌ Erro ao criar solicitação:`, err?.message);
    return null;
  }
}

async function criarApontamento(ordemId) {
  info('📊 Criando apontamento de produção...');
  
  const apontamento = {
    empresaId: EMPRESA_ID,
    ordemId: ordemId,
    itemId: '1',
    operador: 'Carlos Oliveira',
    maquina: 'CNC-001',
    dataInicio: serverTimestamp(),
    status: 'EmAndamento',
    quantidadeProduzida: 0,
    observacoes: 'Iniciando corte das chapas',
    createdAt: serverTimestamp(),
  };
  
  try {
    const docRef = await db.collection('apontamentos').add(apontamento);
    log(`  ✅ Apontamento criado (${docRef.id})`);
    info(`✅ 1 apontamento criado\n`);
    return docRef.id;
  } catch (err) {
    logError(`  ❌ Erro ao criar apontamento:`, err?.message);
    return null;
  }
}

// ============================================================================
// EXECUTAR POPULAÇÃO
// ============================================================================

async function popularBancoDeDados() {
  try {
    log('════════════════════════════════════════════════════════════');
    log('🔥 POPULAÇÃO DO FIRESTORE - ERP INDUSTRIAL');
    log('════════════════════════════════════════════════════════════\n');

    let totalCriado = 0;

    // 1. Criar empresa
    totalCriado += await popularEmpresas();

    // 2. Criar usuários
    const userId = await criarUsuariosExemplo();
    if (userId) totalCriado++;

    // 3. Criar clientes
    const clientesCriados = await popularClientes();
    totalCriado += clientesCriados.length;

    // 4. Criar materiais + estoque legacy
    totalCriado += await popularMateriais();

    // 5. Criar produtos (novo)
    const produtosCriados = await popularProdutos();
    totalCriado += produtosCriados.length;

    // 6. Criar estoque_itens (novo)
    totalCriado += await popularEstoqueItens(produtosCriados);

    // 7. Criar movimento de estoque (novo)
    if (produtosCriados[0]) {
      const movimentoId = await criarMovimentoEstoque(produtosCriados[0]);
      if (movimentoId) totalCriado++;
    }

    // 8. Criar configurações
    totalCriado += await criarConfiguracoes();

    // 9. Criar compra (novo)
    if (produtosCriados[0]) {
      const compraId = await criarCompraExemplo(produtosCriados[0]);
      if (compraId) totalCriado++;
    }
    
    // 10. Criar orçamento (usa primeiro cliente)
    const primeiroCliente = clientesCriados[0];
    const orcamentoId = await criarOrcamentoExemplo(
      primeiroCliente?.id || 'cliente-temp-001',
      primeiroCliente?.nome || 'Cliente Seed'
    );
    if (orcamentoId) totalCriado++;

    // 11. Criar ordem de produção
    if (orcamentoId) {
      const ordemId = await criarOrdemProducao(
        orcamentoId,
        `ORC-${new Date().getFullYear()}-001`,
        primeiroCliente?.id || 'cliente-temp-001',
        primeiroCliente?.nome || 'Cliente Seed'
      );
      if (ordemId) {
        totalCriado++;
        
        // 12. Criar apontamento
        const apontamentoId = await criarApontamento(ordemId);
        if (apontamentoId) totalCriado++;
      }
    }

    // 13. Criar solicitação de compra (legacy)
    const solicitacaoId = await criarSolicitacaoCompra();
    if (solicitacaoId) totalCriado++;

    // 14. Criar cálculo (novo)
    const calculoId = await criarCalculoEvento(userId);
    if (calculoId) totalCriado++;

    info(`✅ Total de documentos criados: ${totalCriado}`);
    if (!QUIET) {
      console.log(`\n🔍 Acesse o Firebase Console para visualizar:`);
      console.log(`   https://console.firebase.google.com/project/${PROJECT_ID}/firestore`);
    }
    info('\n✅ Banco de dados criado com sucesso!');
    
  } catch (err) {
    logError('\n❌ ERRO ao popular banco de dados:', err);
    throw err;
  }
}

// Executar
popularBancoDeDados()
  .then(() => {
    console.log('\n✅ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script finalizado com erro:', error);
    process.exit(1);
  });
