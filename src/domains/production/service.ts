import { QuoteSnapshot, ProcessKey } from '../engine/types';
import { 
  ProductionOrder, 
  ProductionPart, 
  ProcessRoute, 
  ProductionService, 
  ProductionRepository,
  ProductionStatus,
  ProductionMetrics
} from './types';

export function createProductionService(repository: ProductionRepository): ProductionService {
  return {
    repository,
    
    async createFromQuote(snapshot: QuoteSnapshot): Promise<ProductionOrder> {
      const parts: ProductionPart[] = [];
      
      // Converter peças do BOM
      for (const sheet of snapshot.bom.sheets) {
        for (let i = 0; i < sheet.quantity; i++) {
          parts.push({
            id: `${sheet.id}_${i}`,
            partId: sheet.id,
            description: `Peça ${sheet.id}`,
            quantity: 1,
            materialKey: sheet.materialKey,
            dimensions: {
              widthMm: sheet.blank.widthMm,
              heightMm: sheet.blank.heightMm
            },
            status: 'pending',
            completedProcesses: []
          });
        }
      }
      
      // Criar roteiro
      const route = createRoute(snapshot.bom.processes);
      
      return repository.createOrder({
        createdBy: snapshot.createdBy,
        companyId: snapshot.companyId,
        quoteId: snapshot.id,
        quoteNumber: snapshot.quoteNumber,
        customerId: snapshot.customerId,
        customerName: snapshot.customerName,
        parts,
        route,
        status: 'pending'
      });
    },
    
    async startProduction(orderId: string): Promise<void> {
      await repository.updateOrderStatus(orderId, 'cutting');
    },
    
    async completeProduction(orderId: string): Promise<void> {
      await repository.updateOrderStatus(orderId, 'completed');
    },
    
    async getProductionMetrics(companyId: string): Promise<ProductionMetrics> {
      const orders = await repository.listOrders(companyId);
      
      const byStatus: Record<ProductionStatus, number> = {
        pending: 0,
        cutting: 0,
        bending: 0,
        welding: 0,
        finishing: 0,
        assembly: 0,
        completed: 0,
        delivered: 0
      };
      
      for (const order of orders) {
        byStatus[order.status]++;
      }
      
      return {
        totalOrders: orders.length,
        byStatus,
        averageLeadTime: 0, // TODO: calcular
        onTimeDelivery: 0 // TODO: calcular
      };
    }
  };
}

function createRoute(processes: ProcessKey[]): ProcessRoute[] {
  const processLabels: Record<ProcessKey, string> = {
    'CORTE_LASER': 'Corte a Laser',
    'CORTE_GUILHOTINA': 'Corte Guilhotina',
    'CORTE_PLASMA': 'Corte Plasma',
    'DOBRA': 'Dobra',
    'SOLDA_TIG': 'Solda TIG',
    'SOLDA_MIG': 'Solda MIG',
    'SOLDA_LASER': 'Solda Laser',
    'POLIMENTO': 'Polimento',
    'ESCOVADO': 'Escovado',
    'PASSIVACAO': 'Passivação',
    'MONTAGEM': 'Montagem',
    'EMBALAGEM': 'Embalagem',
    'FRETE': 'Frete',
    'CORTE_TUBO': 'Corte de Tubo',
    'DOBRA_TUBO': 'Dobra de Tubo'
  };
  
  return processes.map((processKey, index) => ({
    processKey,
    processLabel: processLabels[processKey] || processKey,
    order: index + 1,
    estimatedMinutes: 60, // TODO: estimar
    status: 'pending'
  }));
}
