import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

// Steps
import { CustomerStep } from '@/components/wizard/CustomerStep';
import { ProductStep } from '@/components/wizard/ProductStep';
import { DimensionsStep } from '@/components/wizard/DimensionsStep';
import { BOMStep } from '@/components/wizard/BOMStep';
import { NestingStep } from '@/components/wizard/NestingStep';
import { CostsStep } from '@/components/wizard/CostsStep';
import { PricingStep } from '@/components/wizard/PricingStep';
import { ReviewStep } from '@/components/wizard/ReviewStep';

// Engine
import { 
  createQuoteDraft, 
  finalizeQuote,
  QuoteDraftInput,
  QuoteDraftResult
} from '@/domains/engine/quote';
import { BOM, SheetPart, TubePart } from '@/domains/engine/types';
import { DEFAULT_RULESET } from '@/domains/engine/ruleset';

const STEPS = [
  { id: 'customer', title: 'Cliente', description: 'Dados do cliente' },
  { id: 'product', title: 'Produto', description: 'Tipo e modelo' },
  { id: 'dimensions', title: 'Dimensões', description: 'Tamanhos e opções' },
  { id: 'bom', title: 'BOM', description: 'Lista de materiais' },
  { id: 'nesting', title: 'Nesting', description: 'Otimização de chapas' },
  { id: 'costs', title: 'Custos', description: 'Materiais e processos' },
  { id: 'pricing', title: 'Precificação', description: 'Margem e preço' },
  { id: 'review', title: 'Revisão', description: 'Finalizar orçamento' },
];

export default function QuoteWizardPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [draftResult, setDraftResult] = useState<QuoteDraftResult | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerContact: '',
    customerEmail: '',
    
    productType: 'mesa' as 'mesa' | 'bancada' | 'armario' | 'custom',
    productModel: '',
    
    dimensions: {
      length: 2000,
      width: 700,
      height: 850,
      thickness: 1.2,
      finish: 'POLIDO' as 'POLIDO' | 'ESCOVADO' | '2B',
      hasBacksplash: false,
      hasShelf: false,
      feetCount: 4,
    },
    
    bom: {
      sheets: [] as SheetPart[],
      tubes: [] as TubePart[],
      accessories: [] as { id: string; sku: string; quantity: number }[],
      processes: ['CORTE_LASER', 'DOBRA', 'MONTAGEM', 'EMBALAGEM'] as string[],
    },
    
    pricing: {
      method: 'target-margin' as const,
      targetMargin: 25,
      discount: 0,
    },
  });
  
  const progress = ((currentStep + 1) / STEPS.length) * 100;
  
  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      // Preparar input para o engine
      const input: QuoteDraftInput = {
        bom: formData.bom,
        materials: new Map(), // TODO: carregar do repositório
        processes: new Map(), // TODO: carregar do repositório
        availableSheets: [], // TODO: carregar do repositório
        ruleset: DEFAULT_RULESET,
        quoteDate: new Date().toISOString(),
        customerId: formData.customerId,
        customerName: formData.customerName,
      };
      
      const result = createQuoteDraft(input);
      if (result.success && result.data) {
        setDraftResult(result.data);
      }
    } finally {
      setIsCalculating(false);
    }
  };
  
  const handleFinalize = async () => {
    if (!draftResult) return;
    
    const snapshot = finalizeQuote(
      draftResult,
      {
        bom: formData.bom,
        materials: new Map(),
        processes: new Map(),
        availableSheets: [],
        ruleset: DEFAULT_RULESET,
        quoteDate: new Date().toISOString(),
        customerId: formData.customerId,
        customerName: formData.customerName,
      },
      'current-user-id', // TODO: pegar do auth
      'current-company-id' // TODO: pegar do auth
    );
    
    // TODO: Salvar no repositório
    navigate(`/quotes/${snapshot.id}`);
  };
  
  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <CustomerStep
            data={formData}
            onChange={updateFormData}
          />
        );
      case 1:
        return (
          <ProductStep
            data={formData}
            onChange={updateFormData}
          />
        );
      case 2:
        return (
          <DimensionsStep
            data={formData}
            onChange={updateFormData}
          />
        );
      case 3:
        return (
          <BOMStep
            data={formData}
            onChange={updateFormData}
          />
        );
      case 4:
        return (
          <NestingStep
            data={formData}
            draftResult={draftResult}
            onCalculate={handleCalculate}
            isCalculating={isCalculating}
          />
        );
      case 5:
        return (
          <CostsStep
            draftResult={draftResult}
          />
        );
      case 6:
        return (
          <PricingStep
            data={formData}
            draftResult={draftResult}
            onChange={updateFormData}
          />
        );
      case 7:
        return (
          <ReviewStep
            data={formData}
            draftResult={draftResult}
            onFinalize={handleFinalize}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Novo Orçamento</h1>
        <p className="text-muted-foreground">
          Preencha os dados para gerar o orçamento
        </p>
      </div>
      
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex-1">
              <div className="flex items-center gap-2">
                <div className={`
                  flex items-center justify-center size-8 rounded-full text-sm font-medium
                  ${index < currentStep ? 'bg-green-500 text-white' : 
                    index === currentStep ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}
                `}>
                  {index < currentStep ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`h-0.5 mt-4 ${index < currentStep ? 'bg-green-500' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Progress 
            value={progress} 
            className="h-2"
            style={{
              background: 'hsl(var(--muted))',
              '--tw-progress-bg': index < currentStep ? 'hsl(var(--success))' : 'hsl(var(--primary))'
            }}
          />
        </div>
      </div>
      
      {/* Step Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {STEPS[currentStep].title}
            {draftResult?.errors.length ? (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            ) : draftResult?.valid ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : null}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {STEPS[currentStep].description}
          </p>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Salvar Rascunho
          </Button>
          
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext}>
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleFinalize}
              disabled={!draftResult?.valid}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}