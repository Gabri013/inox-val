// Auto-generated runtime for planilha engine.
import type { CellEntry, ComputeOverrides, ComputeResult, WorkbookData } from './types';

type Token = { type: string; value?: string };
type ExprNode =
  | { type: 'literal'; value: any }
  | { type: 'ref'; sheet?: string; address: string }
  | { type: 'range'; sheet?: string; start: string; end: string }
  | { type: 'unary'; op: string; value: ExprNode }
  | { type: 'binary'; op: string; left: ExprNode; right: ExprNode }
  | { type: 'call'; name: string; args: ExprNode[] };

const fnAliases: Record<string, string> = {
  SOMA: 'SUM',
  SE: 'IF',
  E: 'AND',
  OU: 'OR',
  ARRED: 'ROUND',
};

function toNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value == null) return 0;
  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function applyOverrides(cells: Record<string, CellEntry>, overrides: ComputeOverrides) {
  Object.entries(overrides).forEach(([cell, value]) => {
    cells[cell] = { value };
  });
}

function colToNumber(col: string) {
  let num = 0;
  for (let i = 0; i < col.length; i++) {
    num = num * 26 + (col.charCodeAt(i) - 64);
  }
  return num;
}

function numberToCol(num: number) {
  let col = '';
  while (num > 0) {
    const rem = (num - 1) % 26;
    col = String.fromCharCode(65 + rem) + col;
    num = Math.floor((num - 1) / 26);
  }
  return col;
}

function expandRange(start: string, end: string) {
  const startMatch = /^\$?([A-Z]+)\$?(\d+)$/.exec(start);
  const endMatch = /^\$?([A-Z]+)\$?(\d+)$/.exec(end);
  if (!startMatch || !endMatch) return [] as string[];
  const startCol = colToNumber(startMatch[1]);
  const startRow = Number(startMatch[2]);
  const endCol = colToNumber(endMatch[1]);
  const endRow = Number(endMatch[2]);
  const cols = [Math.min(startCol, endCol), Math.max(startCol, endCol)];
  const rows = [Math.min(startRow, endRow), Math.max(startRow, endRow)];
  const cells: string[] = [];
  for (let c = cols[0]; c <= cols[1]; c++) {
    for (let r = rows[0]; r <= rows[1]; r++) {
      cells.push(numberToCol(c) + String(r));
    }
  }
  return cells;
}

function tokenize(formula: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < formula.length) {
    const ch = formula[i];
    if (ch === ' ' || ch === '	') {
      i += 1;
      continue;
    }
    if (ch === '"') {
      let j = i + 1;
      let value = '';
      while (j < formula.length && formula[j] !== '"') {
        value += formula[j];
        j += 1;
      }
      tokens.push({ type: 'string', value });
      i = j + 1;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      let j = i;
      let value = '';
      while (j < formula.length && /[0-9.,]/.test(formula[j])) {
        value += formula[j];
        j += 1;
      }
      tokens.push({ type: 'number', value });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch) || ch === "'" || ch === '$') {
      if (ch === "'") {
        let j = i + 1;
        let value = '';
        while (j < formula.length && formula[j] !== "'") {
          value += formula[j];
          j += 1;
        }
        tokens.push({ type: 'identifier', value });
        i = j + 1;
        continue;
      }
      let j = i;
      let value = '';
      while (j < formula.length && /[A-Za-z0-9_$.]/.test(formula[j])) {
        value += formula[j];
        j += 1;
      }
      tokens.push({ type: 'identifier', value });
      i = j;
      continue;
    }
    if (ch === '>' || ch === '<' || ch === '=') {
      const next = formula[i + 1];
      if ((ch === '>' || ch === '<') && next === '=') {
        tokens.push({ type: 'op', value: ch + '=' });
        i += 2;
        continue;
      }
      if (ch === '<' && next === '>') {
        tokens.push({ type: 'op', value: '<>' });
        i += 2;
        continue;
      }
      tokens.push({ type: 'op', value: ch });
      i += 1;
      continue;
    }
    if ('+-*/^(),;:!'.includes(ch)) {
      tokens.push({ type: ch, value: ch });
      i += 1;
      continue;
    }
    i += 1;
  }
  return tokens;
}

function parseFormula(formula: string): ExprNode {
  const tokens = tokenize(formula.replace(/^=/, ''));
  let pos = 0;

  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  function parsePrimary(): ExprNode {
    const token = consume();
    if (!token) return { type: 'literal', value: null };
    if (token.type === 'number') {
      return { type: 'literal', value: toNumber(token.value) };
    }
    if (token.type === 'string') {
      return { type: 'literal', value: token.value ?? '' };
    }
    if (token.type === '(') {
      const expr = parseExpression();
      consume();
      return expr;
    }
    if (token.type === 'op' && token.value === '-') {
      return { type: 'unary', op: '-', value: parsePrimary() };
    }
    if (token.type === 'identifier') {
      const next = peek();
      const id = token.value || '';
      if (next && next.type === '!') {
        consume();
        const refToken = consume();
        if (refToken?.type === 'identifier') {
          return { type: 'ref', sheet: id, address: refToken.value || '' };
        }
      }
      if (next && next.type === '(') {
        consume();
        const args: ExprNode[] = [];
        while (peek() && peek().type !== ')') {
          args.push(parseExpression());
          if (peek() && (peek().type === ',' || peek().type === ';')) consume();
        }
        consume();
        const name = fnAliases[id.toUpperCase()] || id.toUpperCase();
        return { type: 'call', name, args };
      }
      if (/^\$?[A-Za-z]{1,3}\$?\d+$/.test(id)) {
        if (peek() && peek().type === ':') {
          consume();
          const end = consume();
          if (end?.type === 'identifier') {
            return { type: 'range', start: id, end: end.value || '' };
          }
        }
        return { type: 'ref', address: id };
      }
      if (id.toUpperCase() === 'TRUE') return { type: 'literal', value: true };
      if (id.toUpperCase() === 'FALSE') return { type: 'literal', value: false };
      return { type: 'literal', value: id };
    }
    return { type: 'literal', value: null };
  }

  function parsePower(): ExprNode {
    let node = parsePrimary();
    while (peek() && peek().type === '^') {
      consume();
      node = { type: 'binary', op: '^', left: node, right: parsePrimary() };
    }
    return node;
  }

  function parseTerm(): ExprNode {
    let node = parsePower();
    while (peek() && (peek().type === '*' || peek().type === '/')) {
      const op = consume();
      node = { type: 'binary', op: op.value || op.type, left: node, right: parsePower() };
    }
    return node;
  }

  function parseAdditive(): ExprNode {
    let node = parseTerm();
    while (peek() && (peek().type === '+' || peek().type === '-')) {
      const op = consume();
      node = { type: 'binary', op: op.value || op.type, left: node, right: parseTerm() };
    }
    return node;
  }

  function parseComparison(): ExprNode {
    let node = parseAdditive();
    while (peek() && peek().type === 'op') {
      const op = consume();
      node = { type: 'binary', op: op.value || '', left: node, right: parseAdditive() };
    }
    return node;
  }

  function parseExpression(): ExprNode {
    return parseComparison();
  }

  return parseExpression();
}

function evalNode(
  node: ExprNode,
  sheetName: string,
  workbook: WorkbookData,
  cache: Record<string, any>,
  stack: string[]
): any {
  switch (node.type) {
    case 'literal':
      return node.value;
    case 'ref': {
      const targetSheet = node.sheet || sheetName;
      const key = targetSheet + "!" + node.address;
      if (cache[key] !== undefined) return cache[key];
      if (stack.includes(key)) return null;
      stack.push(key);
      const sheet = workbook[targetSheet] || {};
      const cell = sheet[node.address];
      let value: any = cell?.value ?? null;
      if (cell?.formula) {
        value = evalNode(parseFormula(cell.formula), targetSheet, workbook, cache, stack);
      }
      cache[key] = value;
      stack.pop();
      return value;
    }
    case 'range': {
      const targetSheet = node.sheet || sheetName;
      return expandRange(node.start, node.end).map((address) =>
        evalNode({ type: 'ref', sheet: targetSheet, address }, targetSheet, workbook, cache, stack)
      );
    }
    case 'unary':
      if (node.op === '-') return -toNumber(evalNode(node.value, sheetName, workbook, cache, stack));
      return evalNode(node.value, sheetName, workbook, cache, stack);
    case 'binary': {
      const left = evalNode(node.left, sheetName, workbook, cache, stack);
      const right = evalNode(node.right, sheetName, workbook, cache, stack);
      switch (node.op) {
        case '+':
          return toNumber(left) + toNumber(right);
        case '-':
          return toNumber(left) - toNumber(right);
        case '*':
          return toNumber(left) * toNumber(right);
        case '/':
          return toNumber(left) / toNumber(right);
        case '^':
          return Math.pow(toNumber(left), toNumber(right));
        case '=':
          return left === right;
        case '<>':
          return left !== right;
        case '>':
          return toNumber(left) > toNumber(right);
        case '<':
          return toNumber(left) < toNumber(right);
        case '>=':
          return toNumber(left) >= toNumber(right);
        case '<=':
          return toNumber(left) <= toNumber(right);
        default:
          return null;
      }
    }
    case 'call': {
      const flatArgs = (values: any[]) => values.flatMap((arg: any) => (Array.isArray(arg) ? arg : [arg]));
      switch (node.name) {
        case 'SUM': {
          const args = node.args.map((arg) => evalNode(arg, sheetName, workbook, cache, stack));
          const flat = flatArgs(args);
          return flat.reduce((acc: number, v: any) => acc + toNumber(v), 0);
        }
        case 'MIN': {
          const args = node.args.map((arg) => evalNode(arg, sheetName, workbook, cache, stack));
          return Math.min(...flatArgs(args).map(toNumber));
        }
        case 'MAX': {
          const args = node.args.map((arg) => evalNode(arg, sheetName, workbook, cache, stack));
          return Math.max(...flatArgs(args).map(toNumber));
        }
        case 'IF': {
          const cond = evalNode(node.args[0], sheetName, workbook, cache, stack);
          if (cond) return evalNode(node.args[1], sheetName, workbook, cache, stack);
          return evalNode(node.args[2], sheetName, workbook, cache, stack);
        }
        case 'AND': {
          for (const arg of node.args) {
            if (!evalNode(arg, sheetName, workbook, cache, stack)) return false;
          }
          return true;
        }
        case 'OR': {
          for (const arg of node.args) {
            if (evalNode(arg, sheetName, workbook, cache, stack)) return true;
          }
          return false;
        }
        case 'ROUND': {
          const args = node.args.map((arg) => evalNode(arg, sheetName, workbook, cache, stack));
          const flat = flatArgs(args);
          const value = toNumber(flat[0]);
          const digits = Number(flat[1] ?? 0);
          const factor = Math.pow(10, digits);
          return Math.round(value * factor) / factor;
        }
        case 'CEIL': {
          const args = node.args.map((arg) => evalNode(arg, sheetName, workbook, cache, stack));
          const flat = flatArgs(args);
          return Math.ceil(toNumber(flat[0]));
        }
        case 'FLOOR': {
          const args = node.args.map((arg) => evalNode(arg, sheetName, workbook, cache, stack));
          const flat = flatArgs(args);
          return Math.floor(toNumber(flat[0]));
        }
        default:
          return null;
      }
    }
    default:
      return null;
  }
}

function findOutputs(resolved: Record<string, any>) {
  const outputs: Record<string, any> = {};
  const labels = ['TOTAL', 'PRECO', 'CUSTO'];
  Object.entries(resolved).forEach(([address, value]) => {
    if (typeof value !== 'string') return;
    const upper = value.toUpperCase();
    if (!labels.some((label) => upper.includes(label))) return;
    const match = /^([A-Z]+)(\d+)$/.exec(address);
    if (!match) return;
    const col = colToNumber(match[1]);
    const row = match[2];
    const nextCell = numberToCol(col + 1) + String(row);
    if (resolved[nextCell] !== undefined) {
      outputs[value] = resolved[nextCell];
    }
  });
  return outputs;
}

export function computeSheet(workbook: WorkbookData, sheetName: string, overrides: ComputeOverrides): ComputeResult {
  const sheet = workbook[sheetName];
  if (!sheet) {
    return { sheetName, cells: {}, outputs: {} };
  }

  const cells = { ...sheet } as Record<string, CellEntry>;
  applyOverrides(cells, overrides);

  const cache: Record<string, any> = {};
  const resolved: Record<string, any> = {};
  Object.keys(cells).forEach((cell) => {
    resolved[cell] = evalNode({ type: 'ref', address: cell }, sheetName, { ...workbook, [sheetName]: cells }, cache, []);
  });

  return {
    sheetName,
    cells: resolved,
    outputs: findOutputs(resolved),
  };
}
