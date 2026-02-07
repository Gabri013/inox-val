import { ReactNode, useState, isValidElement } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "../ui/breadcrumb";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "../ui/collapsible";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Trash2,
  ArrowUpDown
} from "lucide-react";
import { cn } from "../ui/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface StatCard {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

export interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  className?: string;
}

export interface TableAction<T> {
  icon: any;
  label: string;
  onClick: (item: T) => void;
  variant?: "ghost" | "destructive";
  show?: (item: T) => boolean;
}

export interface ListPageProps<T> {
  // Breadcrumb
  breadcrumbs?: BreadcrumbItem[];
  
  // Header
  title: string;
  description?: string;
  icon?: any; // Changed from ReactNode to any to accept component or element
  
  // Actions
  onNew?: () => void;
  newButtonLabel?: string;
  showExport?: boolean;
  onExport?: () => void;
  customActions?: ReactNode;
  
  // Stats
  stats?: StatCard[];
  
  // Search and filters
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filterContent?: ReactNode;
  showFilters?: boolean;
  
  // Table
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  actions?: TableAction<T>[];
  emptyMessage?: string;
  
  // Pagination
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
}

export function ListPage<T>({
  breadcrumbs,
  title,
  description,
  icon,
  onNew,
  newButtonLabel = "Novo",
  showExport = true,
  onExport,
  customActions,
  stats,
  searchPlaceholder = "Buscar...",
  searchValue = "",
  onSearchChange,
  filterContent,
  showFilters = true,
  columns,
  data,
  keyExtractor,
  actions,
  emptyMessage = "Nenhum registro encontrado",
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems,
  onPageChange,
  showPagination = true
}: ListPageProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || data.length);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="p-2 bg-primary/10 rounded-lg mt-1">
              {isValidElement(icon) ? (
                icon
              ) : (
                (() => {
                  const IconComponent = icon as React.ElementType;
                  return <IconComponent className="size-8 text-primary" />;
                })()
              )}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {customActions}
          {showExport && (
            <Button variant="outline" onClick={onExport} className="gap-2">
              <Download className="size-4" />
              Exportar
            </Button>
          )}
          {onNew && (
            <Button onClick={onNew} className="gap-2">
              <Plus className="size-4" />
              {newButtonLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && stats.length > 0 && (
        <div className={cn(
          "grid gap-4",
          stats.length === 1 && "md:grid-cols-1",
          stats.length === 2 && "md:grid-cols-2",
          stats.length === 3 && "md:grid-cols-3",
          stats.length === 4 && "md:grid-cols-4",
          stats.length >= 5 && "md:grid-cols-5"
        )}>
          {stats.map((stat, index) => (
            <Card key={index} className={stat.className}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  {stat.icon ? (
                    isValidElement(stat.icon) ? (
                      stat.icon
                    ) : (
                      (() => {
                        const IconComponent = stat.icon as React.ElementType;
                        return <IconComponent className="size-5 text-muted-foreground" />;
                      })()
                    )
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.description && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Lista de Registros</CardTitle>
              
              {/* Search and Filter Toggle */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onSearchChange && (
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder={searchPlaceholder}
                      value={searchValue}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="pl-8 w-full sm:w-[300px]"
                    />
                  </div>
                )}
                
                {showFilters && filterContent && (
                  <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Filter className="size-4" />
                        Filtros
                        <ChevronDown className={cn(
                          "size-4 transition-transform",
                          filtersOpen && "rotate-180"
                        )} />
                      </Button>
                    </CollapsibleTrigger>
                  </Collapsible>
                )}
              </div>
            </div>

            {/* Collapsible Filters */}
            {showFilters && filterContent && (
              <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                <CollapsibleContent className="space-y-4">
                  <div className="p-4 border border-border rounded-lg bg-muted/50">
                    {filterContent}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead 
                      key={column.key}
                      className={cn(column.className, column.sortable && "cursor-pointer select-none")}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        {column.sortable && (
                          <ArrowUpDown className="size-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableHead>
                  ))}
                  {actions && actions.length > 0 && (
                    <TableHead className="text-right">Ações</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={columns.length + (actions ? 1 : 0)} 
                      className="text-center py-8 text-muted-foreground"
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={keyExtractor(item)}>
                      {columns.map((column) => (
                        <TableCell key={column.key} className={column.className}>
                          {column.render ? column.render(item) : (item as any)[column.key]}
                        </TableCell>
                      ))}
                      {actions && actions.length > 0 && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {actions.map((action, actionIndex) => {
                              const shouldShow = action.show ? action.show(item) : true;
                              if (!shouldShow) return null;
                              
                              const Icon = action.icon;
                              return (
                                <Button
                                  key={actionIndex}
                                  variant={action.variant || "ghost"}
                                  size="icon"
                                  onClick={() => action.onClick(item)}
                                  title={action.label}
                                >
                                  {Icon && <Icon className="size-4" />}
                                </Button>
                              );
                            })}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {showPagination && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {startItem} a {endItem} de {totalItems || data.length} registros
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange && onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="size-4" />
                  Anterior
                </Button>
                
                <div className="text-sm">
                  Página {currentPage} de {totalPages}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange && onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componentes auxiliares exportados para uso conveniente
export { Edit as EditIcon, Eye as EyeIcon, Trash2 as DeleteIcon } from "lucide-react";