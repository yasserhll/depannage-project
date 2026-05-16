import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:   string;
  error?:   string;
  hint?:    string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-brand-text">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 bg-surface border rounded-xl text-brand-text',
            'placeholder-brand-muted text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            error ? 'border-red-500' : 'border-brand-border',
            className,
          )}
          {...props}
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        {hint && !error && <p className="text-brand-muted text-xs">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
