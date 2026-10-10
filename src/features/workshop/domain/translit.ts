// Russian passport rules (MVD order No. 995 of 20.10.2015, appendix 2, ICAO Doc 9303), so the
// Latin name in English-language materials matches the spelling in the participant's passport.
// Ь has no Latin counterpart in that table and is dropped.
const ICAO: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'i',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ы: 'y',
  ъ: 'ie',
  ь: '',
  э: 'e',
  ю: 'iu',
  я: 'ia',
};

// Characters the Latin-name schema accepts besides letters; everything else is dropped.
const KEPT = /[A-Za-z .,'&()-]/;

function letter(ch: string, wordIsUpper: boolean): string {
  const lower = ch.toLowerCase();
  const mapped = ICAO[lower];
  if (mapped === undefined) return KEPT.test(ch) ? ch : '';
  if (ch === lower || mapped === '') return mapped;
  // "Щукин" → "Shchukin", but "ЩУКИН" → "SHCHUKIN".
  return wordIsUpper ? mapped.toUpperCase() : mapped[0].toUpperCase() + mapped.slice(1);
}

function word(w: string): string {
  const isUpper = w.length > 1 && w === w.toUpperCase() && w !== w.toLowerCase();
  return Array.from(w, (ch) => letter(ch, isUpper)).join('');
}

export function transliterateName(input: string): string {
  return input
    .split(/(\s+)/)
    .map((part) => (/^\s+$/.test(part) ? ' ' : word(part)))
    .join('')
    .replace(/ {2,}/g, ' ')
    .trim();
}
