/**
 * Mock handler para rotas de Configurações do Usuário
 */

import { newId } from '@/shared/types/ids';
import { 
  ConfiguracoesUsuario, 
  DEFAULT_CONFIGURACOES 
} from '@/domains/configuracoes';

/**
 * Armazena configurações em localStorage
 */
const STORAGE_KEY = 'erp_user_configuracoes';

/**
 * Busca configurações do localStorage
 */
function getConfiguracoesFromStorage(): ConfiguracoesUsuario | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  
  try {
    const parsed = JSON.parse(stored);
    // Converter datas
    parsed.updatedAt = new Date(parsed.updatedAt);
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Salva configurações no localStorage
 */
function saveConfiguracoesToStorage(config: ConfiguracoesUsuario): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/**
 * Cria configurações padrão para o usuário
 */
function createDefaultConfiguracoes(): ConfiguracoesUsuario {
  const config: ConfiguracoesUsuario = {
    id: newId(),
    usuarioId: 'user-admin', // ID do usuário mockado
    ...DEFAULT_CONFIGURACOES,
    updatedAt: new Date(),
  };
  
  saveConfiguracoesToStorage(config);
  return config;
}

/**
 * Handler para rotas de configurações
 */
export function handleConfiguracoesRequest(
  method: 'GET' | 'POST' | 'PATCH',
  url: string,
  data?: any
): any {
  // GET /api/configuracoes-usuario/me

  if (method === 'GET' && url === '/api/configuracoes-usuario/me') {
    let config = getConfiguracoesFromStorage();
    
    if (!config) {
      config = createDefaultConfiguracoes();
    }
    
    return config;
  }

  // PATCH /api/configuracoes-usuario/me
  if (method === 'PATCH' && url === '/api/configuracoes-usuario/me') {
    let config = getConfiguracoesFromStorage();
    
    if (!config) {
      config = createDefaultConfiguracoes();
    }
    
    // Merge das configurações (deep merge para objetos aninhados)
    if (data.vendas) {
      config.vendas = { ...config.vendas, ...data.vendas };
    }
    
    if (data.notificacoes) {
      config.notificacoes = { ...config.notificacoes, ...data.notificacoes };
    }
    
    if (data.aparencia) {
      config.aparencia = { ...config.aparencia, ...data.aparencia };
    }
    
    if (data.empresa) {
      config.empresa = { ...config.empresa, ...data.empresa };
    }
    
    config.updatedAt = new Date();
    
    saveConfiguracoesToStorage(config);
    return config;
  }

  // POST /api/configuracoes-usuario/reset
  if (method === 'POST' && url === '/api/configuracoes-usuario/reset') {
    const config = createDefaultConfiguracoes();
    return config;
  }

  throw new Error(`Rota de configurações não encontrada: ${method} ${url}`);
}
