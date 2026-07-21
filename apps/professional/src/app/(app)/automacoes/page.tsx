import { Bolt } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { EmptyState } from '@/components/ui/patterns';

export default function AutomacoesPage() {
  return (
    <AppShell activeHref="/automacoes">
      <EmptyState
        icon={Bolt}
        title="Automações em breve"
        description="Lembretes, confirmações e retornos serão configurados aqui sem sair do painel."
        className="py-16"
      />
    </AppShell>
  );
}
