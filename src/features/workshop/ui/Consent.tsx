import type { ReactNode } from 'react';
import { choiceClass, errorClass } from './formStyles';

interface ConsentProps {
  name: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export function Consent({ name, required, error, children }: ConsentProps) {
  return (
    <div>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name={name}
          required={required}
          aria-invalid={Boolean(error)}
          className={`mt-0.5 ${choiceClass}`}
        />
        <span>
          {children}
          {required && ' *'}
        </span>
      </label>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}
