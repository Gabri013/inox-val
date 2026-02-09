export interface OmeiItem {
  quantidade: number;
  unidade?: string;
  codigo?: string;
  descricao: string;
}

export interface OmeiParsed {
  numero?: string;
  clienteNome?: string;
  contato?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  dataEmissao?: Date;
  previsaoFaturamento?: Date;
  validadeDias?: number;
  itens: OmeiItem[];
  observacoes?: string;
  rawText: string;
}

const UNIDADES = new Set(["UN", "KG", "MT", "M2", "M3", "LT"]);

function normalizeSpaces(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function parseDateBR(value?: string) {
  if (!value) return undefined;
  const match = value.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return undefined;
  const [, dd, mm, yyyy] = match;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
}

function parseNumber(value: string) {
  const cleaned = value.replace(/\./g, "").replace(",", ".");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function splitQuantityUnit(token: string) {
  const match = token.match(/^(\d+(?:[.,]\d+)?)([A-Za-z]+)$/);
  if (!match) return null;
  const qty = parseNumber(match[1]);
  const unit = match[2].toUpperCase();
  if (!UNIDADES.has(unit)) return null;
  return { qty, unit };
}

function isQuantityToken(token: string) {
  return /^\d+(?:[.,]\d+)?$/.test(token);
}

function isUnitToken(token: string) {
  return UNIDADES.has(token.toUpperCase());
}

function isCodeToken(token: string) {
  return /[0-9]/.test(token) && /[A-Za-z0-9\-\/]/.test(token);
}

function extractItems(sectionRaw: string): OmeiItem[] {
  const text = normalizeSpaces(sectionRaw);
  if (!text) return [];
  const tokens = text.split(" ");
  const items: OmeiItem[] = [];
  let i = 0;

  while (i < tokens.length) {
    let qty = 0;
    let unit: string | undefined;

    const qtyUnit = splitQuantityUnit(tokens[i]);
    if (qtyUnit) {
      qty = qtyUnit.qty;
      unit = qtyUnit.unit;
      i += 1;
    } else if (isQuantityToken(tokens[i])) {
      qty = parseNumber(tokens[i]);
      i += 1;
      if (i < tokens.length && isUnitToken(tokens[i])) {
        unit = tokens[i].toUpperCase();
        i += 1;
      } else if (i < tokens.length) {
        const nextQtyUnit = splitQuantityUnit(tokens[i]);
        if (nextQtyUnit) {
          unit = nextQtyUnit.unit;
          i += 1;
        }
      }
    } else {
      i += 1;
      continue;
    }

    let code = "";
    if (i < tokens.length && isCodeToken(tokens[i]) && !isUnitToken(tokens[i])) {
      code = tokens[i];
      i += 1;
    }

    const descTokens: string[] = [];
    while (i < tokens.length && !isQuantityToken(tokens[i]) && !splitQuantityUnit(tokens[i])) {
      descTokens.push(tokens[i]);
      i += 1;
    }

    const descricao = normalizeSpaces(descTokens.join(" "));
    if (descricao) {
      items.push({
        quantidade: qty || 1,
        unidade: unit,
        codigo: code || undefined,
        descricao,
      });
    } else if (qty > 0) {
      items.push({
        quantidade: qty,
        unidade: unit,
        codigo: code || undefined,
        descricao: "Item importado",
      });
    }
  }

  return items;
}

export function parseOmeiText(rawText: string): OmeiParsed {
  const raw = rawText || "";
  const text = normalizeSpaces(
    raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  );

  const numeroMatch = text.match(/ORCAMENTO\s*N[ºO]?\s*([0-9]+)/i);
  const numero = numeroMatch ? numeroMatch[1] : undefined;

  const clienteNomeMatch = text.match(/Informacoes do Cliente\s+(.*?)\s+Contato:/i);
  const clienteNome = clienteNomeMatch ? normalizeSpaces(clienteNomeMatch[1]) : undefined;

  const contatoMatch = text.match(/Contato:\s*([^C]+?)\s+CNPJ:/i);
  const contato = contatoMatch ? normalizeSpaces(contatoMatch[1]) : undefined;

  const cnpjMatch = text.match(/CNPJ:\s*([0-9.\-\/]+)/i);
  const cnpj = cnpjMatch ? cnpjMatch[1] : undefined;

  const emailMatch = text.match(/Email:\s*([^\s]+)/i);
  const email = emailMatch ? emailMatch[1] : undefined;

  const telefoneMatch = text.match(/Telefone:\s*([0-9\-\(\)\s]+)/i);
  const telefone = telefoneMatch ? normalizeSpaces(telefoneMatch[1]) : undefined;

  const dataMatch = text.match(/ORCAMENTO\s*-\s*incluido em:\s*(\d{2}\/\d{2}\/\d{4})/i);
  const dataEmissao = dataMatch ? parseDateBR(dataMatch[1]) : undefined;

  const previsaoMatch = text.match(/Previsao de Faturamento:\s*(\d{2}\/\d{2}\/\d{4})/i);
  const previsaoFaturamento = previsaoMatch ? parseDateBR(previsaoMatch[1]) : undefined;

  const validadeMatch = text.match(/VALIDADE DA PROPOSTA\s*(\d+)\s*DIAS/i);
  const validadeDias = validadeMatch ? Number(validadeMatch[1]) : undefined;

  const itensSection = (() => {
    const split = text.split(/Itens do ORCAMENTO/i);
    if (split.length < 2) return "";
    const after = split[1];
    const endSplit = after.split(/Outras Informacoes/i);
    return endSplit[0] || "";
  })();

  const itens = extractItems(itensSection);

  let observacoes = "";
  const outrasInfoSplit = text.split(/Outras Informacoes/i);
  if (outrasInfoSplit.length > 1) {
    observacoes = normalizeSpaces(outrasInfoSplit[1] || "");
  }

  return {
    numero,
    clienteNome,
    contato,
    cnpj,
    email,
    telefone,
    dataEmissao,
    previsaoFaturamento,
    validadeDias,
    itens,
    observacoes: observacoes || undefined,
    rawText: rawText || "",
  };
}
