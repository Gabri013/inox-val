import { useState, useEffect, useRef } from "react";
import { Calculator, Settings } from "lucide-react";
import { toast } from "sonner";
import { buildBOMByTipo, type ProdutoTipo } from "../domains/precificacao/engine/bomBuilder";
import { makeDefaultTables } from "../domains/precificacao/engine/defaultTables";
import { validateBeforeQuoteV2, quoteWithSheetSelectionV2, type SheetPolicy } from "../domains/precificacao/engine/quoteV2";
import { BancadasForm } from "./forms/BancadasForm";
import { LavatoriosForm } from "./forms/LavatoriosForm";
import { PrateleirasForm } from "./forms/PrateleirasForm";
import { MesasForm } from "./forms/MesasForm";
import { EstanteCantoneiraForm } from "./forms/EstanteCantoneiraForm";
import { EstanteTuboForm } from "./forms/EstanteTuboForm";
import { CoifasForm } from "./forms/CoifasForm";
import { ChapaPlanaForm } from "./forms/ChapaPlanaForm";
import { MaterialRedondoForm } from "./forms/MaterialRedondoForm";
import { CantoneiraForm } from "./forms/CantoneiraForm";
import { PortasBatentesForm } from "./forms/PortasBatentesForm";
import { QuoteResults } from "./QuoteResults";
import { ConfigPanel } from "./ConfigPanel";

const PRODUTOS: Array<{ id: ProdutoTipo; label: string }> = [
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
];

export function PrecificacaoPage() {
  // Recalcula orçamento automaticamente ao mudar qualquer campo relevante
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoTipo>("bancadas");
  const [formData, setFormData] = useState<any>({});
  const [quoteResult, setQuoteResult] = useState<any>(null);

  // Configurações globais
  const [precoKgInox, setPrecoKgInox] = useState(45);
  const [fatorVenda, setFatorVenda] = useState(3);
  const [sheetMode, setSheetMode] = useState<"auto" | "manual">("auto");
  const [sheetSelected, setSheetSelected] = useState("2000x1250");
  // sheetCostMode agora é automático
  const [scrapMinPct, setScrapMinPct] = useState(15);
  const [showConfig, setShowConfig] = useState(false);

  const firstRender = useRef(true);

  // Cálculo automático ao mudar qualquer campo relevante
  // Remove cálculo automático para evitar toast ao abrir/alterar tipo de orçamento
  // useEffect(() => {
  //   if (firstRender.current) {
  //     firstRender.current = false;
  //     return;
  //   }
  //   handleCalcular();
  //   // eslint-disable-next-line
  // }, [formData, produtoSelecionado, precoKgInox, fatorVenda, sheetMode, sheetSelected, scrapMinPct]);

  const handleCalcular = () => {
    // Passo 1: Validações específicas antes de gerar BOM
    if (produtoSelecionado === "bancadas" && formData.orcamentoTipo === "bancadaComCuba") {
      if (!formData.cuba || !formData.cuba.L || !formData.cuba.W || !formData.cuba.H) {
        toast.error("Para bancada com cuba, informe as dimensões da cuba (L, W, H).", {
          duration: 4000,
        });
        return;
      }
    }

    if (produtoSelecionado === "lavatorios" && formData.tipo === "lavatorioPadrao") {
      if (!formData.modeloPadrao) {
        toast.error("Para lavatório padrão, selecione o modelo (750/850/FDE).", {
          duration: 4000,
        });
        return;
      }
    }

    // Passo 2: Gerar BOM
    let bom;
    try {
      bom = buildBOMByTipo(produtoSelecionado, formData, {
        orcamentoTipo: formData.orcamentoTipo,
      });
    } catch (error) {
      toast.error("Erro ao gerar BOM. Verifique os dados informados.", {
        duration: 4000,
      });
      return;
    }

    // Passo 3: Montar tabelas e regras
    const tables = makeDefaultTables({
      inoxKgPrice: precoKgInox,
      overheadPercent: 0,
    });

    const rules = {
      markup: fatorVenda,
      minMarginPct: 0.25,
    };

    // Passo 4: Sheet policy (todas as famílias com mesmo modo)
    const families = Array.from(new Set(bom.sheetParts.map((p) => p.family)));
    const sheetPolicyByFamily: Record<string, SheetPolicy> = {};
    // Lógica automática: se quantidade >= 6, usa "bought"; senão, "used"
    let quantidade = 1;
    if (formData.quantidade && Number.isFinite(formData.quantidade)) {
      quantidade = Number(formData.quantidade);
    } else if (formData.quantidadeCubas && Number.isFinite(formData.quantidadeCubas)) {
      quantidade = Number(formData.quantidadeCubas);
    }
    const autoSheetCostMode = quantidade >= 6 ? "bought" : "used";
    for (const fam of families) {
      sheetPolicyByFamily[fam] = {
        mode: sheetMode,
        manualSheetId: sheetMode === "manual" ? sheetSelected : undefined,
        costMode: autoSheetCostMode,
        scrapMinPct: scrapMinPct / 100,
      };
    }

    // Passo 5: Validar
    const errors = validateBeforeQuoteV2({
      tables,
      rules,
      sheetPolicyByFamily,
      bom,
    });

    if (errors.length) {
      toast.error(
        `Não foi possível calcular:\n${errors.slice(0, 5).map((e) => `• ${e.message}`).join("\n")}`,
        { duration: 5000 }
      );
      return;
    }

    // Passo 6: Calcular quote
    const quote = quoteWithSheetSelectionV2({
      tables,
      rules,
      sheetPolicyByFamily,
      bom,
    });

    setQuoteResult(quote);

    if (quote.warnings.length) {
      toast("Atenção", {
        description: quote.warnings.slice(0, 3).map((w) => `• ${w}`).join("\n"),
        duration: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sistema de Precificação Inox</h1>
                <p className="text-sm text-gray-600">Motor V2 - Cálculo Industrial com Nesting</p>
              </div>
            </div>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Configurações</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Produto</h2>
              <div className="space-y-2">
                {PRODUTOS.map((produto) => (
                  <button
                    key={produto.id}
                    onClick={() => {
                      setProdutoSelecionado(produto.id);
                      setFormData({});
                      setQuoteResult(null);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      produtoSelecionado === produto.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-900"
                    }`}
                  >
                    {produto.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {showConfig && (
              <ConfigPanel
                precoKgInox={precoKgInox}
                setPrecoKgInox={setPrecoKgInox}
                fatorVenda={fatorVenda}
                setFatorVenda={setFatorVenda}
                sheetMode={sheetMode}
                setSheetMode={setSheetMode}
                sheetSelected={sheetSelected}
                setSheetSelected={setSheetSelected}
                scrapMinPct={scrapMinPct}
                setScrapMinPct={setScrapMinPct}
              />
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {PRODUTOS.find((p) => p.id === produtoSelecionado)?.label}
              </h2>

              {produtoSelecionado === "bancadas" && (
                <BancadasForm formData={formData} setFormData={setFormData} />
              )}
              {produtoSelecionado === "lavatorios" && (
                <LavatoriosForm formData={formData} setFormData={setFormData} />
              )}
              {produtoSelecionado === "prateleiras" && (
                <PrateleirasForm formData={formData} setFormData={setFormData} />
              )}
              {produtoSelecionado === "mesas" && (
                <MesasForm formData={formData} setFormData={setFormData} />
              )}
              {produtoSelecionado === "estanteCantoneira" && (
                <EstanteCantoneiraForm formData={formData} setFormData={setFormData} />
              )}
              {produtoSelecionado === "estanteTubo" && (
                <EstanteTuboForm formData={formData} setFormData={setFormData} />
              )}
              {produtoSelecionado === "coifas" && (
                <CoifasForm formData={formData} setFormData={setFormData} />
              )}
              {produtoSelecionado === "chapaPlana" && (
                <ChapaPlanaForm formData={formData} setFormData={setFormData} />
              )}
              {produtoSelecionado === "materialRedondo" && (
                <MaterialRedondoForm formData={formData} setFormData={setFormData} />
              )}
              {produtoSelecionado === "cantoneira" && (
                <CantoneiraForm formData={formData} setFormData={setFormData} />
              )}
              {produtoSelecionado === "portasBatentes" && (
                <PortasBatentesForm formData={formData} setFormData={setFormData} />
              )}

              <button
                onClick={handleCalcular}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Calculator className="w-5 h-5" />
                <span>Calcular Orçamento</span>
              </button>
            </div>

            {quoteResult && <QuoteResults quote={quoteResult} />}
          </div>
        </div>
      </div>
    </div>
  );
}

