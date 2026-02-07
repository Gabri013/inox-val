import { BaseFirestoreService } from './base.service';
import { COLLECTIONS } from '@/types/firebase';
import type { OrdemProducaoCompleta } from '@/domains/producao';

export class ProducaoService extends BaseFirestoreService<OrdemProducaoCompleta> {
  constructor() {
    super(COLLECTIONS.ordensProducao);
  }
}
