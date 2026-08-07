import fs from 'fs';
import path from 'path';

const services = [
  'Complex web platforms & startups (Django 5, Next.js 15)',
  'E-commerce on 1C-Bitrix with 1C:UT integration',
  'Digital marketing & Performance (Yandex Direct)',
  'Corporate WordPress sites',
  'Legacy support (Bitrix, WordPress)',
  'AI consulting — LLM and neural network integration',
];

function readCases(locale, urlPrefix) {
  const casesDir = path.join(process.cwd(), 'content', 'cases', locale);
  if (!fs.existsSync(casesDir)) return '';

  const files = fs.readdirSync(casesDir).filter((f) => f.endsWith('.mdx'));
  const cases = files
    .map((file) => {
      const content = fs.readFileSync(path.join(casesDir, file), 'utf-8');
      const titleMatch = content.match(/^title:\s*"(.+)"/m);
      const metricMatch = content.match(/^metric:\s*"(.+)"/m);
      const dateMatch = content.match(/^date:\s*"(.+)"/m);
      const slug = file.replace(/\.mdx$/, '');
      return { titleMatch, metricMatch, dateMatch, slug };
    })
    .filter((c) => c.titleMatch && c.dateMatch)
    .sort((a, b) => b.dateMatch[1].localeCompare(a.dateMatch[1]));

  return cases
    .map(
      ({ titleMatch, metricMatch, slug }) =>
        `- [${titleMatch[1]}${metricMatch ? ` (${metricMatch[1]})` : ''}](https://butakov.dev${urlPrefix}/journal/${slug})`
    )
    .join('\n');
}

const enCases = readCases('en', '');
const ruCases = readCases('ru', '/ru');

const content = `# butakov.dev — Alexander Butakov, IT Consultant

> IT consultant and software engineer: Django/Next.js platforms, 1C-Bitrix e-commerce, WordPress, and AI/LLM integration. Site available in English and Russian.

## Services
${services.map((s) => `- ${s}`).join('\n')}

## Engineering Cases
${enCases || '(cases coming soon)'}

## Инженерный журнал (русская версия)
${ruCases || '(скоро появятся кейсы)'}

## Contact
- [Telegram](https://t.me/SashaBooth)
- [Email](mailto:hello@butakov.dev)
- [Site](https://butakov.dev)

## Optional
- [Русская версия сайта](https://butakov.dev/ru)
`;

const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'llms.txt'), content);
console.log('✓ public/llms.txt generated');
