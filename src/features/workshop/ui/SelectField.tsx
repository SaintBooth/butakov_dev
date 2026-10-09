import { errorClass, inputClass, labelClass } from './formStyles';

interface SelectFieldProps {
  name: string;
  label: string;
  options: readonly string[];
  optionLabel: (id: string) => string;
  placeholder: string;
  required?: boolean;
  error?: string;
}

export function SelectField({
  name,
  label,
  options,
  optionLabel,
  placeholder,
  required,
  error,
}: SelectFieldProps) {
  const id = `ws-${name}`;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && ' *'}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue=""
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClass(Boolean(error))}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {optionLabel(o)}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} className={errorClass}>
          {error}
        </p>
      )}
    </div>
  );
}
