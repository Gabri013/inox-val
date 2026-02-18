import { User, UserRole, Company, ROLE_PERMISSIONS } from './types';

export interface AuthService {
  // Authentication
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  
  // User management
  createUser(email: string, role: UserRole, companyId: string): Promise<User>;
  updateUserRole(userId: string, role: UserRole): Promise<void>;
  deactivateUser(userId: string): Promise<void>;
  
  // Company management
  createCompany(data: Omit<Company, 'id' | 'createdAt' | 'active'>): Promise<Company>;
  getCompany(companyId: string): Promise<Company | null>;
  
  // Permissions
  hasPermission(user: User, permission: string): boolean;
  hasAnyPermission(user: User, permissions: string[]): boolean;
  hasAllPermissions(user: User, permissions: string[]): boolean;
}

export function createAuthService(): AuthService {
  return {
    async login(_email: string, _password: string): Promise<User> {
      // TODO: Implement with Firebase Auth
      throw new Error('Not implemented');
    },
    
    async logout(): Promise<void> {
      // TODO: Implement with Firebase Auth
      throw new Error('Not implemented');
    },
    
    async getCurrentUser(): Promise<User | null> {
      // TODO: Implement with Firebase Auth
      return null;
    },
    
    async createUser(_email: string, _role: UserRole, _companyId: string): Promise<User> {
      // TODO: Implement with Firebase Auth + Firestore
      throw new Error('Not implemented');
    },
    
    async updateUserRole(_userId: string, _role: UserRole): Promise<void> {
      // TODO: Implement with Firestore
      throw new Error('Not implemented');
    },
    
    async deactivateUser(_userId: string): Promise<void> {
      // TODO: Implement with Firestore
      throw new Error('Not implemented');
    },
    
    async createCompany(_data: Omit<Company, 'id' | 'createdAt' | 'active'>): Promise<Company> {
      // TODO: Implement with Firestore
      throw new Error('Not implemented');
    },
    
    async getCompany(_companyId: string): Promise<Company | null> {
      // TODO: Implement with Firestore
      return null;
    },
    
    hasPermission(user: User, permission: string): boolean {
      const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
      return rolePermissions.includes(permission) || user.permissions.includes(permission);
    },
    
    hasAnyPermission(user: User, permissions: string[]): boolean {
      return permissions.some(p => this.hasPermission(user, p));
    },
    
    hasAllPermissions(user: User, permissions: string[]): boolean {
      return permissions.every(p => this.hasPermission(user, p));
    }
  };
}
