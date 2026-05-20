import sharp from 'sharp';
import { join, basename, extname } from 'path';

const IMAGES = [
  { input: 'public/butakov-01.png', width: null },
];

for (const { input, width } of IMAGES) {
  const name = basename(input, extname(input));
  const dir = input.replace(/\/[^/]+$/, '');

  const base = width ? sharp(input).resize(width) : sharp(input);

  await base.clone().webp({ quality: 85 }).toFile(join(dir, `${name}.webp`));
  await base.clone().avif({ quality: 60 }).toFile(join(dir, `${name}.avif`));

  console.log(`✓ ${input} → ${name}.webp + ${name}.avif`);
}
