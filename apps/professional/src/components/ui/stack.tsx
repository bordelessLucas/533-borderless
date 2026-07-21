import * as React from 'react';
import { cn } from '@/lib/utils';

type Gap = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const gapClass: Record<Gap, string> = {
  '2xs': 'gap-[var(--spacing-2xs)]',
  xs: 'gap-[var(--spacing-xs)]',
  sm: 'gap-[var(--spacing-sm)]',
  md: 'gap-[var(--spacing-md)]',
  lg: 'gap-[var(--spacing-lg)]',
  xl: 'gap-[var(--spacing-xl)]',
};

export interface StackProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'form' | 'ul' | 'ol';
  gap?: Gap;
  align?: 'start' | 'center' | 'end' | 'stretch';
}

export const Stack = React.forwardRef<HTMLElement, StackProps>(
  ({ as: Comp = 'div', className, gap = 'md', align = 'stretch', ...props }, ref) => (
    <Comp
      ref={ref as never}
      className={cn(
        'flex flex-col',
        gapClass[gap],
        align === 'start' && 'items-start',
        align === 'center' && 'items-center',
        align === 'end' && 'items-end',
        align === 'stretch' && 'items-stretch',
        className,
      )}
      {...props}
    />
  ),
);
Stack.displayName = 'Stack';
