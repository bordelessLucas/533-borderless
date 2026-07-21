'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Activity,
  Bolt,
  CalendarCheck2,
  CalendarDays,
  Link2,
  LogOut,
  Menu,
  MessageSquare,
  RefreshCw,
  Scissors,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const primaryNav = [
  { href: '/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/operacao', label: 'Operação', icon: Activity },
  { href: '/comunicacao', label: 'Comunicação', icon: MessageSquare },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/meu-link', label: 'Meu link', icon: Link2 },
  { href: '/recorrencia', label: 'Recorrência', icon: RefreshCw },
] as const;

const secondaryNav = [
  { href: '/disponibilidade', label: 'Disponibilidade', icon: CalendarCheck2 },
  { href: '/servicos', label: 'Serviços', icon: Scissors },
  { href: '/equipe', label: 'Equipe', icon: UserRound },
  { href: '/automacoes', label: 'Automações', icon: Bolt },
] as const;

function userInitials(email?: string | null, displayName?: string | null): string {
  const source = displayName?.trim() || email?.trim() || 'UT';
  if (source.includes('@')) {
    return source.slice(0, 2).toUpperCase();
  }
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function NavGroup({
  items,
  activeHref,
  onNavigate,
}: {
  items: readonly { href: string; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[];
  activeHref: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col gap-0.5 px-2">
      {items.map((item) => {
        const isActive = activeHref === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium',
              'text-[var(--text-secondary)] transition-colors',
              'hover:bg-[var(--state-hover-overlay)] hover:text-[var(--text-primary)]',
              isActive && 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-fg)]',
            )}
          >
            {isActive ? (
              <span
                aria-hidden
                className="absolute inset-y-1 left-0 w-[3px] rounded-r-full bg-[var(--sidebar-active-bar)]"
              />
            ) : null}
            <Icon className="size-[18px] shrink-0 opacity-80" strokeWidth={1.75} />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

/**
 * AppShell — UI alinhada aos prints Sócio247™
 * Sidebar cinza clara, active azul soft, header mínimo com avatar.
 */
export function AppShell({
  children,
  activeHref,
}: {
  children: React.ReactNode;
  activeHref: string;
}) {
  const { signOut, user } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const closeMobile = React.useCallback(() => setMobileOpen(false), []);
  const initials = userInitials(user?.email, user?.displayName);

  const sidebarBody = (
    <>
      <div className="px-4 pb-3 pt-5">
        <p className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
          Sócio247™
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        <NavGroup items={primaryNav} activeHref={activeHref} onNavigate={closeMobile} />
        <div className="mx-4 my-3 border-t border-[var(--border-subtle)]" />
        <NavGroup items={secondaryNav} activeHref={activeHref} onNavigate={closeMobile} />
      </div>

      <div className="border-t border-[var(--border-subtle)] p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start text-[var(--text-muted)]"
          onClick={() => void signOut()}
        >
          <LogOut aria-hidden />
          Sair
        </Button>
      </div>
    </>
  );

  return (
    <div className="relative isolate flex min-h-screen w-full bg-white text-[var(--text-primary)]">
      <aside
        aria-label="Navegação principal"
        className="hidden w-[232px] shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--sidebar-bg)] lg:sticky lg:top-0 lg:flex lg:h-screen"
      >
        {sidebarBody}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-overlay lg:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/30"
            aria-label="Fechar menu"
            onClick={closeMobile}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col bg-[var(--sidebar-bg)]">
            <div className="flex items-center justify-between px-3 py-3">
              <span className="text-sm font-semibold">Menu</span>
              <Button type="button" variant="ghost" size="icon" onClick={closeMobile} aria-label="Fechar">
                <X aria-hidden />
              </Button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{sidebarBody}</div>
          </aside>
        </div>
      ) : null}

      <main className="relative flex min-h-screen min-w-0 flex-1 flex-col bg-white">
        <header className="sticky top-0 z-header flex h-12 items-center justify-between border-b border-[var(--border-subtle)] bg-white px-3 lg:px-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Abrir menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu aria-hidden />
          </Button>
          <div className="flex-1" />
          <div
            className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600"
            aria-label={`Conta ${user?.email ?? ''}`}
            title={user?.email ?? undefined}
          >
            {initials}
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-5 lg:px-8 lg:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
