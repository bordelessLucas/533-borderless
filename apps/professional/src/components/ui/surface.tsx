import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SurfaceProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article';
  variant?: 'flat' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClass = {
  none: '',
  sm: 'p-[var(--spacing-sm)]',
  md: 'p-[var(--spacing-md)]',
  lg: 'p-[var(--spacing-lg)]',
} as const;

export const Surface = React.forwardRef<HTMLElement, SurfaceProps>(
  ({ as: Comp = 'div', className, variant = 'elevated', padding = 'md', ...props }, ref) => (
    <Comp
      ref={ref as never}
      className={cn(
        'rounded-card border border-[var(--border-subtle)]',
        variant === 'elevated' && 'bg-surface-elevated shadow-card',
        variant === 'flat' && 'bg-surface',
        paddingClass[padding],
        className,
      )}
      {...props}
    />
  ),
);
Surface.displayName = 'Surface';
