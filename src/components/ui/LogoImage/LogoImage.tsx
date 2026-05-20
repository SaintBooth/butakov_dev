import Image from 'next/image';

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
    <Image
      src="/butakov-01.png"
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
