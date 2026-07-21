import * as React from 'react';
import { cn } from '@/lib/utils';

export const AppPage = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <section
      ref={ref}
      data-app-page=""
      className={cn('flex w-full flex-col gap-[var(--spacing-lg)]', className)}
      {...props}
    />
  ),
);
AppPage.displayName = 'AppPage';

export const AppPageHeader = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <header
      ref={ref}
      data-app-page-header=""
      className={cn(
        'flex flex-col gap-[var(--spacing-sm)] sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
      {...props}
    />
  ),
);
AppPageHeader.displayName = 'AppPageHeader';

export const AppPageTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    data-app-page-title=""
    className={cn(
      'text-lg font-semibold tracking-tight text-[var(--text-primary)] md:text-xl',
      className,
    )}
    {...props}
  />
));
AppPageTitle.displayName = 'AppPageTitle';

export const AppPageDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-app-page-description=""
    className={cn('max-w-xl text-sm text-[var(--text-muted)] md:text-base', className)}
    {...props}
  />
));
AppPageDescription.displayName = 'AppPageDescription';

export const AppPageActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-app-page-actions=""
      className={cn('flex flex-wrap items-center gap-[var(--spacing-xs)]', className)}
      {...props}
    />
  ),
);
AppPageActions.displayName = 'AppPageActions';

export const AppPageContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-app-page-content=""
      className={cn('flex w-full flex-col gap-[var(--spacing-lg)]', className)}
      {...props}
    />
  ),
);
AppPageContent.displayName = 'AppPageContent';
