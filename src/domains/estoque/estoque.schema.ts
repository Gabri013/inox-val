/**
 * Schemas de validação para Estoque
 */

import { z } from 'zod';
import { requiredString, quantitySchema } from '@/shared/lib/validators';

export const createMovimentoSchema = z.object({
  produtoId: requiredString('Produto é obrigatório'),
  tipo: z.enum(['ENTRADA', 'SAIDA', 'RESERVA', 'ESTORNO', 'AJUSTE']),
  quantidade: quantitySchema,
  quantidadeLancada: quantitySchema.optional(),
  unidadeLancada: z.string().optional(),
  fatorConversao: z.number().positive().optional(),
  origem: requiredString('Origem é obrigatória'),
  observacoes: z.string().optional(),
  usuario: requiredString('Usuário é obrigatório'),
});

export type CreateMovimentoFormData = z.infer<typeof createMovimentoSchema>;
