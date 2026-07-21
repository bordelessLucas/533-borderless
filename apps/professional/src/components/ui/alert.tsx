import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva('rounded-card border px-3 py-2 text-sm', {
  variants: {
    variant: {
      danger: 'border-[var(--danger)]/30 bg-[var(--danger-subtle)] text-danger',
      warning: 'border-[var(--warning)]/30 bg-[var(--warning-subtle)] text-warning',
      success: 'border-[var(--success)]/30 bg-[var(--success-subtle)] text-success',
      info: 'border-primary/30 bg-primary-subtle text-primary',
    },
  },
  defaultVariants: { variant: 'info' },
});

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  description?: string;
}

export function Alert({ className, variant, description, children, ...props }: AlertProps) {
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {description ?? children}
    </div>
  );
}
