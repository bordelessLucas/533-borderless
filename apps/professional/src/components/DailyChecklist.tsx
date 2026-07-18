'use client';

import { useState } from 'react';
import {
  dailyChecklist,
  kindLabel,
  type MockChecklistItem,
} from '@/data/mock';

export function DailyChecklist() {
  const [items, setItems] = useState<MockChecklistItem[]>(dailyChecklist);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const pending = items.filter((item) => !item.done).length;
  const done = items.length - pending;

  async function copyMessage(item: MockChecklistItem) {
    try {
      await navigator.clipboard.writeText(item.message);
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // fallback silencioso no mock
    }
  }

  function toggleDone(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
            Resumo das 08:00
          </h2>
          <p className="mt-1 max-w-xl text-sm text-ink-muted">
            Modo assistido: copie, cole no WhatsApp e marque o que já avisou. Sem API, sem
            complicação.
          </p>
        </div>
        <p className="text-sm font-semibold text-ink-soft">
          {done}/{items.length} avisados · {pending} pendentes
        </p>
      </div>

      <ul className="divide-y divide-paper-line border-y border-paper-line">
        {items.map((item) => (
          <li key={item.id} className="py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-ink">{item.clientName}</span>
                  <span className="text-xs font-medium uppercase tracking-wide text-brand">
                    {kindLabel(item.kind)}
                  </span>
                  {item.done ? (
                    <span className="text-xs font-semibold text-ok">Avisado</span>
                  ) : (
                    <span className="text-xs font-semibold text-warn">Pendente</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-ink-muted">{item.clientPhone}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.message}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => copyMessage(item)}
                  className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-paper-raised transition hover:bg-brand-deep"
                >
                  {copiedId === item.id ? 'Copiado' : 'Copiar'}
                </button>
                <button
                  type="button"
                  onClick={() => toggleDone(item.id)}
                  className="rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm font-semibold text-ink-soft transition hover:border-ink/20"
                >
                  {item.done ? 'Desfazer' : 'Marcar'}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
