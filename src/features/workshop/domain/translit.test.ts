import { describe, expect, it } from 'vitest';
import { transliterateName } from './translit';

describe('transliterateName', () => {
  it.each([
    ['Александр Бутаков', 'Aleksandr Butakov'],
    ['Хоцкина', 'Khotskina'],
    ['Чашина', 'Chashina'],
    ['Щукин', 'Shchukin'],
    ['ЩЕТИНКИН', 'SHCHETINKIN'],
    ['Юлия Ёлкина', 'Iuliia Elkina'],
    ['Наталья Подъячева', 'Natalia Podieiacheva'],
    ['Эмиль Жуков', 'Emil Zhukov'],
    ['Анна-Мария Цой', 'Anna-Mariia Tsoi'],
  ])('%s → %s', (ru, latin) => {
    expect(transliterateName(ru)).toBe(latin);
  });

  it('keeps latin input and collapses whitespace', () => {
    expect(transliterateName('  John   Smith ')).toBe('John Smith');
  });

  it('drops characters the latin-name field would reject', () => {
    const out = transliterateName('Иван 2-й «Петров»');
    expect(out).toBe('Ivan -i Petrov');
    expect(out).toMatch(/^[A-Za-z .,'&()-]*$/);
  });
});
