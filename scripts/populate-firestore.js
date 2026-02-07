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

console.log('🔥 Iniciando população do Firestore...\n');

// Inicializar Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(new URL('../.secrets/serviceAccountKey.json', import.meta.url))
);

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);
const PROJECT_ID = serviceAccount.project_id;
const serverTimestamp = () => FieldValue.serverTimestamp();

// Empresa de exemplo (produção usaria o empresaId real)
const EMPRESA_ID = 'empresa-demo-001';

// ============================================================================
// DADOS DE EXEMPLO
// ============================================================================

const dadosExemplo = {
  clientes: [
    {
      empresaId: EMPRESA_ID,
      nome: 'Metalúrgica Silva & Cia',
      cnpj: '12345678000190',
      email: 'contato@metalurgicasilva.com.br',
      telefone: '11987654321',
      cidade: 'São Paulo',
      estado: 'SP',
      endereco: 'Rua das Indústrias, 1000',
      cep: '01234-567',
      status: 'Ativo',
      totalCompras: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      empresaId: EMPRESA_ID,
      nome: 'Construções Rodrigues LTDA',
      cnpj: '98765432000123',
      email: 'obras@construcoesrodrigues.com',
      telefone: '11976543210',
      cidade: 'Guarulhos',
      estado: 'SP',
      status: 'Ativo',
      totalCompras: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      empresaId: EMPRESA_ID,
      nome: 'Indústria Mecânica Santos',
      cnpj: '45678912000156',
      email: 'vendas@mecanicasantos.ind.br',
      telefone: '11965432109',
      cidade: 'São Bernardo do Campo',
      estado: 'SP',
      status: 'Ativo',
      totalCompras: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  ],

  materiais: [
    {
      empresaId: EMPRESA_ID,
      codigo: 'CHAPA-INOX-304-1.5',
      nome: 'Chapa Inox 304 - 1.5mm',
      tipo: 'Chapa',
      unidade: 'M2',
      espessura: 1.5,
      comprimento: 3000,
      largura: 1500,
      precoCusto: 150.00,
      precoVenda: 225.00,
      margemLucro: 50,
      estoqueMinimo: 10,
      estoqueAtual: 50,
      ativo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      empresaId: EMPRESA_ID,
      codigo: 'CHAPA-INOX-304-2.0',
      nome: 'Chapa Inox 304 - 2.0mm',
      tipo: 'Chapa',
      unidade: 'M2',
      espessura: 2.0,
      comprimento: 3000,
      largura: 1500,
      precoCusto: 180.00,
      precoVenda: 270.00,
      margemLucro: 50,
      estoqueMinimo: 10,
      estoqueAtual: 35,
      ativo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      empresaId: EMPRESA_ID,
      codigo: 'TUBO-INOX-304-50',
      nome: 'Tubo Inox 304 - Ø50mm',
      tipo: 'Tubo',
      unidade: 'M',
      comprimento: 6000,
      precoCusto: 85.00,
      precoVenda: 127.50,
      margemLucro: 50,
      estoqueMinimo: 20,
      estoqueAtual: 100,
      ativo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      empresaId: EMPRESA_ID,
      codigo: 'PERFIL-U-100',
      nome: 'Perfil U 100mm',
      tipo: 'Perfil',
      unidade: 'M',
      comprimento: 6000,
      largura: 100,
      precoCusto: 45.00,
      precoVenda: 67.50,
      margemLucro: 50,
      estoqueMinimo: 30,
      estoqueAtual: 80,
      ativo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      empresaId: EMPRESA_ID,
      codigo: 'PARAFUSO-INOX-M8',
      nome: 'Parafuso Inox M8x20',
      tipo: 'Acessorio',
      unidade: 'UN',
      precoCusto: 0.50,
      precoVenda: 1.00,
      margemLucro: 100,
      estoqueMinimo: 500,
      estoqueAtual: 2000,
      ativo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  ],

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

  produtos: [
    {
      codigo: 'PRD-INOX-001',
      nome: 'Bancada Inox 304 2m',
      descricao: 'Bancada industrial em inox 304',
      tipo: 'Produto',
      unidade: 'UN',
      preco: 2500.0,
      custo: 1650.0,
      estoque: 5,
      estoqueMinimo: 2,
      ativo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      codigo: 'PRD-INOX-002',
      nome: 'Prateleira Inox 1m',
      descricao: 'Prateleira inox para cozinha industrial',
      tipo: 'Produto',
      unidade: 'UN',
      preco: 600.0,
      custo: 380.0,
      estoque: 12,
      estoqueMinimo: 3,
      ativo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  ],

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

  usuarios: [
    {
      nome: 'Admin Seed',
      email: 'admin@inoxval.com',
      role: 'Administrador',
      ativo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  ],
};

// ============================================================================
// FUNÇÕES DE POPULAÇÃO
// ============================================================================

async function popularClientes() {
  console.log('📋 Criando clientes...');
  let count = 0;
  const created = [];
  
  for (const cliente of dadosExemplo.clientes) {
    try {
      const docRef = await db.collection('clientes').add(cliente);
      console.log(`  ✅ Cliente criado: ${cliente.nome} (${docRef.id})`);
      count++;
      created.push({ id: docRef.id, nome: cliente.nome });
    } catch (error) {
      console.error(`  ❌ Erro ao criar ${cliente.nome}:`, error.message);
    }
  }
  
  console.log(`✅ ${count}/${dadosExemplo.clientes.length} clientes criados\n`);
  return created;
}

async function popularMateriais() {
  console.log('📦 Criando materiais...');
  let count = 0;
  
  for (const material of dadosExemplo.materiais) {
    try {
      const docRef = await db.collection('materiais').add(material);
      console.log(`  ✅ Material criado: ${material.nome} (${docRef.id})`);
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
      
    } catch (error) {
      console.error(`  ❌ Erro ao criar ${material.nome}:`, error.message);
    }
  }
  
  console.log(`✅ ${count}/${dadosExemplo.materiais.length} materiais + estoques criados\n`);
  return count;
}

async function popularProdutos() {
  console.log('🧱 Criando produtos...');
  let count = 0;
  const created = [];

  for (const produto of dadosExemplo.produtos) {
    try {
      const docRef = await db.collection('produtos').add({
        ...produto,
        empresaId: EMPRESA_ID,
      });
      console.log(`  ✅ Produto criado: ${produto.nome} (${docRef.id})`);
      count++;
      created.push({ id: docRef.id, ...produto });
    } catch (error) {
      console.error(`  ❌ Erro ao criar ${produto.nome}:`, error.message);
    }
  }

  console.log(`✅ ${count}/${dadosExemplo.produtos.length} produtos criados\n`);
  return created;
}

async function popularEstoqueItens(produtosCriados) {
  console.log('📦 Criando estoque_itens...');
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
      console.log(`  ✅ Estoque criado: ${produto.nome} (${docRef.id})`);
      count++;
    } catch (error) {
      console.error(`  ❌ Erro ao criar estoque para ${produto.nome}:`, error.message);
    }
  }

  console.log(`✅ ${count} itens de estoque criados\n`);
  return count;
}

async function criarMovimentoEstoque(produto) {
  console.log('📦 Criando estoque_movimentos...');
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
    console.log(`  ✅ Movimento criado (${docRef.id})`);
    console.log(`✅ 1 movimento criado\n`);
    return docRef.id;
  } catch (error) {
    console.error('  ❌ Erro ao criar movimento de estoque:', error.message);
    return null;
  }
}

async function criarCompraExemplo(produto) {
  console.log('🧾 Criando compra (nova coleção)...');

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
    console.log(`  ✅ Compra criada: ${compra.numero} (${docRef.id})`);
    console.log('✅ 1 compra criada\n');
    return docRef.id;
  } catch (error) {
    console.error('  ❌ Erro ao criar compra:', error.message);
    return null;
  }
}

async function criarConfiguracoes() {
  console.log('⚙️ Criando configurações...');
  let count = 0;

  for (const config of dadosExemplo.configuracoes) {
    try {
      const docRef = await db.collection('configuracoes').add({
        ...config,
        empresaId: EMPRESA_ID,
      });
      console.log(`  ✅ Config criada: ${config.tipo} v${config.versao} (${docRef.id})`);
      count++;
    } catch (error) {
      console.error(`  ❌ Erro ao criar config ${config.tipo}:`, error.message);
    }
  }

  console.log(`✅ ${count}/${dadosExemplo.configuracoes.length} configurações criadas\n`);
  return count;
}

async function criarUsuariosExemplo() {
  console.log('👥 Criando usuário seed...');
  const user = dadosExemplo.usuarios[0];
  try {
    const payload = {
      ...user,
      empresaId: EMPRESA_ID,
    };

    const userId = 'seed-admin';
    await db.collection('usuarios').doc(userId).set(payload);
    await db.collection('users').doc(userId).set(payload);
    console.log(`  ✅ Usuário criado: ${user.email} (id: ${userId})`);
    console.log('✅ 1 usuário criado\n');
    return userId;
  } catch (error) {
    console.error('  ❌ Erro ao criar usuário:', error.message);
    return null;
  }
}

async function criarCalculoEvento(userId) {
  console.log('🧮 Criando cálculo (calculos)...');
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
    console.log(`  ✅ Cálculo criado (${docRef.id})`);
    console.log('✅ 1 cálculo criado\n');
    return docRef.id;
  } catch (error) {
    console.error('  ❌ Erro ao criar cálculo:', error.message);
    return null;
  }
}

async function popularEmpresas() {
  console.log('🏢 Criando empresa...');
  let count = 0;
  
  for (const empresa of dadosExemplo.empresas) {
    try {
      await db.collection('empresas').doc(empresa.id).set(empresa);
      console.log(`  ✅ Empresa criada: ${empresa.nomeFantasia}`);
      count++;
    } catch (error) {
      console.error(`  ❌ Erro ao criar empresa:`, error.message);
    }
  }
  
  console.log(`✅ ${count}/${dadosExemplo.empresas.length} empresas criadas\n`);
  return count;
}

async function criarOrcamentoExemplo(clienteId, clienteNome) {
  console.log('💰 Criando orçamento de exemplo...');
  
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
    console.log(`  ✅ Orçamento criado: ${orcamento.numero} (${docRef.id})`);
    console.log(`✅ 1 orçamento criado\n`);
    return docRef.id;
  } catch (error) {
    console.error(`  ❌ Erro ao criar orçamento:`, error.message);
    return null;
  }
}

async function criarOrdemProducao(orcamentoId, orcamentoNumero, clienteId, clienteNome) {
  console.log('🏭 Criando ordem de produção...');
  
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
    console.log(`  ✅ Ordem de produção criada: ${ordem.numero} (${docRef.id})`);
    console.log(`✅ 1 ordem de produção criada\n`);
    return docRef.id;
  } catch (error) {
    console.error(`  ❌ Erro ao criar ordem:`, error.message);
    return null;
  }
}

async function criarSolicitacaoCompra() {
  console.log('🛒 Criando solicitação de compra...');
  
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
    console.log(`  ✅ Solicitação criada: ${solicitacao.numero} (${docRef.id})`);
    console.log(`✅ 1 solicitação de compra criada\n`);
    return docRef.id;
  } catch (error) {
    console.error(`  ❌ Erro ao criar solicitação:`, error.message);
    return null;
  }
}

async function criarApontamento(ordemId) {
  console.log('📊 Criando apontamento de produção...');
  
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
    console.log(`  ✅ Apontamento criado (${docRef.id})`);
    console.log(`✅ 1 apontamento criado\n`);
    return docRef.id;
  } catch (error) {
    console.error(`  ❌ Erro ao criar apontamento:`, error.message);
    return null;
  }
}

// ============================================================================
// EXECUTAR POPULAÇÃO
// ============================================================================

async function popularBancoDeDados() {
  try {
    console.log('════════════════════════════════════════════════════════════');
    console.log('🔥 POPULAÇÃO DO FIRESTORE - ERP INDUSTRIAL');
    console.log('════════════════════════════════════════════════════════════\n');

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

    console.log('════════════════════════════════════════════════════════════');
    console.log('🎉 POPULAÇÃO CONCLUÍDA!');
    console.log('════════════════════════════════════════════════════════════\n');
    console.log(`✅ Total de documentos criados: ${totalCriado}`);
    console.log(`\n📊 Coleções criadas no Firestore:`);
    console.log(`   - empresas (1 documento)`);
    console.log(`   - usuarios (1 documento)`);
    console.log(`   - users (1 documento)`);
    console.log(`   - clientes (${dadosExemplo.clientes.length} documentos)`);
    console.log(`   - materiais (${dadosExemplo.materiais.length} documentos)`);
    console.log(`   - estoque_materiais (${dadosExemplo.materiais.length} documentos)`);
    console.log(`   - produtos (${dadosExemplo.produtos.length} documentos)`);
    console.log(`   - estoque_itens (${dadosExemplo.produtos.length} documentos)`);
    console.log(`   - estoque_movimentos (1 documento)`);
    console.log(`   - compras (1 documento)`);
    console.log(`   - configuracoes (${dadosExemplo.configuracoes.length} documentos)`);
    console.log(`   - orcamentos (1 documento)`);
    console.log(`   - ordens_producao (1 documento)`);
    console.log(`   - apontamentos (1 documento)`);
    console.log(`   - solicitacoes_compra (1 documento)`);
    console.log(`   - calculos (1 documento)`);
    console.log(`\n🔍 Acesse o Firebase Console para visualizar:`);
    console.log(`   https://console.firebase.google.com/project/${PROJECT_ID}/firestore`);
    console.log('\n✅ Banco de dados criado com sucesso!');
    
  } catch (error) {
    console.error('\n❌ ERRO ao popular banco de dados:', error);
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
    console.error('\n❌ Script finalizado com erro:', error);
    process.exit(1);
  });
