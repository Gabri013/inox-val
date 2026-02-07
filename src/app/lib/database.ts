/**
 * SISTEMA DE PERSISTÊNCIA LOCAL (LocalStorage)
 * Biblioteca de projetos, lotes e configurações
 */

import type { DatabaseLocal, Projeto, Lote, TabelaPrecos } from "../types/projeto";

const DB_KEY = "calculadora_inox_db";
const DB_VERSION = "1.0.0";

// ========== TABELA DE PREÇOS PADRÃO ==========

export const TABELA_PRECOS_PADRAO: TabelaPrecos = {
  materiais: {
    "AISI304_1.5mm": 85.0,
    "AISI304_2.0mm": 112.0,
    "AISI304_3.0mm": 145.0,
    "AISI430_1.5mm": 62.0,
    "AISI430_2.0mm": 84.0,
  },
  maoDeObra: {
    corte: 4.0, // R$/min
    solda: 6.5, // R$/min
    polimento: 3.2, // R$/min
    dobra: 5.0, // R$/min
  },
  margemPadrao: 40, // 40%
  custoFixo: 0,
};

// ========== INICIALIZAÇÃO ==========

function getDatabase(): DatabaseLocal {
  try {
    const stored = localStorage.getItem(DB_KEY);

    if (!stored) {
      // Criar banco inicial
      const newDb: DatabaseLocal = {
        projetos: [],
        lotes: [],
        tabelaPrecos: TABELA_PRECOS_PADRAO,
        ultimaAtualizacao: new Date().toISOString(),
      };
      saveDatabase(newDb);
      return newDb;
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error("Erro ao carregar database:", error);
    return {
      projetos: [],
      lotes: [],
      tabelaPrecos: TABELA_PRECOS_PADRAO,
      ultimaAtualizacao: new Date().toISOString(),
    };
  }
}

function saveDatabase(db: DatabaseLocal): void {
  try {
    db.ultimaAtualizacao = new Date().toISOString();
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (error) {
    console.error("Erro ao salvar database:", error);
    alert("Erro ao salvar dados. Verifique o espaço disponível.");
  }
}

// ========== PROJETOS ==========

export function salvarProjeto(projeto: Projeto): void {
  const db = getDatabase();

  // Remover projeto existente com mesmo ID
  db.projetos = db.projetos.filter((p) => p.id !== projeto.id);

  // Adicionar novo/atualizado
  db.projetos.push(projeto);

  // Ordenar por data (mais recente primeiro)
  db.projetos.sort((a, b) => new Date(b.dataModificacao).getTime() - new Date(a.dataModificacao).getTime());

  saveDatabase(db);
}

export function listarProjetos(): Projeto[] {
  const db = getDatabase();
  return db.projetos;
}

export function buscarProjetoPorId(id: string): Projeto | null {
  const db = getDatabase();
  return db.projetos.find((p) => p.id === id) || null;
}

export function deletarProjeto(id: string): void {
  const db = getDatabase();
  db.projetos = db.projetos.filter((p) => p.id !== id);
  saveDatabase(db);
}

export function duplicarProjeto(id: string, novoNome?: string): Projeto | null {
  const original = buscarProjetoPorId(id);
  if (!original) return null;

  const duplicado: Projeto = {
    ...original,
    id: gerarId(),
    nome: novoNome || `${original.nome} (Cópia)`,
    dataCriacao: new Date().toISOString(),
    dataModificacao: new Date().toISOString(),
  };

  salvarProjeto(duplicado);
  return duplicado;
}

// ========== LOTES ==========

export function salvarLote(lote: Lote): void {
  const db = getDatabase();
  db.lotes = db.lotes.filter((l) => l.id !== lote.id);
  db.lotes.push(lote);

  db.lotes.sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());

  saveDatabase(db);
}

export function listarLotes(): Lote[] {
  const db = getDatabase();
  return db.lotes;
}

export function buscarLotePorId(id: string): Lote | null {
  const db = getDatabase();
  return db.lotes.find((l) => l.id === id) || null;
}

export function deletarLote(id: string): void {
  const db = getDatabase();
  db.lotes = db.lotes.filter((l) => l.id !== id);
  saveDatabase(db);
}

// ========== TABELA DE PREÇOS ==========

export function getTabelaPrecos(): TabelaPrecos {
  const db = getDatabase();
  return db.tabelaPrecos;
}

export function atualizarTabelaPrecos(tabela: TabelaPrecos): void {
  const db = getDatabase();
  db.tabelaPrecos = tabela;
  saveDatabase(db);
}

export function resetTabelaPrecos(): void {
  const db = getDatabase();
  db.tabelaPrecos = TABELA_PRECOS_PADRAO;
  saveDatabase(db);
}

// ========== UTILIDADES ==========

export function gerarId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function exportarDatabase(): string {
  const db = getDatabase();
  return JSON.stringify(db, null, 2);
}

export function importarDatabase(jsonString: string): boolean {
  try {
    const db = JSON.parse(jsonString) as DatabaseLocal;
    saveDatabase(db);
    return true;
  } catch (error) {
    console.error("Erro ao importar database:", error);
    return false;
  }
}

export function limparDatabase(): void {
  if (confirm("⚠️ ATENÇÃO: Isto irá apagar TODOS os projetos salvos. Continuar?")) {
    localStorage.removeItem(DB_KEY);
    alert("✅ Database limpo com sucesso!");
    window.location.reload();
  }
}
