import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Switch } from "@/app/components/ui/switch";
import { Separator } from "@/app/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { processRulesService } from "@/services/firestore/processRules.service";
import type { ProcessRuleDoc } from "@/services/firestore/processRules.service";
import type { ProcessCategory } from "../types/opPricing";
import { DEFAULT_PROCESS_RULES } from "../services/processRouting.service";
import { toast } from "sonner";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

const categories: Array<{ value: ProcessCategory; label: string }> = [
  { value: "sheet", label: "Chapa" },
  { value: "tube", label: "Tubo/Perfil" },
  { value: "purchase", label: "Comprado" },
  { value: "other", label: "Outro" },
];

type FormState = {
  processNamePattern: string;
  category: ProcessCategory;
  confidence: number;
  priority: number;
  description?: string;
  active: boolean;
};

const emptyForm: FormState = {
  processNamePattern: "",
  category: "sheet",
  confidence: 0.9,
  priority: 50,
  description: "",
  active: true,
};

export function ProcessRulesManager() {
  const [rules, setRules] = useState<ProcessRuleDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const sortedRules = useMemo(
    () => [...rules].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0)),
    [rules]
  );

  const load = async () => {
    setLoading(true);
    try {
      const result = await processRulesService.list({
        orderBy: [{ field: "priority", direction: "desc" }],
      });
      if (result.success && result.data) {
        setRules(result.data.items);
      } else {
        setRules(DEFAULT_PROCESS_RULES.map((r, idx) => ({ ...r, id: `default-${idx + 1}` })));
        toast.warning("Usando regras padrão em memória (process_rules vazio).");
      }
    } catch (error) {
      setRules(DEFAULT_PROCESS_RULES.map((r, idx) => ({ ...r, id: `default-${idx + 1}` })));
      toast.error("Falha ao carregar process_rules; usando padrão local.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async () => {
    if (!form.processNamePattern.trim()) {
      toast.error("Informe o padrão de processo.");
      return;
    }
    setSaving(true);
    try {
      const result = await processRulesService.create({
        processNamePattern: form.processNamePattern.trim(),
        category: form.category,
        confidence: form.confidence,
        priority: form.priority,
        description: form.description?.trim() || undefined,
        active: form.active,
      } as any);
      if (!result.success || !result.data) throw new Error(result.error || "Erro ao criar regra");
      toast.success("Regra criada.");
      setForm(emptyForm);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar regra.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, patch: Partial<ProcessRuleDoc>) => {
    setSaving(true);
    try {
      const result = await processRulesService.update(id, patch as any);
      if (!result.success) throw new Error(result.error || "Erro ao atualizar regra");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar regra.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      const result = await processRulesService.remove(id);
      if (!result.success) throw new Error(result.error || "Erro ao remover regra");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível remover regra.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regras de Processo (Precificação por OP)</CardTitle>
        <CardDescription>Roteia itens por processo para chapa / tubo / compra / outros.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>Padrão de processo (regex ou tokens “|”)</Label>
            <Input
              value={form.processNamePattern}
              onChange={(e) => setForm((prev) => ({ ...prev, processNamePattern: e.target.value }))}
              placeholder="LASER|CORTE|PLASMA"
            />
          </div>
          <div>
            <Label>Categoria</Label>
            <select
              className="w-full border rounded-md px-3 py-2 bg-white"
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as ProcessCategory }))}
            >
              {categories.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Confiança (0-1)</Label>
              <Input
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={form.confidence}
                onChange={(e) => setForm((prev) => ({ ...prev, confidence: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label>Prioridade</Label>
              <Input
                type="number"
                min={0}
                max={999}
                value={form.priority}
                onChange={(e) => setForm((prev) => ({ ...prev, priority: Number(e.target.value) }))}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={form.active}
            onCheckedChange={(checked) => setForm((prev) => ({ ...prev, active: checked }))}
            id="process-rule-active"
          />
          <Label htmlFor="process-rule-active">Ativo</Label>
          <Button onClick={handleCreate} disabled={saving} className="ml-auto">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span className="ml-2">Adicionar Regra</span>
          </Button>
        </div>

        <Separator />

        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Padrão</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Conf.</TableHead>
                <TableHead>Pri.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : sortedRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    Nenhuma regra cadastrada. Use o formulário acima para criar.
                  </TableCell>
                </TableRow>
              ) : (
                sortedRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-mono text-xs">{rule.processNamePattern}</TableCell>
                    <TableCell>{categories.find((c) => c.value === rule.category)?.label || rule.category}</TableCell>
                    <TableCell>{(rule.confidence ?? 0).toFixed(2)}</TableCell>
                    <TableCell>{rule.priority ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={rule.active !== false ? "default" : "secondary"}>
                        {rule.active !== false ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdate(rule.id, { active: !(rule.active !== false) })}
                        disabled={saving}
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {rule.active !== false ? "Desativar" : "Ativar"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(rule.id)} disabled={saving}>
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

