'use client';

import { AlertCircle } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/ui/patterns';
import { useWorkspace } from '@/providers/WorkspaceProvider';

export default function MeuLinkPage() {
  const { workspace, isLoading } = useWorkspace();
  const slug = workspace?.slug;
  const bookingLink = slug ? `https://socio247.app/b/${slug}` : null;
  const configured = Boolean(slug);

  return (
    <AppShell activeHref="/meu-link">
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-[var(--text-muted)]">Carregando…</p>
        ) : null}

        <section className="rounded-card border border-[var(--border-subtle)] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Seu link oficial</h2>
            <Badge variant={configured ? 'success' : 'warning'}>
              {configured ? (
                'Configurado'
              ) : (
                <span className="inline-flex items-center gap-1">
                  <AlertCircle className="size-3" aria-hidden />
                  Não configurado
                </span>
              )}
            </Badge>
          </div>
          {configured && bookingLink ? (
            <p className="break-all rounded-md border border-dashed border-[var(--border-subtle)] bg-slate-50 px-3 py-3 text-sm font-medium text-[var(--link)]">
              {bookingLink}
            </p>
          ) : (
            <>
              <div className="rounded-md border border-dashed border-[var(--border-subtle)] bg-slate-50 px-3 py-6 text-sm text-[var(--text-muted)]">
                Configure seu endereço abaixo para começar a receber agendamentos.
              </div>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Configure seu endereço para começar.
              </p>
            </>
          )}
        </section>

        <section className="rounded-card border border-[var(--border-subtle)] p-4">
          <h2 className="text-sm font-semibold">Compartilhar</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {configured
              ? 'Copie o link e envie no WhatsApp, Instagram ou bio.'
              : 'Configure seu endereço para habilitar o compartilhamento.'}
          </p>
        </section>

        <section className="rounded-card border border-[var(--border-subtle)] p-4">
          <h2 className="text-sm font-semibold">QR Code</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            O QR Code será gerado automaticamente após configurar seu endereço.
          </p>
        </section>

        <section className="rounded-card border border-[var(--border-subtle)] p-4 space-y-4">
          <h2 className="text-sm font-semibold">Resultados</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard value={0} label="Visualizações · últimos 30 dias" />
            <MetricCard value={0} label="Agendamentos · últimos 30 dias" />
            <MetricCard value="—" label="Taxa de conversão" />
          </div>
          <ul className="divide-y divide-[var(--border-subtle)] border-t border-[var(--border-subtle)] text-sm">
            {[
              ['Hoje', '0 acessos · 0 agendamentos'],
              ['Últimos 7 dias', '0 acessos · 0 agendamentos'],
              ['Últimos 30 dias', '0 acessos · 0 agendamentos'],
            ].map(([label, value]) => (
              <li key={label} className="flex items-center justify-between py-3">
                <span className="text-[var(--text-secondary)]">{label}</span>
                <span className="text-[var(--text-muted)]">{value}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-card border border-[var(--border-subtle)] p-4">
          <h2 className="text-sm font-semibold">Origem dos acessos</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Ainda não há origens registradas. Assim que alguém acessar seu link, você verá aqui de
            onde veio cada visita.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
