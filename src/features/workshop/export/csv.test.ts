import { describe, expect, it } from 'vitest';
import { toCsv } from './csv';

describe('toCsv', () => {
  it('starts with a BOM and uses CRLF', () => {
    expect(toCsv(['A', 'B'], [['1', 2]])).toBe('\uFEFFA,B\r\n1,2\r\n');
  });

  it('quotes commas, quotes and newlines', () => {
    expect(toCsv(['A'], [['ООО "Ромашка", Москва']])).toBe(
      '\uFEFFA\r\n"ООО ""Ромашка"", Москва"\r\n'
    );
    expect(toCsv(['A'], [['line1\nline2']])).toBe('\uFEFFA\r\n"line1\nline2"\r\n');
  });

  it('neutralises spreadsheet formulas in strings but not in numbers', () => {
    expect(toCsv(['A'], [['=HYPERLINK("x")']])).toContain(`"'=HYPERLINK(""x"")"`);
    expect(toCsv(['A'], [['@cmd']])).toContain("'@cmd");
    expect(toCsv(['A'], [[-5]])).toBe('\uFEFFA\r\n-5\r\n');
  });

  it('renders an invalid date as an empty cell instead of throwing', () => {
    expect(toCsv(['A'], [[new Date('nope')]])).toBe('\uFEFFA\r\n\r\n');
  });

  it('renders null as empty and dates as ISO', () => {
    expect(toCsv(['A', 'B'], [[null, new Date('2026-10-20T15:00:00Z')]])).toBe(
      '\uFEFFA,B\r\n,2026-10-20T15:00:00.000Z\r\n'
    );
  });
});
