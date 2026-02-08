/**
 * Validadores comuns para formulários
 */

import { z } from 'zod';

/**
 * Schema base para validação de email
 */
export const emailSchema = z.string().email('Email inválido');

/**
 * Schema base para validação de telefone brasileiro
 */
export const phoneSchema = z
  .string()
  .regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/, 'Telefone inválido');

/**
 * Schema base para validação de CNPJ
 */
export const cnpjSchema = z
  .string()
  .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido');

/**
 * Schema base para validação de CPF
 */
export const cpfSchema = z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido');

/**
 * Schema para valores monetários (número positivo)
 */
export const currencySchema = z.number().nonnegative('Valor deve ser positivo');

/**
 * Schema para quantidade (número positivo inteiro)
 */
export const quantitySchema = z.number().int().positive('Quantidade deve ser positiva');

/**
 * Helper para criar schema de string obrigatória
 */
export function requiredString(message: string = 'Campo obrigatório') {
  return z.string().min(1, message);
}

/**
 * Helper para criar schema de número obrigatório
 */
export function requiredNumber(message: string = 'Campo obrigatório') {
  return z.number().refine((value) => value !== undefined && value !== null, {
    message,
  });
}

/**
 * Helper para criar schema de data obrigatória
 */
export function requiredDate(message: string = 'Data obrigatória') {
  return z.date().refine((value) => value !== undefined && value !== null, {
    message,
  });
}
