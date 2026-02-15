import { useState } from "react";
import { DollarSign, Package, TrendingUp, AlertTriangle, MessageCircle, ShieldCheck, CreditCard, Wrench } from "lucide-react";
import { toast } from "sonner";
import type { QuoteResultV2 } from "../domains/precificacao/engine/quoteV2";
import type { HybridPricingResult } from "../types/hybridPricing";

interface QuoteResultsProps {
  quote: QuoteResultV2;
  hybrid?: HybridPricingResult;
  onRegistrarFechamento?: (payload: { status: "ganho" | "perdido"; precoFechado: number; motivo?: string }) => Promise<void> | void;
}

export function QuoteResults({ quote, hybrid, onRegistrarFechamento }: QuoteResultsProps) {
  const [statusFechamento, setStatusFechamento] = useState<"ganho" | "perdido">("ganho");
  const [precoFechado, setPrecoFechado] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [savingFechamento, setSavingFechamento] = useState(false);
  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const precoTecnico = quote.costs.costBase;
  const precoComercial = hybrid?.precoIdeal ?? quote.costs.priceSuggested;

  const buildWhatsAppText = () => {
    const linhas = [
      "Olá! Segue proposta preliminar:",
      `• Preço técnico: ${formatMoney(precoTecnico)}`,
      `• Preço comercial sugerido: ${formatMoney(precoComercial)}`,
      hybrid ? `• Faixa sugerida: ${formatMoney(hybrid.precoMin)} a ${formatMoney(hybrid.precoMax)}` : "",
      "Posso detalhar prazo, condições e itens inclusos.",
    ].filter(Boolean);
    return encodeURIComponent(linhas.join("\n"));
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${buildWhatsAppText()}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleRegistrarFechamento = async () => {
    if (!onRegistrarFechamento) return;
    const preco = Number(precoFechado);
    if (!Number.isFinite(preco) || preco <= 0) {
      toast.error("Informe um preço fechado válido.");
      return;
    }

    try {
      setSavingFechamento(true);
      await onRegistrarFechamento({
        status: statusFechamento,
        precoFechado: preco,
        motivo: motivo.trim() || undefined,
      });
      toast.success("Fechamento registrado com sucesso.");
      setPrecoFechado("");
      setMotivo("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao registrar fechamento.");
    } finally {
      setSavingFechamento(false);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6 space-y-6">
      <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-success" />
        Resultado do Orçamento
      </h2>

      {(quote.costs.priceSuggested < quote.costs.priceMinSafe || (hybrid?.confianca === "baixa")) && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-800 text-sm">
          <p className="font-semibold">Alerta de risco comercial</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            {quote.costs.priceSuggested < quote.costs.priceMinSafe && <li>Preço sugerido abaixo do mínimo seguro.</li>}
            {hybrid?.confianca === "baixa" && <li>Confiança baixa: revisar código/família/dimensão antes de fechar.</li>}
          </ul>
        </div>
      )}

      {/* Preço Final */}
      <div className="bg-gradient-to-br from-success/10 to-primary/10 border border-success/30 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Preço Sugerido</p>
            <p className="text-4xl font-bold text-success">{formatMoney(quote.costs.priceSuggested)}</p>
          </div>
          <TrendingUp className="w-12 h-12 text-success opacity-50" />
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Preço Mínimo Seguro: <span className="font-semibold text-foreground">{formatMoney(quote.costs.priceMinSafe)}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Custo Base: <span className="font-semibold text-foreground">{formatMoney(quote.costs.costBase)}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-4 bg-muted/30">
          <h3 className="font-semibold text-foreground mb-3">Resumo Comercial</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Preço Técnico</span>
              <span className="font-semibold">{formatMoney(precoTecnico)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Preço Comercial Sugerido</span>
              <span className="font-semibold text-success">{formatMoney(precoComercial)}</span>
            </div>
            {hybrid && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Faixa Sugerida</span>
                <span className="font-semibold">{formatMoney(hybrid.precoMin)} - {formatMoney(hybrid.precoMax)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="border border-border rounded-lg p-4 bg-muted/30">
          <h3 className="font-semibold text-foreground mb-3">Diferenciais da Proposta</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Construção em inox com precificação técnica rastreável</li>
            <li className="flex items-center gap-2"><Wrench className="w-4 h-4 text-primary" /> Opções de customização por modelo e medida</li>
            <li className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Estrutura pronta para condições comerciais e fechamento</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleWhatsAppShare}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
        >
          <MessageCircle className="w-4 h-4" />
          Compartilhar proposta no WhatsApp
        </button>
      </div>

      {onRegistrarFechamento && (
        <div className="border border-border rounded-lg p-4 bg-muted/30">
          <h3 className="font-semibold text-foreground mb-3">Registrar fechamento (ganho/perdido)</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={statusFechamento}
              onChange={(e) => setStatusFechamento(e.target.value as "ganho" | "perdido")}
              className="px-3 py-2 rounded-md border border-border bg-background"
            >
              <option value="ganho">Ganho</option>
              <option value="perdido">Perdido</option>
            </select>
            <input
              value={precoFechado}
              onChange={(e) => setPrecoFechado(e.target.value)}
              placeholder="Preço fechado"
              type="number"
              className="px-3 py-2 rounded-md border border-border bg-background"
            />
            <input
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo (opcional)"
              className="px-3 py-2 rounded-md border border-border bg-background md:col-span-2"
            />
          </div>
          <div className="mt-3">
            <button
              onClick={handleRegistrarFechamento}
              disabled={savingFechamento}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium disabled:opacity-60"
            >
              {savingFechamento ? "Salvando..." : "Salvar fechamento"}
            </button>
          </div>
        </div>
      )}

      {hybrid && (
        <div className="bg-primary/5 border border-primary/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Precificação Híbrida (Histórico + Engenharia)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Preço Base Atual</p>
              <p className="font-semibold">{formatMoney(hybrid.precoBaseAtual)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fator Histórico</p>
              <p className="font-semibold">{hybrid.breakdown.fatorHistorico.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Confiança</p>
              <p className="font-semibold uppercase">{hybrid.confianca} ({hybrid.confiancaScore}%)</p>
            </div>
          </div>

          <div className="mt-3 text-sm">
            <p className="text-muted-foreground">Faixa sugerida</p>
            <p className="font-semibold">
              {formatMoney(hybrid.precoMin)} · {formatMoney(hybrid.precoIdeal)} · {formatMoney(hybrid.precoMax)}
            </p>
          </div>

          <ul className="mt-3 text-xs text-muted-foreground list-disc pl-5 space-y-1">
            {hybrid.justificativa.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          {hybrid.pendencias.length > 0 && (
            <div className="mt-3 p-3 rounded-md border border-amber-300 bg-amber-50 text-amber-900">
              <p className="text-xs font-semibold mb-1">Pendências para aumentar assertividade</p>
              <ul className="text-xs list-disc pl-4 space-y-1">
                {hybrid.pendencias.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Detalhamento de Custos */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Detalhamento de Custos
        </h3>
        <div className="space-y-2">
          <CostRow label="Chapas" value={quote.costs.sheet} />
          <CostRow label="Tubos" value={quote.costs.tubes} />
          {/* Detalhamento dos tubos */}
          {quote.tubeDetails && quote.tubeDetails.length > 0 && (
            <div className="bg-muted/50 border border-border rounded-lg p-3 mt-2">
              <div className="font-semibold text-foreground/90 mb-1">Como foi calculado o custo dos tubos:</div>
              <ul className="text-xs text-muted-foreground space-y-1">
                {quote.tubeDetails.map((t, idx) => (
                  <li key={idx}>
                    {t.label}: {t.metros.toFixed(2)} m × {t.kgpm.toFixed(3)} kg/m × R$ {t.precoKg.toFixed(2)} = <b>R$ {t.custo.toFixed(2)}</b>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <CostRow label="Cantoneiras" value={quote.costs.angles} />
          <CostRow label="Acessórios" value={quote.costs.accessories} />
          <CostRow label="Processos" value={quote.costs.processes} />
          <CostRow label="Overhead" value={quote.costs.overhead} />
        </div>
      </div>

      {/* Nesting Details */}
      {quote.nestingByGroup.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Nesting de Chapas</h3>
          <div className="space-y-3">
            {quote.nestingByGroup.map((group, idx) => (
              <div key={idx} className="bg-muted/50 rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">
                    {group.groupKey.split("|")[0]} - {group.groupKey.split("|")[1]}mm
                  </span>
                  <span className="text-sm text-muted-foreground">{group.nesting.sheet.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Chapas usadas:</span>{" "}
                    <span className="font-semibold">{group.nesting.sheetsUsed}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Eficiência:</span>{" "}
                    <span className="font-semibold">{formatPercent(group.nesting.efficiency)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Área útil:</span>{" "}
                    <span className="font-semibold">{group.nesting.areaUsedM2.toFixed(2)} m²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Desperdício:</span>{" "}
                    <span className="font-semibold">{formatPercent(group.nesting.waste)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Kg comprado:</span>{" "}
                    <span className="font-semibold">{group.kgBought} kg</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {quote.warnings.length > 0 && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-warning mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Avisos
          </h3>
          <ul className="space-y-1">
            {quote.warnings.map((warning, idx) => (
              <li key={idx} className="text-sm text-warning">• {warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CostRow({ label, value }: { label: string; value: number }) {
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  if (value === 0) return null;

  return (
    <div className="flex justify-between items-center py-2 border-b border-border/60">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{formatMoney(value)}</span>
    </div>
  );
}

