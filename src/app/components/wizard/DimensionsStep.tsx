import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';

interface Props {
  data: any;
  onChange: (updates: any) => void;
}

export function DimensionsStep({ data, onChange }: Props) {
  const { dimensions } = data;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Comprimento (mm)</Label>
          <Input
            type="number"
            value={dimensions.length}
            onChange={(e) => onChange({
              dimensions: { ...dimensions, length: Number(e.target.value) }
            })}
          />
        </div>
        <div>
          <Label>Largura (mm)</Label>
          <Input
            type="number"
            value={dimensions.width}
            onChange={(e) => onChange({
              dimensions: { ...dimensions, width: Number(e.target.value) }
            })}
          />
        </div>
        <div>
          <Label>Altura (mm)</Label>
          <Input
            type="number"
            value={dimensions.height}
            onChange={(e) => onChange({
              dimensions: { ...dimensions, height: Number(e.target.value) }
            })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Espessura (mm)</Label>
          <Select
            value={dimensions.thickness.toString()}
            onValueChange={(v: string) => onChange({
              dimensions: { ...dimensions, thickness: Number(v) }
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1.0">1.0 mm</SelectItem>
              <SelectItem value="1.2">1.2 mm</SelectItem>
              <SelectItem value="1.5">1.5 mm</SelectItem>
              <SelectItem value="2.0">2.0 mm</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Acabamento</Label>
          <Select
            value={dimensions.finish}
            onValueChange={(v: string) => onChange({
              dimensions: { ...dimensions, finish: v }
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="POLIDO">Polido</SelectItem>
              <SelectItem value="ESCOVADO">Escovado</SelectItem>
              <SelectItem value="2B">2B (Natural)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={dimensions.hasBacksplash}
            onCheckedChange={(checked: boolean) => onChange({
              dimensions: { ...dimensions, hasBacksplash: checked }
            })}
          />
          <Label>Com espelho</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={dimensions.hasShelf}
            onCheckedChange={(checked: boolean) => onChange({
              dimensions: { ...dimensions, hasShelf: checked }
            })}
          />
          <Label>Com prateleira</Label>
        </div>
      </div>
    </div>
  );
}