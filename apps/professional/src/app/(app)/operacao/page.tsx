'use client';

import { AlertTriangle, Sparkles, TrendingUp, Users } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { MetricCard } from '@/components/ui/patterns';
import { DailyChecklist } from '@/components/DailyChecklist';

const metrics = [
  { value: 0, label: 'Atendimentos' },
  { value: '0%', label: 'Ocupação' },
  { value: 0, label: 'Horários livres' },
  { value: 0, label: 'Solicitações pendentes' },
  { value: 0, label: 'Confirmados' },
  { value: 0, label: 'Cancelamentos' },
  { value: 0, label: 'Faltas' },
  { value: 0, label: 'Clientes aguardando retorno' },
] as const;

export default function OperacaoPage() {
  const todayLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <AppShell activeHref="/operacao">
      <div className="space-y-6">
        <p className="text-right text-xs capitalize text-[var(--text-muted)]">{todayLabel}</p>

        <section className="rounded-card border border-[var(--border-subtle)] bg-slate-50 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-7 items-center justify-center rounded-md bg-[var(--accent-subtle)] text-[var(--accent-default)]">
              <Sparkles className="size-3.5" strokeWidth={1.75} aria-hidden />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Sócio247™ Conselheiro
              </p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Ainda estamos conhecendo o ritmo da sua operação.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Empresa hoje</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} value={metric.value} label={metric.label} />
            ))}
          </div>
        </section>

        <DailyChecklist />

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Profissionais</h2>
          <div className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
            <Users className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <p>
              Nenhum profissional ativo. Cadastre profissionais em Equipe para ver indicadores
              individuais.
            </p>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-card border border-[var(--border-subtle)] px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="size-4 text-[var(--text-muted)]" strokeWidth={1.75} />
              Oportunidades
            </div>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Nenhuma oportunidade destacada agora.
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Este bloco reage ao profissional selecionado no cabeçalho.
            </p>
          </section>
          <section className="rounded-card border border-[var(--border-subtle)] px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="size-4 text-[var(--text-muted)]" strokeWidth={1.75} />
              Pontos de atenção
            </div>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Nenhum ponto de atenção no momento.
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Este bloco reage ao profissional selecionado no cabeçalho.
            </p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
