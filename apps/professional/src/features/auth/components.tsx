import * as React from 'react';
import { cn } from '@/lib/utils';
import { Stack } from '@/components/ui/stack';
import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';

export function AuthPage({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <main
      data-auth-page=""
      className={cn(
        'flex min-h-screen w-full flex-col items-center justify-center',
        'bg-[color:var(--surface-sunken)]',
        'gap-[var(--space-6)] px-[var(--space-4)] py-[var(--space-8)]',
        className,
      )}
      {...props}
    >
      {children}
    </main>
  );
}

export function AuthHeader({ title, description }: { title: string; description?: string }) {
  return (
    <Stack gap="sm" align="center" className="text-center">
      <Text role="overline" intent="muted">
        Sócio247™
      </Text>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
        {title}
      </h1>
      {description ? (
        <Text role="body" intent="muted">
          {description}
        </Text>
      ) : null}
    </Stack>
  );
}

export function AuthCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Surface as="section" variant="elevated" padding="lg" className={cn('w-full max-w-md', className)}>
      <Stack gap="md">{children}</Stack>
    </Surface>
  );
}

export function AuthFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full text-center">
      <Text role="caption" intent="muted">
        © {year} Sócio247™ · Todos os direitos reservados.
      </Text>
    </footer>
  );
}

export function OrDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[var(--spacing-sm)] text-[var(--text-muted)]">
      <span className="h-px flex-1 bg-[var(--border-subtle)]" />
      <Text role="caption" intent="muted" as="span">
        {children}
      </Text>
      <span className="h-px flex-1 bg-[var(--border-subtle)]" />
    </div>
  );
}

export function PasswordField(props: React.ComponentProps<'input'>) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={cn(
          'flex h-10 w-full rounded-input border border-[var(--border-default)]',
          'bg-surface-elevated px-3 py-2 pr-16 text-sm text-[var(--text-primary)]',
          'placeholder:text-[var(--text-muted)]',
          'outline-none focus-visible:border-primary focus-visible:shadow-[var(--focus-ring-shadow)]',
          'disabled:cursor-not-allowed disabled:opacity-[var(--state-disabled)]',
          props.className,
        )}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-2 text-xs font-semibold text-[var(--link)]"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
      >
        {visible ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  );
}
