import { choiceClass, errorClass, hintClass, labelClass } from './formStyles';

interface ChoiceListProps {
  name: string;
  label: string;
  options: readonly string[];
  optionLabel: (id: string) => string;
  hint?: string;
  error?: string;
}

export function ChoiceList({ name, label, options, optionLabel, hint, error }: ChoiceListProps) {
  const id = `ws-${name}`;
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <fieldset id={id} aria-describedby={describedBy}>
      <legend className={labelClass}>{label}</legend>
      {hint && (
        <p id={`${id}-hint`} className={hintClass}>
          {hint}
        </p>
      )}
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <label key={o} className="flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" name={name} value={o} className={`mt-0.5 ${choiceClass}`} />
            {optionLabel(o)}
          </label>
        ))}
      </div>
      {error && (
        <p id={`${id}-error`} className={errorClass}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
