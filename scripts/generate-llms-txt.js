import fs from 'fs';
import path from 'path';

const services = [
  'Complex web services and startups (Django 5, Next.js 15)',
  'E-commerce on 1C-Bitrix with 1C:UT integration',
  'Digital marketing & Performance (Yandex Direct)',
  'Corporate WordPress sites',
  'Legacy support (Bitrix, WordPress)',
  'AI consulting — LLM and neural network integration',
];

const casesDir = path.join(process.cwd(), 'content', 'cases', 'en');
let caseLines = '';

if (fs.existsSync(casesDir)) {
  const files = fs.readdirSync(casesDir).filter((f) => f.endsWith('.mdx'));
  for (const file of files) {
    const content = fs.readFileSync(path.join(casesDir, file), 'utf-8');
    const titleMatch = content.match(/^title:\s*"(.+)"/m);
    const metricMatch = content.match(/^metric:\s*"(.+)"/m);
    if (titleMatch) {
      caseLines += `- ${titleMatch[1]}${metricMatch ? ` (${metricMatch[1]})` : ''}\n`;
    }
  }
}

const content = `# butakov.dev — Alexander Butakov, IT Consultant

## Services
${services.map((s) => `- ${s}`).join('\n')}

## Engineering Cases
${caseLines || '(cases coming soon)\n'}
## Contact
- Telegram: https://t.me/SashaBooth
- Email: hello@butakov.dev
- Site: https://butakov.dev
`;

const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'llms.txt'), content);
console.log('✓ public/llms.txt generated');
