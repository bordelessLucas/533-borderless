'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown, Copy, MessageCircle } from 'lucide-react';
import {
  dailyChecklist,
  kindLabel,
  type MockChecklistItem,
} from '@/data/mock';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Filter = 'pending' | 'done' | 'all';

function phoneToWa(phone: string): string {
  return phone.replace(/\D/g, '');
}

function extractTime(message: string): string | null {
  const match = message.match(/\b([01]?\d|2[0-3]):[0-5]\d\b/);
  return match?.[0] ?? null;
}

function kindBadgeVariant(
  kind: MockChecklistItem['kind'],
): 'default' | 'subtle' | 'warning' {
  if (kind === 'confirmation') return 'default';
  if (kind === 'recurrence_return') return 'warning';
  return 'subtle';
}

export function DailyChecklist() {
  const [items, setItems] = useState<MockChecklistItem[]>(dailyChecklist);
  const [filter, setFilter] = useState<Filter>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  const pending = items.filter((item) => !item.done).length;
  const done = items.length - pending;
  const progress = items.length === 0 ? 0 : Math.round((done / items.length) * 100);

  const visible = useMemo(() => {
    const filtered =
      filter === 'pending'
        ? items.filter((item) => !item.done)
        : filter === 'done'
          ? items.filter((item) => item.done)
          : items;
    return [...filtered].sort((a, b) => Number(a.done) - Number(b.done));
  }, [filter, items]);

  async function copyMessage(item: MockChecklistItem) {
    try {
      await navigator.clipboard.writeText(item.message);
      setCopiedId(item.id);
      setFlashId(item.id);
      window.setTimeout(() => setCopiedId(null), 1600);
      window.setTimeout(() => setFlashId(null), 2200);
    } catch {
      // ignore
    }
  }

  function openWhatsApp(item: MockChecklistItem) {
    const url = `https://wa.me/${phoneToWa(item.clientPhone)}?text=${encodeURIComponent(item.message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setFlashId(item.id);
    window.setTimeout(() => setFlashId(null), 2200);
  }

  function toggleDone(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
    );
  }

  return (
    <section className="space-y-3">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Avisos de hoje</h2>
            <p className="text-[11px] text-[var(--text-muted)]">
              {pending === 0 ? 'Tudo avisado' : `${pending} pendente${pending === 1 ? '' : 's'}`}
            </p>
          </div>
          <span className="shrink-0 tabular-nums text-xs font-medium text-[var(--text-secondary)]">
            {done}/{items.length}
          </span>
        </div>

        <div
          className="h-1 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso dos avisos"
        >
          <div
            className="h-full rounded-full bg-[var(--sidebar-active-bar)] transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex gap-1 rounded-lg bg-slate-50 p-1">
          {(
            [
              { id: 'pending', label: 'Pendentes', count: pending },
              { id: 'done', label: 'Feitos', count: done },
              { id: 'all', label: 'Todos', count: items.length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                'flex-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors',
                filter === tab.id
                  ? 'bg-white text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
              )}
            >
              {tab.label}
              <span className="ml-1 tabular-nums opacity-60">{tab.count}</span>
            </button>
          ))}
        </div>
      </header>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--border-subtle)] px-3 py-6 text-center text-xs text-[var(--text-muted)]">
          {filter === 'pending' ? 'Nada pendente agora.' : 'Nenhum item nesta lista.'}
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border-subtle)] overflow-hidden rounded-lg border border-[var(--border-subtle)]">
          {visible.map((item) => {
            const time = extractTime(item.message);
            const isExpanded = expandedId === item.id;
            const justCopied = copiedId === item.id;
            const justActed = flashId === item.id;

            return (
              <li
                key={item.id}
                className={cn(
                  'bg-white transition-colors',
                  item.done && 'bg-slate-50/80',
                  justActed && 'bg-[var(--sidebar-active-bg)]/35',
                )}
              >
                <div className="flex items-start gap-2.5 px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => toggleDone(item.id)}
                    aria-label={item.done ? 'Marcar como pendente' : 'Marcar como avisado'}
                    aria-pressed={item.done}
                    className={cn(
                      'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors',
                      item.done
                        ? 'border-[var(--success-default,#15803d)] bg-[var(--success-default,#15803d)] text-white'
                        : 'border-[var(--border-strong)] text-transparent hover:border-[var(--sidebar-active-bar)]',
                    )}
                  >
                    <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className={cn(
                            'truncate text-[13px] font-semibold leading-tight text-[var(--text-primary)]',
                            item.done && 'text-[var(--text-muted)] line-through decoration-slate-300',
                          )}
                        >
                          {item.clientName}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant={kindBadgeVariant(item.kind)}
                            className="px-1.5 py-0 text-[10px] font-medium uppercase tracking-wide"
                          >
                            {kindLabel(item.kind)}
                          </Badge>
                          {time ? (
                            <span className="text-[11px] font-medium tabular-nums text-[var(--text-secondary)]">
                              {time}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="size-8 shadow-none"
                          aria-label="Copiar mensagem"
                          onClick={() => void copyMessage(item)}
                        >
                          <Copy className="size-3.5" aria-hidden />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="subtle"
                          className="size-8"
                          aria-label="Abrir no WhatsApp"
                          onClick={() => openWhatsApp(item)}
                        >
                          <MessageCircle className="size-3.5" aria-hidden />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-1.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId((current) => (current === item.id ? null : item.id))
                        }
                        className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                      >
                        {isExpanded ? 'Ocultar' : 'Ver msg'}
                        <ChevronDown
                          className={cn(
                            'size-3 transition-transform',
                            isExpanded && 'rotate-180',
                          )}
                          aria-hidden
                        />
                      </button>
                      {justCopied ? (
                        <span className="text-[11px] font-medium text-[var(--success-default,#15803d)]">
                          Copiado
                        </span>
                      ) : null}
                    </div>

                    {isExpanded ? (
                      <p className="mt-2 rounded-md bg-slate-50 px-2.5 py-2 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                        {item.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-[10px] leading-snug text-[var(--text-muted)]">
        Toque em WhatsApp → envie → marque o ✓.
      </p>
    </section>
  );
}
