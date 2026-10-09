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
  return (
    <fieldset>
      <legend className={labelClass}>{label}</legend>
      {hint && <p className={hintClass}>{hint}</p>}
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <label key={o} className="flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" name={name} value={o} className={`mt-0.5 ${choiceClass}`} />
            {optionLabel(o)}
          </label>
        ))}
      </div>
      {error && <p className={errorClass}>{error}</p>}
    </fieldset>
  );
}
