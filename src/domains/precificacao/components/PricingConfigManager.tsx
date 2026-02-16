import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import { Textarea } from "@/app/components/ui/textarea";
import { Badge } from "@/app/components/ui/badge";
import { Plus, RefreshCw, Save } from "lucide-react";
import { usePricingConfig } from "../hooks/usePricingConfig";
import type {
  PricingConfig,
  PricingProfile,
  ProdutoFormDefaults,
} from "../config/pricingConfig";
import { DEFAULT_PRICING_CONFIG } from "../config/pricingConfig";
import type { ProdutoTipo } from "../domains/precificacao/engine/bomBuilder";

const produtoOptions: Array<{ id: ProdutoTipo; label: string }> = [
  { id: "bancadas", label: "Bancadas" },
  { id: "lavatorios", label: "Lavatórios" },
  { id: "prateleiras", label: "Prateleiras" },
  { id: "mesas", label: "Mesas" },
  { id: "estanteCantoneira", label: "Estante Cantoneira" },
  { id: "estanteTubo", label: "Estante Tubo" },
  { id: "coifas", label: "Coifas" },
  { id: "chapaPlana", label: "Chapa Plana" },
  { id: "materialRedondo", label: "Material Redondo" },
  { id: "cantoneira", label: "Cantoneira" },
  { id: "portasBatentes", label: "Portas e Batentes" },
  { id: "ordemProducaoExcel", label: "Precificação por OP" },
];

const formatKeyValue = (data: Record<string, number>) =>
  Object.entries(data)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

const parseKeyValue = (text: string): Record<string, number> => {
  const out: Record<string, number> = {};
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .forEach((line) => {
      const [k, v] = line.split("=");
      if (!k || v === undefined) return;
      const parsed = Number(v.replace(",", "."));
      if (!Number.isFinite(parsed)) return;
      out[k.trim().toUpperCase()] = parsed;
    });
  return out;
};

const sharedPriceFields: Array<{ key: keyof ProdutoFormDefaults; label: string }> = [
  { key: "precoKg", label: "Preço/kg (R$)" },
  { key: "markup", label: "Markup" },
  { key: "overheadPercent", label: "Overhead (%)" },
  { key: "minMarginPct", label: "Margem mínima (%)" },
];

const bancadasFields: Array<{ key: keyof ProdutoFormDefaults; label: string }> = [
  { key: "precoKgInox", label: "Preço/kg Inox" },
  { key: "precoKgTuboPes", label: "Preço/kg Tubo Pés" },
  { key: "precoKgTuboContraventamento", label: "Preço/kg Tubo Contraventamento" },
  { key: "fatorVenda", label: "Fator de venda" },
  { key: "scrapMinPct", label: "Desperdício mínimo (%)" },
];

const productFields: Partial<Record<ProdutoTipo, Array<{ key: keyof ProdutoFormDefaults; label: string }>>> = {
  bancadas: bancadasFields,
  lavatorios: sharedPriceFields,
  prateleiras: sharedPriceFields,
  mesas: sharedPriceFields,
};

const numberOrEmpty = (value?: number) => (value === undefined || value === null ? "" : value);

export function PricingConfigManager() {
  const { config, isLoading, saveConfig } = usePricingConfig();
  const [draft, setDraft] = useState<PricingConfig>(config);
  const [familiaText, setFamiliaText] = useState<string>(
    formatKeyValue(config.hybridPricing.familiaFactors)
  );
  const [subfamiliaText, setSubfamiliaText] = useState<string>(
    formatKeyValue(config.hybridPricing.subfamiliaFactors)
  );
  const [newProfileId, setNewProfileId] = useState("");

  useEffect(() => {
    setDraft(config);
    setFamiliaText(formatKeyValue(config.hybridPricing.familiaFactors));
    setSubfamiliaText(formatKeyValue(config.hybridPricing.subfamiliaFactors));
  }, [config]);

  const profileIds = useMemo(() => Object.keys(draft.pricingProfiles.profiles), [draft]);

  const updateProfile = (id: string, patch: Partial<PricingProfile>) => {
    setDraft((prev) => ({
      ...prev,
      pricingProfiles: {
        ...prev.pricingProfiles,
        profiles: {
          ...prev.pricingProfiles.profiles,
          [id]: {
            ...prev.pricingProfiles.profiles[id],
            ...patch,
          },
        },
      },
    }));
  };

  const handleAddProfile = () => {
    const id = newProfileId.trim();
    if (!id) return;
    const fallback = draft.pricingProfiles.profiles[draft.pricingProfiles.defaultProfile];
    setDraft((prev) => ({
      ...prev,
      pricingProfiles: {
        ...prev.pricingProfiles,
        profiles: {
          ...prev.pricingProfiles.profiles,
          [id]: fallback ? { ...fallback, label: `Perfil ${id}` } : {
            label: `Perfil ${id}`,
            markup: 1,
            minMarginPct: 0,
            scrapMinPct: 0,
            overheadPercent: 0,
          },
        },
      },
    }));
    setNewProfileId("");
  };

  const updateProdutoProfile = (produto: ProdutoTipo, profileId: string) => {
    setDraft((prev) => ({
      ...prev,
      pricingProfiles: {
        ...prev.pricingProfiles,
        produtoTipoToProfile: {
          ...prev.pricingProfiles.produtoTipoToProfile,
          [produto]: profileId,
        },
      },
    }));
  };

  const updateBand = (index: number, field: "maxMaiorLadoMm" | "factor", value: number) => {
    setDraft((prev) => {
      const bands = [...prev.hybridPricing.dimensaoBands];
      bands[index] = { ...bands[index], [field]: value };
      return { ...prev, hybridPricing: { ...prev.hybridPricing, dimensaoBands: bands } };
    });
  };

  const addBand = () => {
    setDraft((prev) => ({
      ...prev,
      hybridPricing: {
        ...prev.hybridPricing,
        dimensaoBands: [...prev.hybridPricing.dimensaoBands, { maxMaiorLadoMm: 0, factor: 1 }],
      },
    }));
  };

  const removeBand = (index: number) => {
    setDraft((prev) => {
      const bands = prev.hybridPricing.dimensaoBands.filter((_, idx) => idx !== index);
      return { ...prev, hybridPricing: { ...prev.hybridPricing, dimensaoBands: bands } };
    });
  };

  const updateFormDefault = (
    produto: ProdutoTipo,
    field: keyof ProdutoFormDefaults,
    value: number | undefined
  ) => {
    setDraft((prev) => ({
      ...prev,
      formDefaults: {
        ...prev.formDefaults,
        [produto]: {
          ...(prev.formDefaults[produto] || {}),
          [field]: value,
        },
      },
    }));
  };

  const handleResetDraft = () => {
    setDraft(config);
    setFamiliaText(formatKeyValue(config.hybridPricing.familiaFactors));
    setSubfamiliaText(formatKeyValue(config.hybridPricing.subfamiliaFactors));
  };

  const handleResetToDefaults = () => {
    setDraft(DEFAULT_PRICING_CONFIG);
    setFamiliaText(formatKeyValue(DEFAULT_PRICING_CONFIG.hybridPricing.familiaFactors));
    setSubfamiliaText(formatKeyValue(DEFAULT_PRICING_CONFIG.hybridPricing.subfamiliaFactors));
  };

  const handleSave = () => {
    const payload: PricingConfig = {
      ...draft,
      hybridPricing: {
        ...draft.hybridPricing,
        familiaFactors: parseKeyValue(familiaText),
        subfamiliaFactors: parseKeyValue(subfamiliaText),
      },
      updatedAt: new Date().toISOString(),
    };

    saveConfig.mutate(payload);
  };

  const renderFormDefaults = (produto: ProdutoTipo, label: string) => {
    const fields = productFields[produto] || [];
    if (fields.length === 0) return null;
    const defaults = draft.formDefaults[produto] || {};

    return (
      <div key={produto} className="space-y-3 rounded-lg border border-border p-3 bg-muted/30">
        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground">{label}</span>
          <Badge variant="secondary">Defaults</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <Label>{field.label}</Label>
              <Input
                type="number"
                value={numberOrEmpty(defaults[field.key] as number | undefined)}
                onChange={(e) =>
                  updateFormDefault(
                    produto,
                    field.key,
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
                disabled={saveConfig.isPending}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Precificação</CardTitle>
          <CardDescription>Centralize perfis, fatores híbridos e defaults de produto.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando configuração...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Configuração de Precificação
        </CardTitle>
        <CardDescription>
          Perfis comerciais, fatores híbridos e defaults de produtos em um só lugar.
        </CardDescription>
        {draft.updatedAt && (
          <p className="text-xs text-muted-foreground mt-1">
            Última edição: {new Date(draft.updatedAt).toLocaleString("pt-BR")}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Perfis e mapeamento */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Perfis comerciais</p>
              <p className="text-xs text-muted-foreground">
                Ajuste markup, margem mínima, sucata mínima e overhead de cada perfil.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="id do novo perfil"
                value={newProfileId}
                onChange={(e) => setNewProfileId(e.target.value)}
                className="w-40"
                disabled={saveConfig.isPending}
              />
              <Button onClick={handleAddProfile} variant="outline" size="sm" disabled={saveConfig.isPending}>
                <Plus className="w-4 h-4 mr-1" />
                Adicionar perfil
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profileIds.map((id) => {
              const profile = draft.pricingProfiles.profiles[id];
              return (
                <div key={id} className="border border-border rounded-lg p-3 space-y-2 bg-card/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{id}</Badge>
                      <Input
                        value={profile.label}
                        onChange={(e) => updateProfile(id, { label: e.target.value })}
                        disabled={saveConfig.isPending}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="radio"
                        name="default-profile"
                        checked={draft.pricingProfiles.defaultProfile === id}
                        onChange={() =>
                          setDraft((prev) => ({
                            ...prev,
                            pricingProfiles: { ...prev.pricingProfiles, defaultProfile: id },
                          }))
                        }
                        disabled={saveConfig.isPending}
                      />
                      Padrão
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <Label>Markup</Label>
                      <Input
                        type="number"
                        value={profile.markup}
                        onChange={(e) => updateProfile(id, { markup: Number(e.target.value) })}
                        min={0}
                        step={0.01}
                        disabled={saveConfig.isPending}
                      />
                    </div>
                    <div>
                      <Label>Margem mínima (%)</Label>
                      <Input
                        type="number"
                        value={profile.minMarginPct}
                        onChange={(e) => updateProfile(id, { minMarginPct: Number(e.target.value) })}
                        min={0}
                        step={0.01}
                        disabled={saveConfig.isPending}
                      />
                    </div>
                    <div>
                      <Label>Sucata mínima (%)</Label>
                      <Input
                        type="number"
                        value={profile.scrapMinPct}
                        onChange={(e) => updateProfile(id, { scrapMinPct: Number(e.target.value) })}
                        min={0}
                        step={0.01}
                        disabled={saveConfig.isPending}
                      />
                    </div>
                    <div>
                      <Label>Overhead (%)</Label>
                      <Input
                        type="number"
                        value={profile.overheadPercent}
                        onChange={(e) => updateProfile(id, { overheadPercent: Number(e.target.value) })}
                        min={0}
                        step={0.01}
                        disabled={saveConfig.isPending}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg border border-dashed border-border p-3">
            <p className="text-xs font-semibold text-foreground mb-2">Mapa produto → perfil</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {produtoOptions.map((produto) => (
                <div key={produto.id} className="space-y-1">
                  <Label>{produto.label}</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2 bg-background"
                    value={draft.pricingProfiles.produtoTipoToProfile[produto.id] || draft.pricingProfiles.defaultProfile}
                    onChange={(e) => updateProdutoProfile(produto.id, e.target.value)}
                    disabled={saveConfig.isPending}
                  >
                    {profileIds.map((id) => (
                      <option key={id} value={id}>
                        {draft.pricingProfiles.profiles[id]?.label || id}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Híbrido */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Fatores do motor híbrido</p>
              <p className="text-xs text-muted-foreground">
                Faixa de fallback, bônus de complexidade e bandas dimensionais.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={addBand}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar banda de dimensão
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label>Fator padrão</Label>
              <Input
                type="number"
                value={draft.hybridPricing.defaultFactor}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    hybridPricing: { ...prev.hybridPricing, defaultFactor: Number(e.target.value) },
                  }))
                }
                min={0}
                step={0.01}
                disabled={saveConfig.isPending}
              />
            </div>
            <div>
              <Label>Fallback mínimo</Label>
              <Input
                type="number"
                value={draft.hybridPricing.fallbackRange.min}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    hybridPricing: {
                      ...prev.hybridPricing,
                      fallbackRange: { ...prev.hybridPricing.fallbackRange, min: Number(e.target.value) },
                    },
                  }))
                }
                step={0.01}
                disabled={saveConfig.isPending}
              />
            </div>
            <div>
              <Label>Fallback máximo</Label>
              <Input
                type="number"
                value={draft.hybridPricing.fallbackRange.max}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    hybridPricing: {
                      ...prev.hybridPricing,
                      fallbackRange: { ...prev.hybridPricing.fallbackRange, max: Number(e.target.value) },
                    },
                  }))
                }
                step={0.01}
                disabled={saveConfig.isPending}
              />
            </div>
            <div>
              <Label>Bônus projeto</Label>
              <Input
                type="number"
                value={draft.hybridPricing.complexityBonus.temProjeto}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    hybridPricing: {
                      ...prev.hybridPricing,
                      complexityBonus: {
                        ...prev.hybridPricing.complexityBonus,
                        temProjeto: Number(e.target.value),
                      },
                    },
                  }))
                }
                step={0.01}
                disabled={saveConfig.isPending}
              />
            </div>
            <div>
              <Label>Bônus bloco</Label>
              <Input
                type="number"
                value={draft.hybridPricing.complexityBonus.temBloco}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    hybridPricing: {
                      ...prev.hybridPricing,
                      complexityBonus: {
                        ...prev.hybridPricing.complexityBonus,
                        temBloco: Number(e.target.value),
                      },
                    },
                  }))
                }
                step={0.01}
                disabled={saveConfig.isPending}
              />
            </div>
            <div>
              <Label>Bônus render</Label>
              <Input
                type="number"
                value={draft.hybridPricing.complexityBonus.temRender}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    hybridPricing: {
                      ...prev.hybridPricing,
                      complexityBonus: {
                        ...prev.hybridPricing.complexityBonus,
                        temRender: Number(e.target.value),
                      },
                    },
                  }))
                }
                step={0.01}
                disabled={saveConfig.isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">Bandas dimensionais</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {draft.hybridPricing.dimensaoBands.map((band, idx) => (
                <div
                  key={`${band.maxMaiorLadoMm}-${idx}`}
                  className="flex items-center gap-2 rounded-md border border-border p-2"
                >
                  <div className="flex-1">
                    <Label>Maior lado até (mm)</Label>
                  <Input
                    type="number"
                    value={band.maxMaiorLadoMm}
                    onChange={(e) => updateBand(idx, "maxMaiorLadoMm", Number(e.target.value))}
                    min={0}
                    disabled={saveConfig.isPending}
                  />
                </div>
                <div className="flex-1">
                  <Label>Fator</Label>
                  <Input
                    type="number"
                    value={band.factor}
                    onChange={(e) => updateBand(idx, "factor", Number(e.target.value))}
                    step={0.01}
                    disabled={saveConfig.isPending}
                  />
                </div>
                  <Button variant="ghost" size="sm" onClick={() => removeBand(idx)} disabled={saveConfig.isPending}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fator por família (chave=fator)</Label>
              <Textarea
                value={familiaText}
                onChange={(e) => setFamiliaText(e.target.value)}
                className="font-mono text-xs min-h-[160px]"
                disabled={saveConfig.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label>Fator por subfamília (chave=fator)</Label>
              <Textarea
                value={subfamiliaText}
                onChange={(e) => setSubfamiliaText(e.target.value)}
                className="font-mono text-xs min-h-[160px]"
                disabled={saveConfig.isPending}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Defaults por produto */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Defaults dos formulários</p>
            <p className="text-xs text-muted-foreground">
              Valores que preenchem automaticamente preço, markup e sucata por tipo de produto.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {produtoOptions.map((produto) => renderFormDefaults(produto.id, produto.label))}
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end pt-2">
          <Button variant="ghost" onClick={handleResetDraft}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Descartar alterações
          </Button>
          <Button variant="outline" onClick={handleResetToDefaults} disabled={saveConfig.isPending}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Restaurar padrões
          </Button>
          <Button onClick={handleSave} disabled={saveConfig.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {saveConfig.isPending ? "Salvando..." : "Salvar configuração"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
