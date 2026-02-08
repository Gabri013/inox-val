import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { calculadoraService } from './service';
import type { CalculadoraSalva, ResultadoCalculadora } from './types';

/**
 * Hooks React Query para Calculadora Rápida
 */

const QUERY_KEY = 'calculadora';

/**
 * Hook para listar cálculos salvos
 */
export function useCalculadoras(filtros?: {
  vendedor?: string;
  cliente?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'list', filtros],
    queryFn: () => calculadoraService.listar(filtros),
  });
}

/**
 * Hook para buscar um cálculo específico
 */
export function useCalculadora(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, 'detail', id],
    queryFn: () => calculadoraService.buscarPorId(id!),
    enabled: !!id,
  });
}

/**
 * Hook para salvar novo cálculo
 */
export function useSalvarCalculadora() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: {
      nome: string;
      cliente?: string;
      resultado: ResultadoCalculadora;
    }) => calculadoraService.salvar(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook para atualizar cálculo existente
 */
export function useAtualizarCalculadora() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: Partial<CalculadoraSalva> }) =>
      calculadoraService.atualizar(id, dados),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.id] });
    },
  });
}

/**
 * Hook para excluir cálculo
 */
export function useExcluirCalculadora() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => calculadoraService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook para duplicar cálculo
 */
export function useDuplicarCalculadora() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => calculadoraService.duplicar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook para converter cálculo em orçamento/pedido
 */
export function useConverterCalculadora() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tipo }: { id: string; tipo: 'orcamento' | 'pedido' }) =>
      calculadoraService.converter(id, tipo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook para exportar PDF
 */
export function useExportarPDF() {
  return useMutation({
    mutationFn: async () => {
      const blob = await calculadoraService.exportarPDF();
      
      // Criar URL temporária e baixar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'calculadora.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}
