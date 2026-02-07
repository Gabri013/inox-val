/**
 * Schemas de validação para usuários (Zod)
 */

import { z } from 'zod';

/**
 * Schema para role
 */
export const userRoleSchema = z.enum([
  'Administrador',
  'Dono',
  'Compras',
  'Gerencia',
  'Financeiro',
  'Producao',
  'Engenharia',
  'Orcamentista',
  'Vendedor',
]);

/**
 * Schema para status
 */
export const userStatusSchema = z.enum(['ativo', 'inativo', 'ferias']);

/**
 * Schema para criar usuário
 */
export const createUsuarioSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  
  email: z.string()
    .email('Email inválido')
    .toLowerCase(),
  
  senha: z.string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(50, 'Senha deve ter no máximo 50 caracteres'),
  
  role: userRoleSchema,
  
  status: userStatusSchema.default('ativo'),
  
  telefone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido. Use formato: (XX) XXXXX-XXXX')
    .optional(),
  
  departamento: z.string()
    .min(2, 'Departamento deve ter no mínimo 2 caracteres')
    .max(50, 'Departamento deve ter no máximo 50 caracteres'),
  
  dataAdmissao: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida. Use formato: YYYY-MM-DD')
    .optional(),
});

/**
 * Schema para atualizar usuário
 */
export const updateUsuarioSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
  
  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .optional(),
  
  senha: z.string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(50, 'Senha deve ter no máximo 50 caracteres')
    .optional(),
  
  role: userRoleSchema.optional(),
  
  status: userStatusSchema.optional(),
  
  telefone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido. Use formato: (XX) XXXXX-XXXX')
    .optional(),
  
  departamento: z.string()
    .min(2, 'Departamento deve ter no mínimo 2 caracteres')
    .max(50, 'Departamento deve ter no máximo 50 caracteres')
    .optional(),
  
  dataAdmissao: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida. Use formato: YYYY-MM-DD')
    .optional(),
});

/**
 * Schema para filtros
 */
export const usuariosFiltersSchema = z.object({
  search: z.string().optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  departamento: z.string().optional(),
});

// Tipos inferidos dos schemas
export type CreateUsuarioFormData = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioFormData = z.infer<typeof updateUsuarioSchema>;
export type UsuariosFiltersData = z.infer<typeof usuariosFiltersSchema>;
