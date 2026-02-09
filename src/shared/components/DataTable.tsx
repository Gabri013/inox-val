/**
 * Componente DataTable genérico para listagens do ERP
 */

import { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/app/components/ui/pagination';
import { Skeleton } from '@/app/components/ui/skeleton';

export interface DataTableColumn<T> {
  /**
   * Chave da coluna (deve corresponder à propriedade do objeto)
   */
  key: string;
  
  /**
   * Label exibido no cabeçalho
   */
  label: string;
  
  /**
   * Função de renderização customizada (opcional)
   */
  render?: (value: any, row: T) => ReactNode;
  
  /**
   * Se a coluna é ordenável
   */
  sortable?: boolean;
  
  /**
   * Largura da coluna (opcional)
   */
  width?: string;
  
  /**
   * Alinhamento do conteúdo
   */
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  /**
   * Colunas da tabela
   */
  columns: DataTableColumn<T>[];
  
  /**
   * Dados da tabela
   */
  data: T[];
  
  /**
   * Função para extrair ID único de cada linha
   */
  getRowId: (row: T) => string;
  
  /**
   * Estado de loading
   */
  isLoading?: boolean;
  
  /**
   * Total de registros (para paginação)
   */
  total?: number;
  
  /**
   * Página atual (1-based)
   */
  currentPage?: number;
  
  /**
   * Tamanho da página
   */
  pageSize?: number;
  
  /**
   * Callback de mudança de página
   */
  onPageChange?: (page: number) => void;
  
  /**
   * Callback de ordenação
   */
  onSort?: (key: string) => void;
  
  /**
   * Coluna atual de ordenação
   */
  sortBy?: string;
  
  /**
   * Direção da ordenação
   */
  sortOrder?: 'asc' | 'desc';
  
  /**
   * Mensagem quando não há dados
   */
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  isLoading = false,
  total = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onSort,
  sortBy,
  sortOrder,
  emptyMessage = 'Nenhum registro encontrado',
  onRowClick,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / pageSize);
  
  // Renderização de loading
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }
  
  // Renderização de lista vazia
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  style={{ width: column.width }}
                  className={column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}
                >
                  {column.sortable && onSort ? (
                    <button
                      onClick={() => onSort(column.key)}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      {column.label}
                      {sortBy === column.key && (
                        <span className="text-xs">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={getRowId(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'cursor-pointer transition-colors hover:bg-primary/10 hover:shadow-sm' : ''}
              >
                {columns.map((column) => {
                  const value = (row as any)[column.key];
                  const content = column.render
                    ? column.render(value, row)
                    : value;
                  return (
                    <TableCell
                      key={column.key}
                      className={column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}
                    >
                      {content}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && onPageChange && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {/* Páginas */}
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const pageNumber = i + 1;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    onClick={() => onPageChange(pageNumber)}
                    isActive={currentPage === pageNumber}
                    className="cursor-pointer"
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            {totalPages > 5 && <PaginationEllipsis />}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      
      {/* Info de paginação */}
      {total > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Mostrando {(currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, total)} de {total} registros
        </div>
      )}
    </div>
  );
}
