import type { ReactNode } from 'react';
import { choiceClass, errorClass } from './formStyles';

interface CheckboxProps {
  name: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export function Checkbox({ name, required, error, children }: CheckboxProps) {
  const id = `ws-${name}`;
  return (
    <div>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          id={id}
          type="checkbox"
          name={name}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`mt-0.5 ${choiceClass}`}
        />
        <span>
          {children}
          {required && ' *'}
        </span>
      </label>
      {error && (
        <p id={`${id}-error`} className={errorClass}>
          {error}
        </p>
      )}
    </div>
  );
}
