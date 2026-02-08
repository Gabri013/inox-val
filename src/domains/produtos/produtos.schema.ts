/**
 * Schemas de validação para Produtos
 */

import { z } from 'zod';
import { requiredString, currencySchema } from '@/shared/lib/validators';

export const createProdutoSchema = z.object({
  codigo: requiredString('Código é obrigatório'),
  nome: requiredString('Nome é obrigatório'),
  descricao: z.string().optional(),
  tipo: z.enum(['Acabado', 'Semiacabado', 'Matéria-Prima', 'Componente']),
  unidade: z.enum(['UN', 'KG', 'MT', 'M2', 'M3', 'LT']),
  preco: currencySchema,
  custo: currencySchema,
  estoqueMinimo: z.number().nonnegative('Estoque mínimo deve ser positivo'),
  ativo: z.boolean().default(true),
  observacoes: z.string().optional(),
});

export const updateProdutoSchema = createProdutoSchema.partial();

export type CreateProdutoFormData = z.infer<typeof createProdutoSchema>;
export type UpdateProdutoFormData = z.infer<typeof updateProdutoSchema>;
