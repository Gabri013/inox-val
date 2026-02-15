import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Switch } from "@/app/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Separator } from "@/app/components/ui/separator";
import { sheetSpecsService } from "@/services/firestore/sheetSpecs.service";
import type { SheetSpecDoc } from "@/services/firestore/sheetSpecs.service";
import type { MaterialNameNormalized } from "../types/opPricing";
import { toast } from "sonner";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

const materialOptions: MaterialNameNormalized[] = ["#304", "#430", "#316", "GALV", "ALUZINC", "ALUMINIO", "ACO"];

type FormState = {
  materialName: MaterialNameNormalized;
  thicknessMm: number;
  widthMm: number;
  heightMm: number;
  costPerSheet: number;
  defaultScrapPct: number;
  defaultEfficiency: number;
  active: boolean;
};

const emptyForm: FormState = {
  materialName: "#304",
  thicknessMm: 1,
  widthMm: 3000,
  heightMm: 1500,
  costPerSheet: 0,
  defaultScrapPct: 0.15,
  defaultEfficiency: 0.8,
  active: true,
};

export function SheetSpecsManager() {
  const [specs, setSpecs] = useState<SheetSpecDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const sortedSpecs = useMemo(
    () =>
      [...specs].sort((a, b) => {
        if (a.materialName === b.materialName) return (a.thicknessMm ?? 0) - (b.thicknessMm ?? 0);
        return a.materialName.localeCompare(b.materialName);
      }),
    [specs]
  );

  const load = async () => {
    setLoading(true);
    try {
      const result = await sheetSpecsService.list({
        orderBy: [
          { field: "materialName", direction: "asc" },
          { field: "thicknessMm", direction: "asc" },
        ],
      });
      if (result.success && result.data) {
        setSpecs(result.data.items);
      } else {
        toast.error(result.error || "Não foi possível carregar sheet_specs.");
      }
    } catch (error) {
      toast.error("Falha ao carregar sheet_specs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async () => {
    if (!form.costPerSheet || form.costPerSheet <= 0) {
      toast.error("Informe o custo da chapa.");
      return;
    }
    setSaving(true);
    try {
      const result = await sheetSpecsService.create({
        materialName: form.materialName,
        thicknessMm: form.thicknessMm,
        widthMm: form.widthMm,
        heightMm: form.heightMm,
        costPerSheet: form.costPerSheet,
        defaultScrapPct: form.defaultScrapPct,
        defaultEfficiency: form.defaultEfficiency,
        active: form.active,
      } as any);
      if (!result.success || !result.data) throw new Error(result.error || "Erro ao criar spec");
      toast.success("Chapa cadastrada.");
      setForm(emptyForm);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar spec.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, patch: Partial<SheetSpecDoc>) => {
    setSaving(true);
    try {
      const result = await sheetSpecsService.update(id, patch as any);
      if (!result.success) throw new Error(result.error || "Erro ao atualizar spec");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar spec.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      const result = await sheetSpecsService.remove(id);
      if (!result.success) throw new Error(result.error || "Erro ao remover spec");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível remover spec.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabela de Chapas (sheet_specs)</CardTitle>
        <CardDescription>Dimensões, custo e sucata padrão por material/espessura.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <Label>Material</Label>
            <select
              className="w-full border rounded-md px-3 py-2 bg-white"
              value={form.materialName}
              onChange={(e) => setForm((prev) => ({ ...prev, materialName: e.target.value as MaterialNameNormalized }))}
            >
              {materialOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Espessura (mm)</Label>
            <Input
              type="number"
              min={0.3}
              step={0.1}
              value={form.thicknessMm}
              onChange={(e) => setForm((prev) => ({ ...prev, thicknessMm: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label>Largura (mm)</Label>
            <Input
              type="number"
              value={form.widthMm}
              onChange={(e) => setForm((prev) => ({ ...prev, widthMm: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label>Altura (mm)</Label>
            <Input
              type="number"
              value={form.heightMm}
              onChange={(e) => setForm((prev) => ({ ...prev, heightMm: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label>Custo da chapa (R$)</Label>
            <Input
              type="number"
              value={form.costPerSheet}
              onChange={(e) => setForm((prev) => ({ ...prev, costPerSheet: Number(e.target.value) }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label>Scrap padrão (%)</Label>
            <Input
              type="number"
              min={0}
              max={95}
              value={form.defaultScrapPct * 100}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, defaultScrapPct: Number(e.target.value) / 100 }))
              }
            />
          </div>
          <div>
            <Label>Eficiência padrão (%)</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={form.defaultEfficiency * 100}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, defaultEfficiency: Number(e.target.value) / 100 }))
              }
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={form.active}
              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, active: checked }))}
              id="sheet-spec-active"
            />
            <Label htmlFor="sheet-spec-active">Ativo</Label>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleCreate} disabled={saving} className="w-full md:w-auto">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span className="ml-2">Adicionar</span>
            </Button>
          </div>
        </div>

        <Separator />

        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Esp. (mm)</TableHead>
                <TableHead>Dimensão</TableHead>
                <TableHead>R$ / chapa</TableHead>
                <TableHead>Scrap</TableHead>
                <TableHead>Eficiência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : sortedSpecs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                    Nenhuma chapa cadastrada.
                  </TableCell>
                </TableRow>
              ) : (
                sortedSpecs.map((spec) => (
                  <TableRow key={spec.id}>
                    <TableCell>{spec.materialName}</TableCell>
                    <TableCell>{spec.thicknessMm.toFixed(2)}</TableCell>
                    <TableCell>
                      {spec.widthMm} x {spec.heightMm}
                    </TableCell>
                    <TableCell>R$ {spec.costPerSheet.toFixed(2)}</TableCell>
                    <TableCell>{((spec.defaultScrapPct ?? 0) * 100).toFixed(1)}%</TableCell>
                    <TableCell>{((spec.defaultEfficiency ?? 0) * 100).toFixed(1)}%</TableCell>
                    <TableCell>
                      <Badge variant={spec.active !== false ? "default" : "secondary"}>
                        {spec.active !== false ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdate(spec.id, { active: !(spec.active !== false) })}
                        disabled={saving}
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {spec.active !== false ? "Desativar" : "Ativar"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(spec.id)} disabled={saving}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remover
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

