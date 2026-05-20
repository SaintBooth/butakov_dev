import { clsx } from 'clsx';

type AlertType = 'info' | 'warning' | 'success' | 'error';

const styles: Record<AlertType, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  warning: 'bg-amber-50 border-amber-200 text-amber-900',
  success: 'bg-teal-50 border-teal-200 text-teal-900',
  error: 'bg-red-50 border-red-200 text-red-900',
};

interface AlertProps {
  type?: AlertType;
  children: React.ReactNode;
}

export function Alert({ type = 'info', children }: AlertProps) {
  return (
    <div className={clsx('border rounded-xl p-4 my-4 text-sm font-medium', styles[type])}>
      {children}
    </div>
  );
}
