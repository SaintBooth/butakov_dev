import { clsx } from 'clsx';

interface ContentImageProps {
  src: string | { src: string };
  srcWebp?: string;
  srcAvif?: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

export function ContentImage({
  src,
  srcWebp,
  srcAvif,
  alt,
  width,
  height,
  sizes = '100vw',
  className,
  priority = false,
}: ContentImageProps) {
  const imgSrc = typeof src === 'string' ? src : (src?.src ?? '');

  return (
    <picture>
      {srcAvif && <source srcSet={srcAvif} type="image/avif" sizes={sizes} />}
      {srcWebp && <source srcSet={srcWebp} type="image/webp" sizes={sizes} />}
      <img
        src={imgSrc}
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
