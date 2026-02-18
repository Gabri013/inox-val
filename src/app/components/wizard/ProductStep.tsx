import { Label } from '@/app/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Input } from '@/app/components/ui/input';

interface Props {
  data: any;
  onChange: (updates: any) => void;
}

const PRODUCT_TYPES = [
  { id: 'mesa', label: 'Mesa', description: 'Mesas em aço inox' },
  { id: 'bancada', label: 'Bancada', description: 'Bancadas de cozinha' },
  { id: 'armario', label: 'Armário', description: 'Armários e estufas' },
  { id: 'custom', label: 'Personalizado', description: 'Produto customizado' },
];

export function ProductStep({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          Tipo de Produto <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={data.productType}
          onValueChange={(value) => onChange({ productType: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3"
        >
          {PRODUCT_TYPES.map((type) => (
            <div
              key={type.id}
              className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors duration-200"
            >
              <RadioGroupItem value={type.id} id={type.id} />
              <div className="flex-1">
                <Label htmlFor={type.id} className="font-medium cursor-pointer">
                  {type.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {type.description}
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>
        {!data.productType && (
          <p className="text-xs text-destructive">Selecione um tipo de produto</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="productModel" className="text-sm font-medium text-foreground">
          Modelo <span className="text-destructive">*</span>
        </Label>
        <Select
          value={data.productModel}
          onValueChange={(value: string) => onChange({ productModel: value })}
        >
          <SelectTrigger id="productModel">
            <SelectValue placeholder="Selecione um modelo" />
          </SelectTrigger>
          <SelectContent>
            {data.productType === 'mesa' && (
              <>
                <SelectItem value="MPLC_4P">Mesa Pés Cavalete 4 lugares</SelectItem>
                <SelectItem value="MPLC_6P">Mesa Pés Cavalete 6 lugares</SelectItem>
                <SelectItem value="MPLCP_4P">Mesa Pés Cavalete c/ Prateleira 4 lugares</SelectItem>
                <SelectItem value="MPLCP_6P">Mesa Pés Cavalete c/ Prateleira 6 lugares</SelectItem>
                <SelectItem value="MPLEP_4P">Mesa Pés Lira c/ Prateleira 4 lugares</SelectItem>
                <SelectItem value="MPLEP_6P">Mesa Pés Lira c/ Prateleira 6 lugares</SelectItem>
              </>
            )}
            {data.productType === 'bancada' && (
              <>
                <SelectItem value="BCS_1500">Bancada Cozinha 1500mm</SelectItem>
                <SelectItem value="BCS_2000">Bancada Cozinha 2000mm</SelectItem>
                <SelectItem value="BCS_2500">Bancada Cozinha 2500mm</SelectItem>
              </>
            )}
            {data.productType === 'armario' && (
              <>
                <SelectItem value="ARM_2P">Armário 2 portas</SelectItem>
                <SelectItem value="ARM_4P">Armário 4 portas</SelectItem>
                <SelectItem value="EST_3P">Estufa 3 prateleiras</SelectItem>
              </>
            )}
            {data.productType === 'custom' && (
              <SelectItem value="CUSTOM">Produto Personalizado</SelectItem>
            )}
          </SelectContent>
        </Select>
        {!data.productModel && (
          <p className="text-xs text-destructive">Selecione um modelo</p>
        )}
      </div>
      
      {data.productType === 'custom' && (
        <div className="space-y-2">
          <Label htmlFor="customDescription" className="text-sm font-medium text-foreground">
            Descrição do Produto <span className="text-destructive">*</span>
          </Label>
          <Input
            id="customDescription"
            placeholder="Descreva o produto desejado"
            className="mt-1"
            value={data.customDescription || ''}
            onChange={(e) => onChange({ customDescription: e.target.value })}
          />
          {!data.customDescription && (
            <p className="text-xs text-destructive">Descreva o produto personalizado</p>
          )}
        </div>
      )}
    </div>
  );
}