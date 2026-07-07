import Image from 'next/image';
import { clsx } from 'clsx';

interface ContentImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

export function ContentImage({
  src,
  alt,
  width,
  height,
  sizes = '100vw',
  className,
  priority = false,
}: ContentImageProps) {
  return (
    // next/image generates WebP/AVIF and srcset automatically — no manual vite-imagetools needed
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={clsx(className)}
      priority={priority}
    />
  );
}
