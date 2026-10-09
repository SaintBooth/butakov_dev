import { errorClass, hintClass, inputClass, labelClass } from './formStyles';

interface TextFieldProps {
  name: string;
  label: string;
  required?: boolean;
  type?: 'text' | 'email' | 'url';
  multiline?: boolean;
  maxLength?: number;
  autoComplete?: string;
  hint?: string;
  error?: string;
}

export function TextField({
  name,
  label,
  required,
  type = 'text',
  multiline,
  maxLength,
  autoComplete,
  hint,
  error,
}: TextFieldProps) {
  const id = `ws-${name}`;
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const common = {
    id,
    name,
    maxLength,
    required,
    'aria-invalid': Boolean(error),
    'aria-describedby': describedBy,
    className: inputClass(Boolean(error)),
  };
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && ' *'}
      </label>
      {multiline ? (
        <textarea rows={3} {...common} />
      ) : (
        <input type={type} autoComplete={autoComplete} {...common} />
      )}
      {hint && (
        <p id={`${id}-hint`} className={hintClass}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={errorClass}>
          {error}
        </p>
      )}
    </div>
  );
}
