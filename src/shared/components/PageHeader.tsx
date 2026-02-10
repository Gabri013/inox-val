/**
 * Componente PageHeader padrão para todas as páginas do ERP
 */

import React, { ReactNode, isValidElement } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/app/components/ui/breadcrumb';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  /**
   * Título principal da página
   */
  title: string;
  
  /**
   * Descrição/subtítulo (opcional)
   */
  description?: string;
  
  /**
   * Subtítulo (alias para description - aceita ambos)
   */
  subtitle?: string;
  
  /**
   * Ícone para exibir ao lado do título
   */
  icon?: any;
  
  /**
   * Items do breadcrumb
   */
  breadcrumbs?: BreadcrumbItem[];
  
  /**
   * Ações da página (botões, etc)
   */
  actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  subtitle,
  icon,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  // Usa subtitle como fallback para description
  const displayDescription = description || subtitle;
  
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Breadcrumb */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.href || '#'}>
                        {item.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Título e ações */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {displayDescription && (
              <p className="text-muted-foreground mt-2">{displayDescription}</p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
