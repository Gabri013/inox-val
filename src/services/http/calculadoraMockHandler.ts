/**
 * Mock Handler para Calculadora Rápida
 * Simula operações com IndexedDB
 */

import { 
  Insumo, 
  ProdutoPadrao, 
  CalculadoraOrcamento, 
  ItemCalculadora,
  ConsumoMaterial,
  ResultadoCalculadora
} from '@/domains/catalogo';
import { 
  todosInsumos, 
  produtosPadronizados,
  materiasPrimas 
} from '@/domains/catalogo';

const DB_NAME = 'erp-calculadora-db';
const DB_VERSION = 1;

const STORES = {
  INSUMOS: 'insumos',
  PRODUTOS_PADRONIZADOS: 'produtos_padronizados',
  ORCAMENTOS: 'orcamentos',
};

// Inicializar IndexedDB
async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store de Insumos
      if (!db.objectStoreNames.contains(STORES.INSUMOS)) {
        const insumosStore = db.createObjectStore(STORES.INSUMOS, { keyPath: 'id' });
        insumosStore.createIndex('codigo', 'codigo', { unique: true });
        insumosStore.createIndex('tipo', 'tipo', { unique: false });
      }

      // Store de Produtos Padronizados
      if (!db.objectStoreNames.contains(STORES.PRODUTOS_PADRONIZADOS)) {
        const produtosStore = db.createObjectStore(STORES.PRODUTOS_PADRONIZADOS, { keyPath: 'id' });
        produtosStore.createIndex('codigo', 'codigo', { unique: true });
        produtosStore.createIndex('tipo', 'tipo', { unique: false });
      }

      // Store de Orçamentos
      if (!db.objectStoreNames.contains(STORES.ORCAMENTOS)) {
        const orcamentosStore = db.createObjectStore(STORES.ORCAMENTOS, { keyPath: 'id' });
        orcamentosStore.createIndex('codigo', 'codigo', { unique: true });
        orcamentosStore.createIndex('status', 'status', { unique: false });
        orcamentosStore.createIndex('data', 'data', { unique: false });
      }
    };
  });
}

// Seed inicial de dados
async function seedData() {
  const db = await initDB();
  void materiasPrimas;

  // Seed Insumos
  const insumosStore = db.transaction(STORES.INSUMOS, 'readwrite').objectStore(STORES.INSUMOS);
  const countInsumos = await new Promise<number>((resolve) => {
    const request = insumosStore.count();
    request.onsuccess = () => resolve(request.result);
  });

  if (countInsumos === 0) {
    for (const insumo of todosInsumos) {
      insumosStore.add(insumo);
    }
  }

  // Seed Produtos Padronizados
  const produtosStore = db.transaction(STORES.PRODUTOS_PADRONIZADOS, 'readwrite').objectStore(STORES.PRODUTOS_PADRONIZADOS);
  const countProdutos = await new Promise<number>((resolve) => {
    const request = produtosStore.count();
    request.onsuccess = () => resolve(request.result);
  });

  if (countProdutos === 0) {
    for (const produto of produtosPadronizados) {
      produtosStore.add(produto);
    }
  }

  db.close();
}

// Inicializar dados ao carregar
seedData();

// Helper para operações genéricas
async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      db.close();
      resolve(request.result);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

async function getById<T>(storeName: string, id: string): Promise<T | undefined> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => {
      db.close();
      resolve(request.result);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

async function add<T>(storeName: string, data: T): Promise<T> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);

    request.onsuccess = () => {
      db.close();
      resolve(data);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

async function update<T>(storeName: string, data: T): Promise<T> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = () => {
      db.close();
      resolve(data);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

// API específica para Insumos
export const insumosAPI = {
  getAll: () => getAll<Insumo>(STORES.INSUMOS),
  getById: (id: string) => getById<Insumo>(STORES.INSUMOS, id),
  getByTipo: async (tipo: string) => {
    const insumos = await getAll<Insumo>(STORES.INSUMOS);
    return insumos.filter(i => i.tipo === tipo);
  },
};

// API específica para Produtos Padronizados
export const produtosPadronizadosAPI = {
  getAll: () => getAll<ProdutoPadrao>(STORES.PRODUTOS_PADRONIZADOS),
  getById: (id: string) => getById<ProdutoPadrao>(STORES.PRODUTOS_PADRONIZADOS, id),
  getByTipo: async (tipo: string) => {
    const produtos = await getAll<ProdutoPadrao>(STORES.PRODUTOS_PADRONIZADOS);
    return produtos.filter(p => p.tipo === tipo && p.ativo);
  },
};

// Engine de cálculo de BOM e Nesting
export const calculadoraEngine = {
  // Calcular consumo de materiais
  calcularConsumo: async (itens: ItemCalculadora[]): Promise<ConsumoMaterial[]> => {
    const consumoMap = new Map<string, ConsumoMaterial>();
    const insumos = await insumosAPI.getAll();
    const produtos = await produtosPadronizadosAPI.getAll();

    for (const item of itens) {
      const produto = produtos.find(p => p.id === item.produtoPadraoId);
      if (!produto) continue;

      // Fator de escala se houver dimensões customizadas
      let fatorEscala = 1;
      if (item.dimensoesCustomizadas) {
        const areaOriginal = (produto.dimensoes.largura * produto.dimensoes.profundidade) / 1000000;
        const areaCustomizada = (item.dimensoesCustomizadas.largura * item.dimensoesCustomizadas.profundidade) / 1000000;
        fatorEscala = areaCustomizada / areaOriginal;
      }

      // Processar cada componente do produto
      for (const componente of produto.componentes) {
        const insumo = insumos.find(i => i.id === componente.insumoId);
        if (!insumo) continue;

        const quantidadeItem = componente.quantidade * item.quantidade * fatorEscala;
        
        if (consumoMap.has(componente.insumoId)) {
          const consumoExistente = consumoMap.get(componente.insumoId)!;
          consumoExistente.quantidadeTotal += quantidadeItem;
          consumoExistente.custoTotal = consumoExistente.quantidadeTotal * consumoExistente.custoUnitario;
          consumoExistente.origem.push(produto.nome);
        } else {
          consumoMap.set(componente.insumoId, {
            insumoId: componente.insumoId,
            insumo,
            quantidadeTotal: quantidadeItem,
            unidade: insumo.unidade,
            custoUnitario: insumo.custoUnitario,
            custoTotal: quantidadeItem * insumo.custoUnitario,
            origem: [produto.nome],
          });
        }
      }
    }

    return Array.from(consumoMap.values());
  },

  // Simular cálculo de nesting (aproveitamento de chapas)
  calcularNesting: async (consumoMateriais: ConsumoMaterial[]) => {
    const nestingPorChapa = [];
    
    // Filtrar apenas matérias primas (chapas)
    const consumoChapas = consumoMateriais.filter(c => 
      c.insumo?.tipo === 'materia-prima'
    );

    for (const consumo of consumoChapas) {
      const chapa = consumo.insumo;
      if (!chapa || chapa.tipo !== 'materia-prima') continue;

      // Simular cálculo de nesting
      // Em produção, isso seria feito pelo algoritmo real de nesting
      const areaChapa = 2.0; // 1000mm x 2000mm = 2m²
      const areaNecessaria = consumo.quantidadeTotal;
      const chapasNecessarias = Math.ceil(areaNecessaria / areaChapa);
      
      // Aproveitamento estimado (90-95% é típico)
      const aproveitamento = Math.min(95, 85 + Math.random() * 10);
      const perdaMaterial = 100 - aproveitamento;

      nestingPorChapa.push({
        materialId: consumo.insumoId,
        material: chapa as any,
        chapasNecessarias,
        aproveitamento,
        perdaMaterial,
      });
    }

    return nestingPorChapa;
  },

  // Calcular orçamento completo
  calcularOrcamento: async (
    itens: ItemCalculadora[],
    margemLucro: number = 50
  ): Promise<ResultadoCalculadora> => {
    const produtos = await produtosPadronizadosAPI.getAll();
    
    // Calcular consumo de materiais
    const consumoMateriais = await calculadoraEngine.calcularConsumo(itens);
    
    // Calcular nesting
    const nestingPorChapa = await calculadoraEngine.calcularNesting(consumoMateriais);

    // Calcular totalizadores
    let custoMaterial = 0;
    let custoMaoObra = 0;

    for (const item of itens) {
      const produto = produtos.find(p => p.id === item.produtoPadraoId);
      if (!produto) continue;

      custoMaterial += produto.custoMaterial * item.quantidade;
      custoMaoObra += produto.custoMaoObra * item.quantidade;
    }

    const custoTotal = custoMaterial + custoMaoObra;
    const valorVenda = custoTotal * (1 + margemLucro / 100);
    const lucroEstimado = valorVenda - custoTotal;

    // Criar orçamento
    const orcamento: CalculadoraOrcamento = {
      id: `orc-${Date.now()}`,
      codigo: `ORC-${String(Date.now()).slice(-6)}`,
      data: new Date().toISOString(),
      itens: itens.map(item => ({
        ...item,
        produtoPadrao: produtos.find(p => p.id === item.produtoPadraoId),
      })),
      custoMaterialTotal: custoMaterial,
      custoMaoObraTotal: custoMaoObra,
      custoTotal,
      margemLucro,
      valorVenda,
      bomConsolidado: consumoMateriais,
      status: 'rascunho',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      orcamento,
      consumoMateriais,
      nestingPorChapa,
      resumo: {
        totalItens: itens.reduce((sum, item) => sum + item.quantidade, 0),
        custoMaterial,
        custoMaoObra,
        custoTotal,
        valorVenda,
        margemLucro,
        lucroEstimado,
      },
    };
  },
};

// API de Orçamentos
export const orcamentosAPI = {
  getAll: () => getAll<CalculadoraOrcamento>(STORES.ORCAMENTOS),
  getById: (id: string) => getById<CalculadoraOrcamento>(STORES.ORCAMENTOS, id),
  create: (orcamento: CalculadoraOrcamento) => add(STORES.ORCAMENTOS, orcamento),
  update: (orcamento: CalculadoraOrcamento) => update(STORES.ORCAMENTOS, orcamento),
  
  calcular: async (itens: ItemCalculadora[], margemLucro: number = 50) => {
    return calculadoraEngine.calcularOrcamento(itens, margemLucro);
  },

  salvar: async (resultado: ResultadoCalculadora) => {
    return add(STORES.ORCAMENTOS, resultado.orcamento);
  },
};

/**
 * Handler de requisições HTTP para rotas da calculadora
 */
export async function handleCalculadoraRequest(
  method: string,
  url: string,
  data?: any
): Promise<any> {
  // Insumos
  if (url.startsWith('/api/catalogo/insumos')) {
    if (method === 'GET') {
      const urlObj = new URL(url, 'http://localhost');
      const tipo = urlObj.searchParams.get('tipo');
      
      if (tipo) {
        return insumosAPI.getByTipo(tipo);
      }
      
      // Check if requesting by ID
      const idMatch = url.match(/\/api\/catalogo\/insumos\/([^?]+)/);
      if (idMatch) {
        return insumosAPI.getById(idMatch[1]);
      }
      
      return insumosAPI.getAll();
    }
  }

  // Produtos Padronizados
  if (url.startsWith('/api/catalogo/produtos-padronizados')) {
    if (method === 'GET') {
      const urlObj = new URL(url, 'http://localhost');
      const tipo = urlObj.searchParams.get('tipo');
      
      if (tipo) {
        return produtosPadronizadosAPI.getByTipo(tipo);
      }
      
      // Check if requesting by ID
      const idMatch = url.match(/\/api\/catalogo\/produtos-padronizados\/([^?]+)/);
      if (idMatch) {
        return produtosPadronizadosAPI.getById(idMatch[1]);
      }
      
      return produtosPadronizadosAPI.getAll();
    }
  }

  // Calculadora - Calcular
  if (url === '/api/calculadora/calcular' && method === 'POST') {
    const { itens, margemLucro } = data;
    return orcamentosAPI.calcular(itens, margemLucro);
  }

  // Orçamentos
  if (url.startsWith('/api/calculadora/orcamentos')) {
    if (method === 'GET') {
      // Check if requesting by ID
      const idMatch = url.match(/\/api\/calculadora\/orcamentos\/([^?]+)/);
      if (idMatch) {
        return orcamentosAPI.getById(idMatch[1]);
      }
      
      return orcamentosAPI.getAll();
    }

    if (method === 'POST') {
      return orcamentosAPI.salvar(data);
    }

    if (method === 'PUT') {
      const idMatch = url.match(/\/api\/calculadora\/orcamentos\/([^?]+)/);
      if (idMatch) {
        const orcamento = await orcamentosAPI.getById(idMatch[1]);
        if (!orcamento) {
          throw new Error('Orçamento não encontrado');
        }
        const updated = { ...orcamento, ...data };
        return orcamentosAPI.update(updated);
      }
    }
  }

  throw new Error(`Rota da calculadora não implementada: ${method} ${url}`);
}
