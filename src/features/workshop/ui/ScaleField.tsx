import { errorClass, labelClass, PII_CLASS } from './formStyles';

interface ScaleFieldProps {
  name: string;
  label: string;
  min: number;
  max: number;
  lowLabel: string;
  highLabel: string;
  error?: string;
}

export function ScaleField({ name, label, min, max, lowLabel, highLabel, error }: ScaleFieldProps) {
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const id = `ws-${name}`;
  return (
    <fieldset id={id}>
      <legend className={labelClass}>{label} *</legend>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {values.map((v) => (
          <label key={v} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={v}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${id}-error` : undefined}
              className={`peer sr-only ${PII_CLASS}`}
            />
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 peer-checked:border-teal-500 peer-checked:bg-teal-500 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-teal-500/40">
              {v}
            </span>
          </label>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-slate-500">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
      {error && (
        <p id={`${id}-error`} className={errorClass}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
