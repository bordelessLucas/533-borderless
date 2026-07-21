import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-3 py-10 text-left',
        className,
      )}
    >
      {Icon ? (
        <Icon className="size-5 text-[var(--text-muted)]" strokeWidth={1.75} aria-hidden />
      ) : null}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[var(--text-secondary)]">{title}</p>
        {description ? (
          <p className="max-w-md text-sm text-[var(--text-muted)]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function MetricCard({
  value,
  label,
  className,
}: {
  value: string | number;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-card border border-[var(--border-subtle)] bg-white px-4 py-4',
        className,
      )}
    >
      <p className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

export function PageNotice({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-card border border-[var(--border-subtle)] bg-white px-6 py-10 text-center text-sm text-[var(--text-muted)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
