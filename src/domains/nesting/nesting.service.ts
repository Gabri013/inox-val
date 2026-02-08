/**
 * Serviço de Nesting - Cálculo de Bancada
 * IMPORTANTE: Este serviço NÃO recalcula BOM
 * Ele recebe peças JÁ calculadas pela engine de calculadora e faz APENAS o nesting
 */

import { getHttpClient, PaginatedResponse, PaginationParams } from '@/services/http/client';
import { newId, type ID } from '@/shared/types/ids';
import { toISOString } from '@/shared/lib/format';
import { 
  calcularAproveitamento, 
  validarCompatibilidade,
  PARAMETROS_PADRAO 
} from './nesting.engine';
import type { 
  CalculoNesting, 
  CreateCalculoNestingInput,
  UpdateCalculoNestingInput,
  NestingFilters,
  ParametrosCalculo,
  MaterialBase,
  ItemNesting,
  TemplateMaterial
} from './nesting.types';

const BASE_URL = '/api/nesting';

class NestingService {
  /**
   * Lista cálculos com paginação e filtros
   */
  async list(
    params: PaginationParams & NestingFilters = {}
  ): Promise<PaginatedResponse<CalculoNesting>> {
    const client = getHttpClient();
    
    const apiParams: PaginationParams = {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      sortBy: params.sortBy || 'updatedAt',
      sortOrder: params.sortOrder || 'desc',
    };
    
    if (params.status && params.status !== 'all') {
      apiParams.status = params.status;
    }
    
    if (params.clienteId) {
      apiParams.clienteId = params.clienteId;
    }
    
    if (params.dataInicio) {
      apiParams.dataInicio = params.dataInicio;
    }
    
    if (params.dataFim) {
      apiParams.dataFim = params.dataFim;
    }
    
    return client.get<PaginatedResponse<CalculoNesting>>(BASE_URL, { params: apiParams });
  }

  /**
   * Busca cálculo por ID
   */
  async getById(id: ID): Promise<CalculoNesting> {
    const client = getHttpClient();
    return client.get<CalculoNesting>(`${BASE_URL}/${id}`);
  }

  /**
   * Cria novo cálculo
   */
  async create(input: CreateCalculoNestingInput, parametros: ParametrosCalculo = PARAMETROS_PADRAO): Promise<CalculoNesting> {
    // Gera IDs para itens e material base
    const itensComId: ItemNesting[] = input.itens.map(item => ({
      ...item,
      id: newId(),
    }));
    
    const materialBaseComId: MaterialBase = {
      ...input.materialBase,
      id: newId(),
      custoTotal: input.materialBase.peso * input.materialBase.custoKg,
    };
    
    // Valida compatibilidade
    const validacao = validarCompatibilidade(itensComId, materialBaseComId.tipo);
    if (!validacao.valido) {
      throw new Error(`Validação falhou: ${validacao.erros.join(', ')}`);
    }
    
    // Calcula aproveitamento
    const resultado = calcularAproveitamento(itensComId, materialBaseComId, parametros);
    
    // Calcula custos
    const custoMaoObra = input.custoMaoObra || 0;
    const custoSetup = input.custoSetup || 0;
    const custoOutros = input.custoOutros || 0;
    const margemLucro = input.margemLucro || 30;
    
    const custoTotal = resultado.custoTotal + custoMaoObra + custoSetup + custoOutros;
    const precoVenda = custoTotal * (1 + margemLucro / 100);
    
    const calculo: CalculoNesting = {
      id: newId(),
      nome: input.nome,
      descricao: input.descricao,
      clienteId: input.clienteId,
      itens: itensComId,
      materialBase: materialBaseComId,
      resultado,
      custoMaoObra,
      custoSetup,
      custoOutros,
      margemLucro,
      custoTotal,
      precoVenda,
      status: 'CALCULADO',
      criadoPor: input.criadoPor,
      createdAt: toISOString(new Date()),
      updatedAt: toISOString(new Date()),
    };
    
    const client = getHttpClient();
    return client.post<CalculoNesting>(BASE_URL, calculo);
  }

  /**
   * Atualiza cálculo existente
   */
  async update(id: ID, input: UpdateCalculoNestingInput, parametros: ParametrosCalculo = PARAMETROS_PADRAO): Promise<CalculoNesting> {
    const calculoExistente = await this.getById(id);
    
    // Mescla dados
    const itens = input.itens 
      ? input.itens.map(item => ({ ...item, id: newId() }))
      : calculoExistente.itens;
    
    const materialBase = input.materialBase
      ? {
          ...input.materialBase,
          id: newId(),
          custoTotal: input.materialBase.peso * input.materialBase.custoKg,
        }
      : calculoExistente.materialBase;
    
    // Recalcula se necessário
    let resultado = calculoExistente.resultado;
    if (input.itens || input.materialBase) {
      const validacao = validarCompatibilidade(itens, materialBase.tipo);
      if (!validacao.valido) {
        throw new Error(`Validação falhou: ${validacao.erros.join(', ')}`);
      }
      
      resultado = calcularAproveitamento(itens, materialBase, parametros);
    }
    
    // Recalcula custos
    const custoMaoObra = input.custoMaoObra ?? calculoExistente.custoMaoObra;
    const custoSetup = input.custoSetup ?? calculoExistente.custoSetup;
    const custoOutros = input.custoOutros ?? calculoExistente.custoOutros;
    const margemLucro = input.margemLucro ?? calculoExistente.margemLucro;
    
    const custoTotal = resultado.custoTotal + custoMaoObra + custoSetup + custoOutros;
    const precoVenda = custoTotal * (1 + margemLucro / 100);
    
    const calculoAtualizado: CalculoNesting = {
      ...calculoExistente,
      nome: input.nome ?? calculoExistente.nome,
      descricao: input.descricao ?? calculoExistente.descricao,
      clienteId: input.clienteId ?? calculoExistente.clienteId,
      itens,
      materialBase,
      resultado,
      custoMaoObra,
      custoSetup,
      custoOutros,
      margemLucro,
      custoTotal,
      precoVenda,
      atualizadoPor: input.atualizadoPor,
      updatedAt: toISOString(new Date()),
    };
    
    const client = getHttpClient();
    return client.put<CalculoNesting>(`${BASE_URL}/${id}`, calculoAtualizado);
  }

  /**
   * Remove cálculo
   */
  async remove(id: ID): Promise<void> {
    const client = getHttpClient();
    await client.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Aprova cálculo
   */
  async approve(id: ID, usuarioId: string): Promise<CalculoNesting> {
    const calculo = await this.getById(id);
    
    if (calculo.status === 'APROVADO') {
      throw new Error('Cálculo já está aprovado');
    }
    
    const calculoAtualizado: CalculoNesting = {
      ...calculo,
      status: 'APROVADO',
      atualizadoPor: usuarioId,
      updatedAt: toISOString(new Date()),
    };
    
    const client = getHttpClient();
    return client.put<CalculoNesting>(`${BASE_URL}/${id}`, calculoAtualizado);
  }

  /**
   * Duplica cálculo
   */
  async duplicate(id: ID, usuarioId: string): Promise<CalculoNesting> {
    const calculoOriginal = await this.getById(id);
    
    const novoCalculo: CalculoNesting = {
      ...calculoOriginal,
      id: newId(),
      nome: `${calculoOriginal.nome} (Cópia)`,
      status: 'RASCUNHO',
      criadoPor: usuarioId,
      atualizadoPor: undefined,
      createdAt: toISOString(new Date()),
      updatedAt: toISOString(new Date()),
    };
    
    const client = getHttpClient();
    return client.post<CalculoNesting>(BASE_URL, novoCalculo);
  }

  /**
   * Converte cálculo em orçamento
   */
  async convertToOrcamento(id: ID, usuarioId: string): Promise<ID> {
    const calculo = await this.getById(id);
    
    if (calculo.status !== 'APROVADO') {
      throw new Error('Apenas cálculos aprovados podem ser convertidos em orçamento');
    }
    
    // TODO: Quando implementar orçamentos, criar orçamento baseado no cálculo
    // Por enquanto, apenas marca como convertido
    
    const calculoAtualizado: CalculoNesting = {
      ...calculo,
      status: 'CONVERTIDO',
      atualizadoPor: usuarioId,
      updatedAt: toISOString(new Date()),
    };
    
    const client = getHttpClient();
    await client.put<CalculoNesting>(`${BASE_URL}/${id}`, calculoAtualizado);
    
    // Retorna ID fictício do orçamento
    return newId();
  }

  /**
   * Lista templates de materiais
   */
  async listTemplates(): Promise<TemplateMaterial[]> {
    // Templates predefinidos - em produção viriam do backend
    return [
      {
        id: newId(),
        tipo: 'CHAPA',
        nome: 'Chapa 1000x2000mm - Aço 1020',
        largura: 1000,
        comprimento: 2000,
        espessura: 3,
        peso: 47.1,
        custoKgMedio: 8.50,
        fornecedorPadrao: 'Distribuidora XYZ',
        ativo: true,
      },
      {
        id: newId(),
        tipo: 'CHAPA',
        nome: 'Chapa 1250x2500mm - Aço 1020',
        largura: 1250,
        comprimento: 2500,
        espessura: 3,
        peso: 73.6,
        custoKgMedio: 8.50,
        fornecedorPadrao: 'Distribuidora XYZ',
        ativo: true,
      },
      {
        id: newId(),
        tipo: 'TUBO',
        nome: 'Tubo Redondo 50mm x 6000mm',
        diametro: 50,
        comprimento: 6000,
        espessura: 2,
        peso: 7.4,
        custoKgMedio: 9.20,
        fornecedorPadrao: 'Tubos ABC',
        ativo: true,
      },
      {
        id: newId(),
        tipo: 'PERFIL',
        nome: 'Perfil L 50x50mm x 6000mm',
        largura: 50,
        comprimento: 6000,
        espessura: 3,
        peso: 13.5,
        custoKgMedio: 8.80,
        fornecedorPadrao: 'Perfis DEF',
        ativo: true,
      },
    ];
  }

  /**
   * Estatísticas de cálculos
   */
  async getStats(): Promise<{
    total: number;
    rascunhos: number;
    calculados: number;
    aprovados: number;
    convertidos: number;
    valorTotal: number;
  }> {
    const response = await this.list({ pageSize: 1000 });
    const calculos = response.items;
    
    return {
      total: calculos.length,
      rascunhos: calculos.filter(c => c.status === 'RASCUNHO').length,
      calculados: calculos.filter(c => c.status === 'CALCULADO').length,
      aprovados: calculos.filter(c => c.status === 'APROVADO').length,
      convertidos: calculos.filter(c => c.status === 'CONVERTIDO').length,
      valorTotal: calculos.reduce((acc, c) => acc + c.precoVenda, 0),
    };
  }
}

export const nestingService = new NestingService();
