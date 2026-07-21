'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { EmptyState } from '@/components/ui/patterns';
import { cn } from '@/lib/utils';

const tabs = ['Pendentes', 'Hoje', 'Amanhã', 'Atrasadas', 'Enviadas'] as const;

export default function ComunicacaoPage() {
  const [active, setActive] = useState<(typeof tabs)[number]>('Pendentes');

  return (
    <AppShell activeHref="/comunicacao">
      <div className="space-y-5">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          Mensagens preparadas pelo Sócio247™
        </h1>

        <div className="inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActive(tab)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium',
                active === tab
                  ? 'bg-white text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-muted)]',
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <EmptyState
          icon={MessageSquare}
          title="Nenhuma mensagem por aqui"
          description="Assim que houver um evento (confirmação, lembrete, retorno...), o Sócio247™ preparará a mensagem e você verá aqui."
          className="items-center py-16 text-center"
        />
      </div>
    </AppShell>
  );
}
