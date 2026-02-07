/**
 * ============================================================================
 * PÁGINA PARA POPULAR BANCO DE DADOS COM DADOS DE EXEMPLO
 * ============================================================================
 * 
 * Esta página usa os Firebase Services (como no tutorial INTEGRATION_EXAMPLE)
 * para criar todos os dados iniciais do sistema.
 * 
 * ⚠️ NÃO PRECISA DE LOGIN - Usa empresaId fixo (ou UID) para demonstração
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { getFirebaseAuth, setEmpresaContext } from '@/lib/firebase';
import { signInAnonymously, createUserWithEmailAndPassword } from 'firebase/auth';
import { clientesService } from '@/services/firebase/clientes.service';
import { orcamentosService } from '@/services/firebase/orcamentos.service';
import { ordensService } from '@/services/firebase/ordens.service';
import { toast } from 'sonner';

interface LogEntry {
  tipo: 'info' | 'success' | 'error';
  mensagem: string;
  timestamp: Date;
}

export default function PopularBanco() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [totalCriado, setTotalCriado] = useState(0);
  const [autenticado, setAutenticado] = useState(false);
  const [autenticando, setAutenticando] = useState(true);
  const defaultEmpresaId = import.meta.env.VITE_DEFAULT_EMPRESA_ID || null;

  // Fazer login anônimo automaticamente
  useEffect(() => {
    async function fazerLoginAnonimo() {
      try {
        const auth = getFirebaseAuth();
        if (!auth) {
          throw new Error('Firebase Auth não inicializado');
        }

        // Se já está autenticado, não precisa fazer nada
        if (auth.currentUser) {
          const empresaId = defaultEmpresaId ?? auth.currentUser.uid ?? null;
          setEmpresaContext(empresaId);
          setAutenticado(true);
          setAutenticando(false);
          return;
        }

        // Login anônimo
        const result = await signInAnonymously(auth);
        const empresaId = defaultEmpresaId ?? result.user.uid;
        setEmpresaContext(empresaId);
        setAutenticado(true);
        setAutenticando(false);
      } catch (error: any) {
        console.error('Erro ao fazer login anônimo:', error);
        toast.error('Erro ao inicializar Firebase');
        setAutenticando(false);
      }
    }

    fazerLoginAnonimo();
  }, []);

  function addLog(mensagem: string, tipo: 'info' | 'success' | 'error' = 'info') {
    setLogs((prev) => [...prev, { mensagem, tipo, timestamp: new Date() }]);
  }

  async function popularBanco() {
    setLoading(true);
    setLogs([]);
    setTotalCriado(0);
    let contador = 0;

    try {
      addLog('🔥 Iniciando população do banco de dados...', 'info');

      // ============================================================================
      // 0. CRIAR CONTA ADMIN
      // ============================================================================
      addLog('👤 Criando conta de administrador...', 'info');
      
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error('Firebase Auth não inicializado');
      }

      try {
        // Tentar criar conta admin
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          'admin@inoxval.com',
          'Admin123!'
        );
        addLog('  ✅ Conta admin criada: admin@inoxval.com / Admin123!', 'success');
        addLog('  📧 Email: admin@inoxval.com', 'info');
        addLog('  🔑 Senha: Admin123!', 'info');
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          addLog('  ℹ️ Conta admin já existe: admin@inoxval.com / Admin123!', 'info');
        } else {
          addLog(`  ⚠️ Erro ao criar admin: ${error.message}`, 'error');
        }
      }

      addLog('', 'info');

      // ============================================================================
      // 1. CRIAR CLIENTES
      // ============================================================================
      addLog('📋 Criando clientes...', 'info');

      const cliente1Result = await clientesService.create({
        nome: 'Metalúrgica Silva & Cia',
        cnpj: '12345678000190',
        email: 'contato@metalurgicasilva.com.br',
        telefone: '11987654321',
        endereco: 'Rua da Indústria, 100',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01000-000',
        status: 'Ativo',
        totalCompras: 0,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      });

      if (cliente1Result.success && cliente1Result.data) {
        addLog(`  ✅ Cliente criado: ${cliente1Result.data.nome}`, 'success');
        contador++;
      } else {
        addLog(`  ❌ Erro ao criar cliente 1: ${cliente1Result.error}`, 'error');
      }

      const cliente2Result = await clientesService.create({
        nome: 'Construções Rodrigues LTDA',
        cnpj: '98765432000123',
        email: 'obras@construcoesrodrigues.com',
        telefone: '11976543210',
        endereco: 'Av. das Obras, 500',
        cidade: 'Guarulhos',
        estado: 'SP',
        cep: '07000-000',
        status: 'Ativo',
        totalCompras: 0,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      });

      if (cliente2Result.success && cliente2Result.data) {
        addLog(`  ✅ Cliente criado: ${cliente2Result.data.nome}`, 'success');
        contador++;
      }

      const cliente3Result = await clientesService.create({
        nome: 'Indústria Mecânica Santos',
        cnpj: '45678912000156',
        email: 'vendas@mecanicasantos.ind.br',
        telefone: '11965432109',
        endereco: 'Rua Industrial, 250',
        cidade: 'São Bernardo do Campo',
        estado: 'SP',
        cep: '09000-000',
        status: 'Ativo',
        totalCompras: 0,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      });

      if (cliente3Result.success && cliente3Result.data) {
        addLog(`  ✅ Cliente criado: ${cliente3Result.data.nome}`, 'success');
        contador++;
      }

      // Pegar o primeiro cliente para usar no orçamento
      const clienteId = cliente1Result.data?.id;
      const clienteNome = cliente1Result.data?.nome;

      if (!clienteId || !clienteNome) {
        throw new Error('Cliente não foi criado corretamente');
      }

      // ============================================================================
      // 2. CRIAR ORÇAMENTO
      // ============================================================================
      addLog('💰 Criando orçamento...', 'info');

      const orcamentoResult = await orcamentosService.create({
        numero: `ORC-${new Date().getFullYear()}-001`,
        clienteId,
        clienteNome,
        data: new Date().toISOString(),
        validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Rascunho',
        itens: [
          {
            id: '1',
            modeloId: 'portas-janelas-basculante',
            modeloNome: 'Janela Basculante',
            quantidade: 5,
            precoUnitario: 850.0,
            subtotal: 4250.0,
            especificacoes: {
              comprimento: 1200,
              largura: 800,
              espessura: 1.5,
              acabamento: 'Lixado',
            },
            bom: [
              {
                materialId: 'chapa-inox-304',
                materialNome: 'Chapa Inox 304 - 1.5mm',
                tipo: 'Chapa',
                quantidade: 3.5,
                unidade: 'M2',
                precoCusto: 150.0,
                custoTotal: 525.0,
              },
            ],
          },
        ],
        subtotal: 4250.0,
        total: 4250.0,
        observacoes: 'Orçamento criado automaticamente para demonstração',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      });

      if (orcamentoResult.success && orcamentoResult.data) {
        addLog(`  ✅ Orçamento criado: ${orcamentoResult.data.numero}`, 'success');
        contador++;

        // ============================================================================
        // 3. APROVAR ORÇAMENTO
        // ============================================================================
        addLog('✅ Aprovando orçamento...', 'info');

        const aprovarResult = await orcamentosService.aprovar(orcamentoResult.data.id);

        if (aprovarResult.success && aprovarResult.data) {
          addLog(`  ✅ Orçamento aprovado: ${aprovarResult.data.numero}`, 'success');

          // ============================================================================
          // 4. CRIAR ORDEM DE PRODUÇÃO
          // ============================================================================
          addLog('🏭 Criando ordem de produção...', 'info');

          const ordemResult = await ordensService.criarDeOrcamento(aprovarResult.data.id);

          if (ordemResult.success && ordemResult.data) {
            addLog(`  ✅ OP criada: ${ordemResult.data.numero}`, 'success');
            contador++;
          } else {
            addLog(`  ❌ Erro ao criar OP: ${ordemResult.error}`, 'error');
          }
        } else {
          addLog(`  ❌ Erro ao aprovar orçamento: ${aprovarResult.error}`, 'error');
        }
      } else {
        addLog(`  ❌ Erro ao criar orçamento: ${orcamentoResult.error}`, 'error');
      }

      // ============================================================================
      // SUCESSO!
      // ============================================================================
      setTotalCriado(contador);
      addLog('', 'info');
      addLog('🎉 BANCO CRIADO COM SUCESSO!', 'success');
      addLog(`✅ Total de documentos: ${contador}`, 'success');
      addLog('', 'info');
      addLog('Documentos criados:', 'info');
      addLog('  - 1 Conta Admin', 'info');
      addLog('  - 3 Clientes', 'info');
      addLog('  - 1 Orçamento (aprovado)', 'info');
      addLog('  - 1 Ordem de Produção', 'info');
      addLog('', 'info');
      addLog('🔐 CREDENCIAIS DE ACESSO:', 'success');
      addLog('  📧 Email: admin@inoxval.com', 'success');
      addLog('  🔑 Senha: Admin123!', 'success');

      toast.success(`Banco criado! Use admin@inoxval.com / Admin123!`);
    } catch (error: any) {
      addLog('', 'info');
      addLog(`❌ ERRO: ${error.message}`, 'error');
      toast.error(`Erro ao criar banco: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function limparLogs() {
    setLogs([]);
    setTotalCriado(0);
  }

  // Se ainda está autenticando, mostrar loading
  if (autenticando) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Inicializando Firebase...</p>
        </div>
      </div>
    );
  }

  // Se não conseguiu autenticar
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">❌ Erro ao conectar ao Firebase</h1>
          <p className="text-slate-400">Verifique as credenciais no arquivo .env</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* CABEÇALHO */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-500 mb-2">
            🔥 Popular Banco de Dados
          </h1>
          <p className="text-slate-400">
            Esta página usa os Firebase Services (como no tutorial) para criar dados de exemplo.
          </p>
        </div>

        {/* STATUS */}
        <div
          className={`
            p-6 rounded-lg border-l-4 mb-6
            ${
              totalCriado > 0
                ? 'bg-emerald-950/50 border-emerald-500'
                : 'bg-blue-950/50 border-blue-500'
            }
          `}
        >
          {totalCriado === 0 ? (
            <>
              <strong className="block text-lg mb-2">
                👉 Clique no botão abaixo para criar o banco de dados
              </strong>
              <p className="text-slate-400">
                Isso irá criar uma conta admin, clientes, orçamentos e ordens de produção de exemplo.
              </p>
              <div className="mt-3 p-3 bg-orange-900/30 rounded border border-orange-500/30">
                <p className="text-sm text-orange-300 font-medium">
                  🔐 Credenciais que serão criadas:
                </p>
                <p className="text-sm text-orange-200 mt-1">
                  📧 Email: <strong>admin@inoxval.com</strong>
                </p>
                <p className="text-sm text-orange-200">
                  🔑 Senha: <strong>Admin123!</strong>
                </p>
              </div>
            </>
          ) : (
            <>
              <strong className="block text-lg mb-2 text-emerald-400">
                ✅ BANCO DE DADOS CRIADO COM SUCESSO!
              </strong>
              <p className="text-slate-300">
                Total de documentos criados: <strong>{totalCriado}</strong>
              </p>
              <div className="mt-3 p-3 bg-emerald-900/30 rounded border border-emerald-500/30">
                <p className="text-sm text-emerald-300 font-medium">
                  🔐 Use estas credenciais para fazer login:
                </p>
                <p className="text-sm text-emerald-200 mt-1">
                  📧 Email: <strong>admin@inoxval.com</strong>
                </p>
                <p className="text-sm text-emerald-200">
                  🔑 Senha: <strong>Admin123!</strong>
                </p>
              </div>
              <p className="text-slate-400 mt-3">
                Acesse o{' '}
                <a
                  href="https://console.firebase.google.com/project/erp-industrial-inox/firestore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Firebase Console
                </a>{' '}
                para visualizar ou faça{' '}
                <a
                  href="/login"
                  className="text-blue-400 hover:underline"
                >
                  login no sistema
                </a>.
              </p>
            </>
          )}
        </div>

        {/* BOTÕES */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={popularBanco}
            disabled={loading}
            className="
              px-6 py-3 rounded-lg font-bold text-white
              bg-orange-600 hover:bg-orange-700
              disabled:bg-slate-700 disabled:cursor-not-allowed
              transition-colors
            "
          >
            {loading ? '⏳ Criando...' : '🚀 Criar Banco de Dados'}
          </button>

          <button
            onClick={limparLogs}
            disabled={loading}
            className="
              px-6 py-3 rounded-lg font-bold text-white
              bg-slate-700 hover:bg-slate-600
              disabled:bg-slate-800 disabled:cursor-not-allowed
              transition-colors
            "
          >
            🗑️ Limpar Logs
          </button>
        </div>

        {/* LOGS */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">📊 Logs de Criação:</h2>
          <div className="bg-slate-900 rounded p-4 h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-slate-500 text-center py-8">
                Nenhum log ainda. Clique no botão acima para começar.
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`
                    mb-1
                    ${log.tipo === 'success' ? 'text-emerald-400' : ''}
                    ${log.tipo === 'error' ? 'text-red-400' : ''}
                    ${log.tipo === 'info' ? 'text-blue-400' : ''}
                  `}
                >
                  [{log.timestamp.toLocaleTimeString()}] {log.mensagem}
                </div>
              ))
            )}
          </div>
        </div>

        {/* INSTRUÇÕES */}
        <div className="mt-8 p-6 bg-slate-800 rounded-lg">
          <h3 className="text-lg font-bold mb-3 text-orange-500">📝 Como usar:</h3>
          <ol className="list-decimal list-inside space-y-2 text-slate-300">
            <li>Acesse esta página /popular-banco</li>
            <li>Clique no botão "Criar Banco de Dados"</li>
            <li>Aguarde a criação (acompanhe os logs)</li>
            <li>Verifique no Firebase Console ou nas páginas do sistema</li>
          </ol>
          <div className="mt-4 p-3 bg-blue-900/30 rounded border border-blue-500/30">
            <p className="text-sm text-blue-300">
              ℹ️ Esta página faz login anônimo automaticamente - não precisa estar logado!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
