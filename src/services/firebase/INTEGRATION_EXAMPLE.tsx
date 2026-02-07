/**
 * ============================================================================
 * EXEMPLOS DE INTEGRAÇÃO DOS FIREBASE SERVICES COM REACT
 * ============================================================================
 * 
 * Este arquivo mostra como usar os Firebase Services em componentes React.
 * 
 * IMPORTANTE: Este é apenas um exemplo de referência.
 * Copie os trechos necessários para seus componentes reais.
 * 
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { clientesService } from './clientes.service';
import { orcamentosService } from './orcamentos.service';
import { ordensService } from './ordens.service';
import type { Cliente } from '@/domains/clientes';
import type { Orcamento, OrdemProducao } from '@/app/types/workflow';
import { toast } from 'sonner';

// ============================================================================
// EXEMPLO 1: LISTAR CLIENTES
// ============================================================================

export function ExemploListaClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarClientes() {
      setLoading(true);
      setError(null);

      const result = await clientesService.list({
        orderBy: [{ field: 'nome', direction: 'asc' }],
        limit: 50,
      });

      if (result.success && result.data) {
        setClientes(result.data.items);
      } else {
        setError(result.error || 'Erro ao carregar clientes');
      }

      setLoading(false);
    }

    carregarClientes();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h2>Clientes ({clientes.length})</h2>
      <ul>
        {clientes.map((cliente) => (
          <li key={cliente.id}>
            {cliente.nome} - {cliente.cnpj}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// EXEMPLO 2: CRIAR CLIENTE COM VALIDAÇÃO
// ============================================================================

export function ExemploCriarCliente() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: any) {
    setLoading(true);

    const result = await clientesService.create({
      nome: formData.nome,
      cnpj: formData.cnpj.replace(/\D/g, ''), // Remove caracteres não numéricos
      email: formData.email,
      telefone: formData.telefone,
      cidade: formData.cidade,
      estado: formData.estado,
      status: 'Ativo',
      totalCompras: 0,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    });

    if (result.success && result.data) {
      toast.success('Cliente criado com sucesso!');
      console.log('Cliente criado:', result.data);
      // Redirecionar ou atualizar lista
    } else {
      toast.error(result.error || 'Erro ao criar cliente');
    }

    setLoading(false);
  }

  return (
    <div>
      <h2>Criar Novo Cliente</h2>
      {/* Formulário aqui */}
      <button onClick={() => handleSubmit({})} disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar Cliente'}
      </button>
    </div>
  );
}

// ============================================================================
// EXEMPLO 3: BUSCAR CLIENTE POR CNPJ (ANTES DE CRIAR)
// ============================================================================

export function ExemploBuscarPorCNPJ() {
  async function verificarCNPJ(cnpj: string) {
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    if (cnpjLimpo.length !== 14) {
      toast.error('CNPJ deve ter 14 dígitos');
      return;
    }

    const result = await clientesService.findByCNPJ(cnpjLimpo);

    if (result.success && result.data) {
      toast.warning(`Cliente já cadastrado: ${result.data.nome}`);
      return result.data;
    } else {
      toast.info('CNPJ disponível');
      return null;
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="CNPJ"
        onBlur={(e) => verificarCNPJ(e.target.value)}
      />
    </div>
  );
}

// ============================================================================
// EXEMPLO 4: LISTAR ORÇAMENTOS COM FILTRO DE STATUS
// ============================================================================

export function ExemploListaOrcamentosPorStatus() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [status, setStatus] = useState<'Rascunho' | 'Enviado' | 'Aprovado'>('Enviado');

  useEffect(() => {
    async function carregarOrcamentos() {
      const result = await orcamentosService.listByStatus(status);

      if (result.success && result.data) {
        setOrcamentos(result.data);
      }
    }

    carregarOrcamentos();
  }, [status]);

  return (
    <div>
      <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
        <option value="Rascunho">Rascunho</option>
        <option value="Enviado">Enviado</option>
        <option value="Aprovado">Aprovado</option>
      </select>

      <ul>
        {orcamentos.map((orc) => (
          <li key={orc.id}>
            {orc.numero} - {orc.clienteNome} - R$ {orc.total.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// EXEMPLO 5: APROVAR ORÇAMENTO
// ============================================================================

export function ExemploAprovarOrcamento({ orcamentoId }: { orcamentoId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleAprovar() {
    if (!confirm('Deseja realmente aprovar este orçamento?')) {
      return;
    }

    setLoading(true);

    const result = await orcamentosService.aprovar(orcamentoId);

    if (result.success && result.data) {
      toast.success('Orçamento aprovado com sucesso!');
      console.log('Orçamento aprovado:', result.data);
      // Atualizar lista ou redirecionar
    } else {
      toast.error(result.error || 'Erro ao aprovar orçamento');
    }

    setLoading(false);
  }

  return (
    <button onClick={handleAprovar} disabled={loading}>
      {loading ? 'Aprovando...' : 'Aprovar Orçamento'}
    </button>
  );
}

// ============================================================================
// EXEMPLO 6: CONVERTER ORÇAMENTO EM OP
// ============================================================================

export function ExemploConverterOrcamentoEmOP({ orcamentoId }: { orcamentoId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleConverter() {
    if (!confirm('Deseja converter este orçamento em ordem de produção?')) {
      return;
    }

    setLoading(true);

    const result = await ordensService.criarDeOrcamento(orcamentoId);

    if (result.success && result.data) {
      toast.success(`OP ${result.data.numero} criada com sucesso!`);
      console.log('OP criada:', result.data);
      // Redirecionar para página da OP
    } else {
      toast.error(result.error || 'Erro ao criar ordem de produção');
    }

    setLoading(false);
  }

  return (
    <button onClick={handleConverter} disabled={loading}>
      {loading ? 'Convertendo...' : 'Converter em OP'}
    </button>
  );
}

// ============================================================================
// EXEMPLO 7: INICIAR PRODUÇÃO
// ============================================================================

export function ExemploIniciarProducao({ ordemId }: { ordemId: string }) {
  const [loading, setLoading] = useState(false);
  const [operador, setOperador] = useState('');

  async function handleIniciar() {
    if (!operador) {
      toast.error('Informe o nome do operador');
      return;
    }

    setLoading(true);

    const result = await ordensService.iniciarProducao(ordemId, operador);

    if (result.success && result.data) {
      toast.success('Produção iniciada!');
      console.log('Produção iniciada:', result.data);
    } else {
      toast.error(result.error || 'Erro ao iniciar produção');
    }

    setLoading(false);
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Nome do operador"
        value={operador}
        onChange={(e) => setOperador(e.target.value)}
      />
      <button onClick={handleIniciar} disabled={loading}>
        {loading ? 'Iniciando...' : 'Iniciar Produção'}
      </button>
    </div>
  );
}

// ============================================================================
// EXEMPLO 8: PAGINAÇÃO
// ============================================================================

export function ExemploListaClientesComPaginacao() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  async function carregarPrimeiraPagina() {
    setLoading(true);

    const result = await clientesService.list({
      orderBy: [{ field: 'nome', direction: 'asc' }],
      limit: 20,
    });

    if (result.success && result.data) {
      setClientes(result.data.items);
      setLastDoc(result.data.lastDoc);
      setHasMore(result.data.hasMore);
    }

    setLoading(false);
  }

  async function carregarProximaPagina() {
    if (!hasMore || !lastDoc) return;

    setLoading(true);

    const result = await clientesService.list({
      orderBy: [{ field: 'nome', direction: 'asc' }],
      limit: 20,
      startAfter: lastDoc,
    });

    if (result.success && result.data) {
      setClientes([...clientes, ...result.data.items]);
      setLastDoc(result.data.lastDoc);
      setHasMore(result.data.hasMore);
    }

    setLoading(false);
  }

  useEffect(() => {
    carregarPrimeiraPagina();
  }, []);

  return (
    <div>
      <ul>
        {clientes.map((cliente) => (
          <li key={cliente.id}>{cliente.nome}</li>
        ))}
      </ul>

      {hasMore && (
        <button onClick={carregarProximaPagina} disabled={loading}>
          {loading ? 'Carregando...' : 'Carregar Mais'}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// EXEMPLO 9: ATUALIZAR DADOS EM TEMPO REAL (onSnapshot)
// ============================================================================

/**
 * NOTA: Para tempo real, você precisaria usar onSnapshot do Firestore.
 * 
 * Este é um exemplo de como implementar:
 */

import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { getFirestore, getEmpresaContext } from '@/lib/firebase';

export function ExemploRealtimeOrcamentos() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);

  useEffect(() => {
    const db = getFirestore();
    const empresaInfo = getEmpresaContext();
    if (!empresaInfo.empresaId) {
      return;
    }

    const q = query(
      collection(db, 'orcamentos'),
      where('empresaId', '==', empresaInfo.empresaId),
      where('status', '==', 'Enviado')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orcamentosAtualizados: Orcamento[] = [];
      
      snapshot.forEach((doc) => {
        orcamentosAtualizados.push({
          id: doc.id,
          ...doc.data(),
        } as Orcamento);
      });

      setOrcamentos(orcamentosAtualizados);
    });

    // Cleanup: cancelar subscription quando componente desmontar
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>Orçamentos em Tempo Real ({orcamentos.length})</h2>
      <ul>
        {orcamentos.map((orc) => (
          <li key={orc.id}>{orc.numero}</li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// EXEMPLO 10: HOOK CUSTOMIZADO PARA CLIENTES
// ============================================================================

function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      const result = await clientesService.list({
        orderBy: [{ field: 'nome', direction: 'asc' }],
      });

      if (result.success && result.data) {
        setClientes(result.data.items);
      } else {
        setError(result.error || 'Erro ao carregar clientes');
      }

      setLoading(false);
    }

    carregar();
  }, []);

  async function criar(cliente: Omit<Cliente, 'id' | 'empresaId'>) {
    const result = await clientesService.create(cliente);
    
    if (result.success && result.data) {
      setClientes([...clientes, result.data]);
      toast.success('Cliente criado!');
    } else {
      toast.error(result.error || 'Erro ao criar cliente');
    }

    return result;
  }

  async function atualizar(id: string, updates: Partial<Cliente>) {
    const result = await clientesService.update(id, updates);

    if (result.success && result.data) {
      setClientes(
        clientes.map((c) => (c.id === id ? result.data! : c))
      );
      toast.success('Cliente atualizado!');
    } else {
      toast.error(result.error || 'Erro ao atualizar cliente');
    }

    return result;
  }

  async function deletar(id: string) {
    const result = await clientesService.delete(id);

    if (result.success) {
      setClientes(clientes.filter((c) => c.id !== id));
      toast.success('Cliente removido!');
    } else {
      toast.error(result.error || 'Erro ao remover cliente');
    }

    return result;
  }

  return {
    clientes,
    loading,
    error,
    criar,
    atualizar,
    deletar,
  };
}

// Uso do hook:
export function ExemploUsoHookClientes() {
  const { clientes, loading, criar, atualizar, deletar } = useClientes();

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <ul>
        {clientes.map((cliente) => (
          <li key={cliente.id}>
            {cliente.nome}
            <button onClick={() => atualizar(cliente.id, { status: 'Inativo' })}>
              Inativar
            </button>
            <button onClick={() => deletar(cliente.id)}>
              Deletar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// RESUMO
// ============================================================================

/**
 * Principais Padrões:
 * 
 * 1. Sempre verificar result.success antes de usar result.data
 * 2. Sempre mostrar feedback ao usuário (toast.success/error)
 * 3. Sempre usar loading state para UX melhor
 * 4. Sempre fazer cleanup de subscriptions onSnapshot
 * 5. Considerar criar hooks customizados para reutilização
 * 
 * Próximos Passos:
 * 
 * - Integrar estes exemplos nos componentes reais do ERP
 * - Criar hooks customizados para cada domínio (useClientes, useOrcamentos, etc)
 * - Implementar cache local com React Query ou SWR
 * - Implementar otimistic updates para UX melhor
 */
