import * as React from 'react';
import { cn } from '@/lib/utils';

export const AppSection = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <section
      ref={ref}
      data-app-section=""
      className={cn('flex w-full flex-col gap-[var(--spacing-md)]', className)}
      {...props}
    />
  ),
);
AppSection.displayName = 'AppSection';

export const AppSectionHeader = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <header
      ref={ref}
      data-app-section-header=""
      className={cn(
        'flex flex-col gap-[var(--spacing-2xs)] sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
      {...props}
    />
  ),
);
AppSectionHeader.displayName = 'AppSectionHeader';

export const AppSectionTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    data-app-section-title=""
    className={cn(
      'text-base font-semibold tracking-tight text-[var(--text-primary)]',
      className,
    )}
    {...props}
  />
));
AppSectionTitle.displayName = 'AppSectionTitle';

export const AppSectionDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-app-section-description=""
    className={cn('text-sm text-[var(--text-muted)]', className)}
    {...props}
  />
));
AppSectionDescription.displayName = 'AppSectionDescription';

export const AppSectionActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-app-section-actions=""
    className={cn('flex flex-wrap items-center gap-[var(--spacing-xs)]', className)}
    {...props}
  />
));
AppSectionActions.displayName = 'AppSectionActions';

export const AppSectionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} data-app-section-content="" className={cn('w-full', className)} {...props} />
));
AppSectionContent.displayName = 'AppSectionContent';

export function AppSectionDivider({ className }: { className?: string }) {
  return (
    <hr
      data-app-section-divider=""
      className={cn('border-0 border-t border-[var(--border-subtle)]', className)}
    />
  );
}
