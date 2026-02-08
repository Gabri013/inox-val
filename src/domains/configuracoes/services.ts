/**
 * Serviço de Configurações do Usuário
 */

import { getHttpClient } from '@/services/http/client';
import { 
  ConfiguracoesUsuario, 
  UpdateConfiguracoesInput,
  DEFAULT_CONFIGURACOES 
} from './types';

const BASE_URL = '/api/configuracoes-usuario';

/**
 * Serviço de configurações
 */
export const configuracoesService = {
  /**
   * Busca configurações do usuário atual
   */
  async getMinhasConfiguracoes(): Promise<ConfiguracoesUsuario> {
    const client = getHttpClient();
    return client.get<ConfiguracoesUsuario>(`${BASE_URL}/me`);
  },

  /**
   * Atualiza configurações do usuário
   */
  async updateConfiguracoes(data: UpdateConfiguracoesInput): Promise<ConfiguracoesUsuario> {
    const client = getHttpClient();
    return client.patch<ConfiguracoesUsuario>(`${BASE_URL}/me`, data);
  },

  /**
   * Reseta configurações para o padrão
   */
  async resetConfiguracoes(): Promise<ConfiguracoesUsuario> {
    const client = getHttpClient();
    return client.post<ConfiguracoesUsuario>(`${BASE_URL}/reset`, DEFAULT_CONFIGURACOES);
  },
};
