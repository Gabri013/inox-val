/**
 * Serviço de autenticação
 * Por enquanto usa dados mockados, mas já está preparado para backend
 */

import type { User } from '@/app/types/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

/**
 * Serviço de autenticação
 */
class AuthService {
  /**
   * Realiza login (mock por enquanto)
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Por enquanto, mantém a lógica mock
    // Quando backend estiver pronto, será:
    // return getHttpClient().post<LoginResponse>('/api/auth/login', credentials);
    
    // Mock simples
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Usuários mockados (mesmos do AuthContext)
    const mockUsers: (User & { password: string })[] = [
      {
        id: '1',
        nome: 'Admin Sistema',
        email: 'admin@erp.com',
        password: 'admin123',
        role: 'administrador',
      },
      {
        id: '2',
        nome: 'Eng. João Silva',
        email: 'joao@erp.com',
        password: 'eng123',
        role: 'engenharia',
      },
      {
        id: '3',
        nome: 'Prod. Maria Santos',
        email: 'maria@erp.com',
        password: 'prod123',
        role: 'producao',
      },
      {
        id: '4',
        nome: 'Orç. Carlos Souza',
        email: 'carlos@erp.com',
        password: 'orc123',
        role: 'orcamentista',
      },
      {
        id: '5',
        nome: 'Fin. Paula Ribeiro',
        email: 'financeiro@erp.com',
        password: 'fin123',
        role: 'financeiro',
      },
    ];
    
    const foundUser = mockUsers.find(
      u => u.email === credentials.email && u.password === credentials.password
    );
    
    if (!foundUser) {
      throw new Error('Credenciais inválidas');
    }
    
    const { password, ...userWithoutPassword } = foundUser;
    
    return {
      user: userWithoutPassword,
      token: `mock-token-${userWithoutPassword.id}`,
    };
  }

  /**
   * Realiza logout
   */
  async logout(): Promise<void> {
    // Quando backend estiver pronto, será:
    // return getHttpClient().post('/api/auth/logout');
    
    // Por enquanto, apenas simula delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  /**
   * Verifica se o token é válido
   */
  async verifyToken(_token: string): Promise<User | null> {
    // Quando backend estiver pronto, será:
    // return getHttpClient().get<User>('/api/auth/verify', {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    
    // Mock: extrai ID do token e retorna usuário
    return null; // Por enquanto, usa AuthContext
  }

  /**
   * Renova o token
   */
  async refreshToken(token: string): Promise<string> {
    // Quando backend estiver pronto, será:
    // const response = await getHttpClient().post<{ token: string }>(
    //   '/api/auth/refresh',
    //   { token }
    // );
    // return response.token;
    
    return token; // Mock
  }
}

export const authService = new AuthService();
