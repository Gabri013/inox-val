/**
 * Pagina de novo movimento de estoque
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PackagePlus } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { EntityFormShell } from "@/shared/components/EntityFormShell";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useAjuste, useEntrada, useReserva, useSaida, useSaldosEstoque } from "../estoque.hooks";
import type { SaldoEstoque } from "../estoque.types";
import { formatNumber } from "@/shared/lib/format";
import { toast } from "sonner";

type MovimentoTipo = "ENTRADA" | "SAIDA" | "RESERVA" | "AJUSTE";

const TIPOS: { value: MovimentoTipo; label: string }[] = [
  { value: "ENTRADA", label: "Entrada" },
  { value: "SAIDA", label: "Saída" },
  { value: "RESERVA", label: "Reserva" },
  { value: "AJUSTE", label: "Ajuste" },
];

const UNIDADES = ["UN", "KG", "MT", "M2"];

export default function EstoqueMovimentoForm() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { data: saldos = [] } = useSaldosEstoque();
  const materiais = useMemo(
    () => saldos.filter((item) => item.materialId || item.materialCodigo || item.materialNome),
    [saldos]
  );

  const entrada = useEntrada();
  const saida = useSaida();
  const reserva = useReserva();
  const ajuste = useAjuste();

  const [isDirty, setIsDirty] = useState(false);

  const [formData, setFormData] = useState({
    produtoId: "",
    tipo: "ENTRADA" as MovimentoTipo,
    quantidadeLancada: 0,
    unidadeLancada: "",
    fatorConversao: 1,
    origem: "",
    usuario: profile?.nome || user?.displayName || "",
    observacoes: "",
  });

  const produtoSelecionado = useMemo(() => {
    return (
      materiais.find(
        (item: SaldoEstoque) =>
          (item.materialId || item.produtoId) === formData.produtoId
      ) || null
    );
  }, [materiais, formData.produtoId]);

  const unidadeBase = produtoSelecionado?.unidade || "";

  useEffect(() => {
    if (!produtoSelecionado) return;
    setFormData((prev) => ({
      ...prev,
      unidadeLancada: unidadeBase,
      fatorConversao: 1,
    }));
  }, [produtoSelecionado, unidadeBase]);

  const unidadeOptions = useMemo(() => {
    const base = unidadeBase || "UN";
    return Array.from(new Set([base, ...UNIDADES]));
  }, [unidadeBase]);

  const quantidadeBase =
    formData.unidadeLancada && unidadeBase && formData.unidadeLancada !== unidadeBase
      ? formData.quantidadeLancada * (formData.fatorConversao || 0)
      : formData.quantidadeLancada;

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const validate = () => {
    if (!formData.produtoId) {
      toast.error("Selecione um material");
      return false;
    }
    if (!formData.origem.trim()) {
      toast.error("Informe a origem");
      return false;
    }
    if (!formData.usuario.trim()) {
      toast.error("Informe o usuário");
      return false;
    }
    if (formData.quantidadeLancada <= 0) {
      toast.error("Quantidade deve ser maior que zero");
      return false;
    }
    if (formData.unidadeLancada !== unidadeBase && (!formData.fatorConversao || formData.fatorConversao <= 0)) {
      toast.error("Informe o fator de conversão");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const meta = {
      quantidadeLancada: formData.quantidadeLancada,
      unidadeLancada: formData.unidadeLancada,
      fatorConversao: formData.unidadeLancada === unidadeBase ? 1 : formData.fatorConversao,
      unidadeBase,
    };

    try {
      if (formData.tipo === "ENTRADA") {
        await entrada.mutateAsync({
          produtoId: formData.produtoId,
          quantidade: quantidadeBase,
          origem: formData.origem,
          usuario: formData.usuario,
          observacoes: formData.observacoes || undefined,
          meta,
        });
      } else if (formData.tipo === "SAIDA") {
        await saida.mutateAsync({
          produtoId: formData.produtoId,
          quantidade: quantidadeBase,
          origem: formData.origem,
          usuario: formData.usuario,
          observacoes: formData.observacoes || undefined,
          meta,
        });
      } else if (formData.tipo === "RESERVA") {
        await reserva.mutateAsync({
          produtoId: formData.produtoId,
          quantidade: quantidadeBase,
          origem: formData.origem,
          usuario: formData.usuario,
          observacoes: formData.observacoes || undefined,
          meta,
        });
      } else if (formData.tipo === "AJUSTE") {
        await ajuste.mutateAsync({
          produtoId: formData.produtoId,
          quantidade: quantidadeBase,
          origem: formData.origem,
          usuario: formData.usuario,
          observacoes: formData.observacoes || undefined,
          meta,
        });
      }

      setIsDirty(false);
      navigate("/estoque/movimentos");
    } catch (error) {
      // Erro tratado pelos hooks
    }
  };

  const isLoading = entrada.isPending || saida.isPending || reserva.isPending || ajuste.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Movimento de Estoque"
        description="Registre entradas, saídas, reservas e ajustes com unidade base e unidade lançada"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Estoque", href: "/estoque" },
          { label: "Movimentos", href: "/estoque/movimentos" },
          { label: "Novo" },
        ]}
      />

      <EntityFormShell
        title="Dados do Movimento"
        onSubmit={handleSubmit}
        onCancel={() => navigate("/estoque/movimentos")}
        isDirty={isDirty}
        isLoading={isLoading}
        submitLabel="Salvar"
        icon={PackagePlus}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="produto">Material *</Label>
            <Select
              value={formData.produtoId}
              onValueChange={(value) => handleChange("produtoId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um material" />
              </SelectTrigger>
              <SelectContent>
                {materiais.map((item: SaldoEstoque) => (
                  <SelectItem
                    key={item.materialId || item.produtoId}
                    value={item.materialId || item.produtoId}
                  >
                    {(item.materialCodigo || item.produtoCodigo) || "-"} - {(item.materialNome || item.produtoNome) || "-"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tipo">Tipo *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => handleChange("tipo", value as MovimentoTipo)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantidade">Quantidade *</Label>
            <Input
              id="quantidade"
              type="number"
              step="0.01"
              value={formData.quantidadeLancada}
              onChange={(e) => handleChange("quantidadeLancada", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <Label htmlFor="unidade">Unidade de Lançamento *</Label>
            <Select
              value={formData.unidadeLancada || unidadeBase}
              onValueChange={(value) => handleChange("unidadeLancada", value)}
              disabled={!produtoSelecionado}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {unidadeOptions.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {unidadeBase && (
              <p className="text-xs text-muted-foreground mt-1">
                Unidade base do material: {unidadeBase}
              </p>
            )}
          </div>

          {formData.unidadeLancada && unidadeBase && formData.unidadeLancada !== unidadeBase && (
            <div className="md:col-span-2">
              <Label htmlFor="fator">
                Fator de conversão ({unidadeBase} por {formData.unidadeLancada}) *
              </Label>
              <Input
                id="fator"
                type="number"
                step="0.0001"
                value={formData.fatorConversao}
                onChange={(e) => handleChange("fatorConversao", parseFloat(e.target.value) || 0)}
                placeholder="Ex: 7.85"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Quantidade base: {formatNumber(quantidadeBase, 4)} {unidadeBase}
              </p>
            </div>
          )}

          <div className="md:col-span-2">
            <Label htmlFor="origem">Origem *</Label>
            <Input
              id="origem"
              value={formData.origem}
              onChange={(e) => handleChange("origem", e.target.value)}
              placeholder="Ex: Compra, Ajuste manual, OP-0001"
            />
          </div>

          <div>
            <Label htmlFor="usuario">Usuário *</Label>
            <Input
              id="usuario"
              value={formData.usuario}
              onChange={(e) => handleChange("usuario", e.target.value)}
              placeholder="Responsável"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleChange("observacoes", e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </EntityFormShell>
    </div>
  );
}
