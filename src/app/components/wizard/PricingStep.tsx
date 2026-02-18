import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { QuoteDraftResult } from '@/domains/engine/quote';

interface Props {
  data: any;
  draftResult: QuoteDraftResult | null;
  onChange: (updates: any) => void;
}

export function PricingStep({ data, draftResult, onChange }: Props) {
  const { pricing } = data;
  
  const targetPrice = draftResult?.pricing.targetPrice || 0;
  const calculatedMargin = draftResult?.pricing.margin || 0;
  
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base">Método de Precificação</Label>
        <Select
          value={pricing.method}
          onValueChange={(value: string) => onChange({
            pricing: { ...pricing, method: value }
          })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="target-margin">Margem Alvo</SelectItem>
            <SelectItem value="cost-plus">Custo Plus</SelectItem>
            <SelectItem value="fixed-price">Preço Fixo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {pricing.method === 'target-margin' && (
        <div>
          <Label>Margem Alvo (%)</Label>
          <Input
            type="number"
            value={pricing.targetMargin}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({
              pricing: { ...pricing, targetMargin: Number(e.target.value) }
            })}
            className="mt-1"
          />
        </div>
      )}
      
      {pricing.method === 'cost-plus' && (
        <div>
          <Label>Markup (%)</Label>
          <Input
            type="number"
            value={pricing.targetMargin}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({
              pricing: { ...pricing, targetMargin: Number(e.target.value) }
            })}
            className="mt-1"
          />
        </div>
      )}
      
      {pricing.method === 'fixed-price' && (
        <div>
          <Label>Preço Fixo (R$)</Label>
          <Input
            type="number"
            value={targetPrice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({
              pricing: { ...pricing, targetMargin: 0 }
            })}
            className="mt-1"
          />
        </div>
      )}
      
      <div>
        <Label>Desconto (%)</Label>
        <Input
          type="number"
          value={pricing.discount}
          onChange={(e) => onChange({
            pricing: { ...pricing, discount: Number(e.target.value) }
          })}
          className="mt-1"
        />
      </div>
      
      {draftResult && (
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Resumo de Preço</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span>Custo Total:</span>
            <span className="text-right">
              R$ {draftResult.costs.total.toFixed(2)}
            </span>
            <span>Preço Alvo:</span>
            <span className="text-right font-bold text-primary">
              R$ {targetPrice.toFixed(2)}
            </span>
            <span>Margem Calculada:</span>
            <span className="text-right">
              {calculatedMargin.toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}