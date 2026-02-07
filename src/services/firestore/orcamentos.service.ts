import { FirestoreService, ListParams, getCurrentUserProfile } from "./base";
import { COLLECTIONS } from "@/types/firebase";
import type { Orcamento } from "@/app/types/workflow";

class OrcamentosService extends FirestoreService<Orcamento & { ownerId?: string }> {
  constructor() {
    super(COLLECTIONS.orcamentos, { softDelete: true });
  }

  async list(params: ListParams = {}) {
    const profile = await getCurrentUserProfile();
    const role = profile?.role;
    const userId = profile?.id;

    const whereFilters = params.where ? [...params.where] : [];

    if (role === "VENDEDOR" && userId) {
      whereFilters.push({ field: "ownerId", operator: "==", value: userId });
    }

    return super.list({ ...params, where: whereFilters });
  }

  async create(data: Omit<Orcamento, "id"> & { ownerId?: string }) {
    const profile = await getCurrentUserProfile();
    const ownerId = data.ownerId || profile?.id;
    return super.create({ ...(data as any), ownerId } as any);
  }
}

export const orcamentosService = new OrcamentosService();
