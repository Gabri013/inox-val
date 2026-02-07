// src/bom/models/index.ts
import { BOMResult, MesaConfig } from "../types";

// IMPORTS DOS MODELOS (um arquivo por modelo)
import { gerarBOM_S152908 } from "./s152908/s152908";
import { gerarBOM_MPVE } from "./mpve/mpve";

import { gerarBOM_MPLC } from "./mplc/mplc";
import { gerarBOM_MPLC6 } from "./mplc/mplc6";

import { gerarBOM_MPLCP6 } from "./mplcp/mplcp6";
// (se existir MPLCP 4 pés) import { gerarBOM_MPLCP } from "./mplcp/mplcp";

import { gerarBOM_MPLEP } from "./mplep/mplep";
import { gerarBOM_MPLEP6 } from "./mplep/mplep6";

import { gerarBOM_MPLE4_INV_LE } from "./mple4_inv_le/mple4_inv_le";
import { gerarBOM_MPLE4_INV_LE6 } from "./mple4_inv_le/mple4_inv_le6";

import { gerarBOM_MPLE4_INV_LD } from "./mple4_inv_ld/mple4_inv_ld";
import { gerarBOM_MPLE4_INV_LD6 } from "./mple4_inv_ld/mple4_inv_ld6";

export type ModeloBOM =
  | "S152908"
  | "MPVE"
  | "MPLC"
  | "MPLC6"
  | "MPLCP6"
  | "MPLEP"
  | "MPLEP6"
  | "MPLE4_INV_LE"
  | "MPLE4_INV_LE6"
  | "MPLE4_INV_LD"
  | "MPLE4_INV_LD6";

export const MODELOS_BOM: { value: ModeloBOM; label: string; categoria: string; descricao: string }[] = [
  { 
    value: "S152908", 
    label: "Bancada de encosto com cuba central (4 pés)",
    categoria: "Com Cuba",
    descricao: "Modelo S152908. Encosto com cuba central e estrutura contraventada de 4 pés"
  },
  { 
    value: "MPVE", 
    label: "Bancada de encosto com borda d'água e cuba direita (4 pés)",
    categoria: "Com Cuba e Borda",
    descricao: "Modelo MPVE. Encosto com borda d'água, cuba direita e estrutura contraventada de 4 pés"
  },
  { 
    value: "MPLC", 
    label: "Bancada de centro contraventada (4 pés)",
    categoria: "Centro",
    descricao: "Modelo MPLC. Centro com estrutura contraventada de 4 pés"
  },
  { 
    value: "MPLC6", 
    label: "Bancada de centro contraventada (6 pés)",
    categoria: "Centro",
    descricao: "Modelo MPLC6. Centro com estrutura contraventada de 6 pés para comprimentos maiores"
  },
  { 
    value: "MPLCP6", 
    label: "Bancada de centro com prateleira (6 pés)",
    categoria: "Centro",
    descricao: "Modelo MPLCP6. Centro com prateleira e 6 pés de apoio"
  },
  { 
    value: "MPLEP", 
    label: "Bancada de encosto com prateleira (4 pés)",
    categoria: "Encosto",
    descricao: "Modelo MPLEP. Encosto com prateleira inferior e 4 pés de apoio"
  },
  { 
    value: "MPLEP6", 
    label: "Bancada de encosto com prateleira (6 pés)",
    categoria: "Encosto",
    descricao: "Modelo MPLEP6. Encosto com prateleira inferior e 6 pés de apoio para comprimentos maiores"
  },
  { 
    value: "MPLE4_INV_LE", 
    label: "Bancada de encosto com espelho traseiro e lateral esquerda (4 pés)",
    categoria: "Com Espelhos",
    descricao: "Modelo MPLE4 INV LE. Encosto com espelho traseiro e lateral esquerda, 4 pés de apoio"
  },
  { 
    value: "MPLE4_INV_LE6", 
    label: "Bancada de encosto com espelho traseiro e lateral esquerda (6 pés)",
    categoria: "Com Espelhos",
    descricao: "Modelo MPLE4 INV LE6. Encosto com espelho traseiro e lateral esquerda, 6 pés de apoio"
  },
  { 
    value: "MPLE4_INV_LD", 
    label: "Bancada de encosto com espelho traseiro e lateral direita (4 pés)",
    categoria: "Com Espelhos",
    descricao: "Modelo MPLE4 INV LD. Encosto com espelho traseiro e lateral direita, 4 pés de apoio"
  },
  { 
    value: "MPLE4_INV_LD6", 
    label: "Bancada de encosto com espelho traseiro e lateral direita (6 pés)",
    categoria: "Com Espelhos",
    descricao: "Modelo MPLE4 INV LD6. Encosto com espelho traseiro e lateral direita, 6 pés de apoio"
  },
];

/**
 * REGISTRY DE MODELOS - FONTE ÚNICA DE VERDADE
 * Qualquer parte do sistema que precisar listar/validar modelos deve usar este registry
 */
export const MODELOS_REGISTRY = new Map(
  MODELOS_BOM.map(modelo => [modelo.value, modelo])
);

/**
 * Lista de IDs de modelos válidos (para validação)
 */
export const MODELOS_IDS = MODELOS_BOM.map(m => m.value);

/**
 * Valida se um modeloId existe no registry
 */
export function isModeloValido(modeloId: string): modeloId is ModeloBOM {
  return MODELOS_REGISTRY.has(modeloId as ModeloBOM);
}

/**
 * Busca modelo no registry (throw se não existir)
 */
export function getModelo(modeloId: ModeloBOM) {
  const modelo = MODELOS_REGISTRY.get(modeloId);
  if (!modelo) {
    throw new Error(`Modelo "${modeloId}" não encontrado no registry`);
  }
  return modelo;
}

export function gerarBOMIndustrial(modelo: ModeloBOM, config: MesaConfig): BOMResult {
  switch (modelo) {
    case "S152908":
      return gerarBOM_S152908(config);
    case "MPVE":
      return gerarBOM_MPVE(config);

    case "MPLC":
      return gerarBOM_MPLC(config);
    case "MPLC6":
      return gerarBOM_MPLC6(config);

    case "MPLCP6":
      return gerarBOM_MPLCP6(config);

    case "MPLEP":
      return gerarBOM_MPLEP(config);
    case "MPLEP6":
      return gerarBOM_MPLEP6(config);

    case "MPLE4_INV_LE":
      return gerarBOM_MPLE4_INV_LE(config);
    case "MPLE4_INV_LE6":
      return gerarBOM_MPLE4_INV_LE6(config);

    case "MPLE4_INV_LD":
      return gerarBOM_MPLE4_INV_LD(config);
    case "MPLE4_INV_LD6":
      return gerarBOM_MPLE4_INV_LD6(config);

    default: {
      const _exhaustive: never = modelo;
      throw new Error(`Modelo não suportado: ${_exhaustive}`);
    }
  }
}