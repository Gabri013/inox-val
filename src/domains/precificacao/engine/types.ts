export type CellEntry = { value: string | number | boolean | null; formula?: string };
export type SheetData = Record<string, CellEntry>;
export type WorkbookData = Record<string, SheetData>;
export type ComputeOverrides = Record<string, string | number | boolean | null>;
export type ComputeResult = { sheetName: string; cells: Record<string, any>; outputs: Record<string, any> };
