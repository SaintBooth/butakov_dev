import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const btnClass =
  'w-12 h-12 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-sm flex items-center justify-center text-slate-600 hover:text-teal-600 hover:bg-white/80 transition-all active:scale-95';

interface SliderControlsProps {
  onLeft: () => void;
  onRight: () => void;
  className?: string;
}

export function SliderControls({ onLeft, onRight, className }: SliderControlsProps) {
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <button onClick={onLeft} aria-label="Назад" className={btnClass}>
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={onRight} aria-label="Вперёд" className={btnClass}>
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
