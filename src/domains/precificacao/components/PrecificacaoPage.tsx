import { useState } from "react";
import { Calculator } from "lucide-react";
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

const PRODUTOS: Array<{ id: ProdutoTipo; label: string }> = [
  { id: "bancadas", label: "Bancadas" },
  { id: "lavatorios", label: "Lavat�rios" },
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
  // Recalcula or�amento automaticamente ao mudar qualquer campo relevante
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoTipo>("bancadas");
  const [formData, setFormData] = useState<any>({});
  const [quoteResult, setQuoteResult] = useState<any>(null);

  // ...existing code...


  // C�lculo autom�tico ao mudar qualquer campo relevante
  // Remove c�lculo autom�tico para evitar toast ao abrir/alterar tipo de or�amento
  // useEffect(() => {
  //     return;
  //   }
  //   handleCalcular();
  //   // eslint-disable-next-line
  // }, [formData, produtoSelecionado, precoKgInox, fatorVenda, sheetMode, sheetSelected, scrapMinPct]);

  const handleCalcular = () => {
    // Passo 1: Valida��es espec�ficas antes de gerar BOM
    if (produtoSelecionado === "bancadas" && formData.orcamentoTipo === "bancadaComCuba") {
      if (!formData.cuba || !formData.cuba.L || !formData.cuba.W || !formData.cuba.H) {
        toast.error("Para bancada com cuba, informe as dimens�es da cuba (L, W, H).", {
          duration: 4000,
        });
        return;
      }
    }

    if (produtoSelecionado === "lavatorios" && formData.tipo === "lavatorioPadrao") {
      if (!formData.modeloPadrao) {
        toast.error("Para lavat�rio padr�o, selecione o modelo (750/850/FDE).", {
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
    } catch (error: any) {
      const msg = error?.message || "Erro ao gerar BOM. Verifique os dados informados.";
      toast.error(msg, {
        duration: 4000,
      });
      return;
    }

    // Passo 3: Montar tabelas e regras a partir do formData
    const toNumber = (value: unknown, fallback: number) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const inoxKgPrice = toNumber(formData.precoKg ?? formData.precoKgInox, 45);
    const tubeKgPrice = toNumber(
      formData.precoKgTubo ?? formData.precoKgTuboPes ?? formData.precoKg ?? formData.precoKgInox,
      inoxKgPrice
    );
    const overheadRaw = toNumber(formData.overheadPercent, 0);
    const overheadPercent = overheadRaw > 1 ? overheadRaw / 100 : overheadRaw;

    const tables = makeDefaultTables({
      inoxKgPrice,
      tubeKgPrice,
      overheadPercent,
      tubeKgPricePes: toNumber(formData.precoKgTuboPes, tubeKgPrice),
      tubeKgPriceContraventamento: toNumber(formData.precoKgTuboContraventamento, tubeKgPrice),
    });

    const markup = toNumber(formData.markup ?? formData.fatorVenda, 3);
    const minMarginRaw = toNumber(formData.minMarginPct, 0.25);
    const minMarginPct = minMarginRaw > 1 ? minMarginRaw / 100 : minMarginRaw;

    const rules = {
      markup,
      minMarginPct,
    };

    // Passo 4: Sheet policy (todas as fam�lias com mesmo modo)
    const families = Array.from(new Set(bom.sheetParts.map((p) => p.family)));
    const sheetPolicyByFamily: Record<string, SheetPolicy> = {};
    // L�gica autom�tica: se quantidade >= 6, usa "bought"; sen�o, "used"
    let quantidade = 1;
    if (formData.quantidade && Number.isFinite(formData.quantidade)) {
      quantidade = Number(formData.quantidade);
    } else if (formData.quantidadeCubas && Number.isFinite(formData.quantidadeCubas)) {
      quantidade = Number(formData.quantidadeCubas);
    }
    const autoSheetCostMode = quantidade >= 6 ? "bought" : "used";
    for (const fam of families) {
      sheetPolicyByFamily[fam] = {
        mode: formData.sheetMode || "auto",
        manualSheetId: formData.sheetMode === "manual" ? formData.sheetSelected : undefined,
        costMode: autoSheetCostMode,
        scrapMinPct: (formData.scrapMinPct ?? 15) / 100,
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
        `N�o foi poss�vel calcular:\n${errors.slice(0, 5).map((e) => `� ${e.message}`).join("\n")}`,
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
      toast("Aten��o", {
        description: quote.warnings.slice(0, 3).map((w) => `� ${w}`).join("\n"),
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
                <h1 className="text-2xl font-bold text-gray-900">Sistema de Precifica��o Inox</h1>
                <p className="text-sm text-gray-600">Motor V2 - C�lculo Industrial com Nesting</p>
              </div>
            </div>
            {/* Configura��es globais removidas. Toda configura��o agora est� junto ao input do produto. */}
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
            {/* ConfigPanel removido: campos de configura��o migrar�o para o formul�rio do produto */}

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
                <span>Calcular Or�amento</span>
              </button>
            </div>

            {quoteResult && <QuoteResults quote={quoteResult} />}
          </div>
        </div>
      </div>
    </div>
  );
}

