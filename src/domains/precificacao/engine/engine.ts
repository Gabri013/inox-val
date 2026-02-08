// Auto-generated. Do not edit by hand.
import { computeSheet } from './runtime';
import type { ComputeOverrides, ComputeResult, WorkbookData } from './types';
import * as sheet0 from './sheets/sheet_1.ts';

const workbook: WorkbookData = {
  "TEST": sheet0.cells,
};

export function compute(sheetName: string, overrides: ComputeOverrides = {}): ComputeResult {
  return computeSheet(workbook, sheetName, overrides);
}
