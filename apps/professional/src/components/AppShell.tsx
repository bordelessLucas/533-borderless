'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { workspace as mockWorkspace } from '@/data/mock';

const nav = [
  { href: '/dashboard', label: 'Hoje' },
  { href: '/agenda', label: 'Agenda' },
  { href: '/clientes', label: 'Clientes' },
  { href: '/servicos', label: 'Serviços' },
  { href: '/configuracoes', label: 'Config' },
] as const;

export function AppShell({
  children,
  activeHref,
}: {
  children: React.ReactNode;
  activeHref: string;
}) {
  const { signOut, user } = useAuth();
  const { workspace, isLoading } = useWorkspace();

  const businessName = workspace?.name ?? mockWorkspace.name;
  const subtitle = isLoading
    ? 'Carregando workspace…'
    : user?.email
      ? `${businessName} · ${user.email}`
      : businessName;

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-5 md:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 border-b border-paper-line pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              Sócio<span className="text-brand">247</span>
            </p>
            <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex flex-wrap gap-1">
              {nav.map((item) => {
                const isActive = activeHref === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-ink text-paper-raised'
                        : 'text-ink-soft hover:bg-paper-raised/70'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-md border border-paper-line px-3 py-2 text-sm font-semibold text-ink-soft hover:border-ink/20"
            >
              Sair
            </button>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
