import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-input border border-[var(--border-default)]',
        'bg-surface-elevated px-3 py-2 text-sm text-[var(--text-primary)]',
        'placeholder:text-[var(--text-muted)]',
        'outline-none transition-[border-color,box-shadow] duration-150',
        'focus-visible:border-primary focus-visible:shadow-[var(--focus-ring-shadow)]',
        'disabled:cursor-not-allowed disabled:opacity-[var(--state-disabled)]',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
