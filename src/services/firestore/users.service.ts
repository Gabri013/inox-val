import { FirestoreService, ServiceResult, getCurrentUserProfile } from "./base";
import { COLLECTIONS } from "@/types/firebase";

export interface UserProfile {
  id: string;
  empresaId: string;
  email: string;
  nome: string;
  role: "ADMIN" | "VENDEDOR" | "ENGENHEIRO" | "OPERADOR" | "COMPRADOR" | "ESTOQUISTA";
  ativo: boolean;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
  updatedBy?: string;
  isDeleted?: boolean;
}

class UsersService extends FirestoreService<UserProfile> {
  constructor() {
    super(COLLECTIONS.users, { softDelete: false });
  }

  async getCurrentProfile(): Promise<ServiceResult<UserProfile>> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile) return { success: false, error: "Perfil não encontrado" };
      return { success: true, data: profile as UserProfile };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Erro ao carregar perfil" };
    }
  }
}

export const usersService = new UsersService();
