/**
 * Компонент для контентных изображений с автоматической конвертацией WebP/AVIF
 * и адаптивным srcset через vite-imagetools.
 *
 * Использование:
 *   import hero from '../assets/hero.jpg';
 *   <ContentImage src={hero} alt="Hero" sizes="100vw" />
 *
 * Для нескольких ширин (responsive):
 *   import heroSet from '../assets/hero.jpg?w=400;800;1200&format=webp&as=srcset'
 *   import heroSetAvif from '../assets/hero.jpg?w=400;800;1200&format=avif&as=srcset'
 *   <ContentImage srcWebp={heroSet} srcAvif={heroSetAvif} src={hero} ... />
 */

import { clsx } from 'clsx';

export function ContentImage({
  // Базовый src (PNG/JPG fallback) — импортируй файл из src/assets/
  src,
  // srcset строки для WebP и AVIF — генерирует vite-imagetools
  srcWebp,
  srcAvif,
  alt,
  width,
  height,
  sizes = '100vw',
  className,
  priority = false,
}) {
  return (
    <picture>
      {srcAvif && <source srcSet={srcAvif} type="image/avif" sizes={sizes} />}
      {srcWebp && <source srcSet={srcWebp} type="image/webp" sizes={sizes} />}
      <img
        src={typeof src === 'string' ? src : (src?.src ?? src)}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={clsx(className)}
        fetchpriority={priority ? 'high' : undefined}
        loading={priority ? 'eager' : 'lazy'}
      />
    </picture>
  );
}
