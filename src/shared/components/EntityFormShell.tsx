/**
 * Shell padrão para formulários de entidades do ERP
 * Fornece layout, validação, dirty state e ações padrão
 */

import { ReactNode, FormEvent, useEffect, useState, isValidElement } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { Loader2, Save, X } from 'lucide-react';

export interface EntityFormShellProps {
  /**
   * Título do formulário
   */
  title: string;
  
  /**
   * Descrição (opcional)
   */
  description?: string;
  
  /**
   * Subtítulo (alias para description)
   */
  subtitle?: string;
  
  /**
   * Ícone para exibir no header
   */
  icon?: any;
  
  /**
   * Conteúdo do formulário
   */
  children: ReactNode;
  
  /**
   * Se está em modo de loading/salvando
   */
  isLoading?: boolean;
  
  /**
   * Callback de submit
   */
  onSubmit: () => void | Promise<void>;
  
  /**
   * Callback de cancelar
   */
  onCancel: () => void;
  
  /**
   * Se o formulário foi modificado (dirty state)
   */
  isDirty?: boolean;
  
  /**
   * Label do botão de submit
   */
  submitLabel?: string;
  
  /**
   * Se deve desabilitar o botão de submit
   */
  disableSubmit?: boolean;
  
  /**
   * Ações adicionais (botões customizados)
   */
  additionalActions?: ReactNode;
  
  /**
   * Ações do header (botões no cabeçalho)
   */
  actions?: ReactNode;
}

export function EntityFormShell({
  title,
  description,
  subtitle,
  icon,
  children,
  isLoading = false,
  onSubmit,
  onCancel,
  isDirty = false,
  submitLabel = 'Salvar',
  disableSubmit = false,
  additionalActions,
  actions,
}: EntityFormShellProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Usa subtitle como fallback para description
  const displayDescription = description || subtitle;

  // Previne saída acidental do formulário com alterações
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit();
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelConfirm(true);
    } else {
      onCancel();
    }
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    onCancel();
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              {icon && (
                <div className="p-2 bg-primary/10 rounded-lg">
                  {isValidElement(icon) ? (
                    icon
                  ) : (
                    (() => {
                      const IconComponent = icon as React.ElementType;
                      return <IconComponent className="size-6 text-primary" />;
                    })()
                  )}
                </div>
              )}
              <div className="flex-1">
                <CardTitle>{title}</CardTitle>
                {displayDescription && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {displayDescription}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex items-center gap-2">
                  {actions}
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {children}
            
            {/* Ações do formulário */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center gap-2">
                {additionalActions}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                
                <Button
                  type="submit"
                  disabled={disableSubmit || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {submitLabel}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Dialog de confirmação de cancelamento */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Tem certeza que deseja sair sem salvar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>
              Descartar alterações
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}