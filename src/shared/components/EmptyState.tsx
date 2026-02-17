/**
 * Componente de estado vazio reutilizável
 */

import { ReactNode, isValidElement, ComponentType } from 'react';
import { Button } from '@/app/components/ui/button';

export interface EmptyStateProps {
  /**
   * Ícone a ser exibido
   */
  icon?: ComponentType<{ size?: number | string; className?: string }>;
  
  /**
   * Título
   */
  title: string;
  
  /**
   * Descrição
   */
  description?: string;
  
  /**
   * Ação primária (opcional)
   */
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/10">
      {Icon && (
        <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" />
      )}
      
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      
      {description && (
        <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
          {description}
        </p>
      )}
      
      {action && (
        <Button onClick={action.onClick}>
          {action.icon ? (
            isValidElement(action.icon) ? (
              action.icon
            ) : (
              (() => {
                const IconComponent = action.icon as React.ElementType;
                return <IconComponent className="mr-2 size-4" />;
              })()
            )
          ) : null}
          {action.label}
        </Button>
      )}
    </div>
  );
}
