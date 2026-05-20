interface LogoImageProps {
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  alt?: string;
}

export function LogoImage({
  width,
  height,
  className,
  priority = false,
  alt = 'Александр Бутаков',
}: LogoImageProps) {
  return (
    <picture>
      <source srcSet="/butakov-01.avif" type="image/avif" />
      <source srcSet="/butakov-01.webp" type="image/webp" />
      <img
        src="/butakov-01.png"
        alt={alt}
        width={width}
        height={height}
        fetchpriority={priority ? 'high' : undefined}
        className={className}
      />
    </picture>
  );
}
