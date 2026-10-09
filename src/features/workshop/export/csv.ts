export type CsvCell = string | number | boolean | Date | null | undefined;

// Excel and LibreOffice execute cells starting with these characters as formulas.
const FORMULA_START = /^[=+\-@\t\r]/;

function cell(value: CsvCell): string {
  if (value === null || value === undefined) return '';
  let s = value instanceof Date ? value.toISOString() : String(value);
  if (typeof value === 'string' && FORMULA_START.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) || s !== s.trim() ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: CsvCell[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(cell).join(','));
  // The BOM makes Excel open UTF-8 Cyrillic correctly.
  return `﻿${lines.join('\r\n')}\r\n`;
}
