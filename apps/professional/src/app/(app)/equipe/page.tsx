import { Users } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { EmptyState } from '@/components/ui/patterns';

export default function EquipePage() {
  return (
    <AppShell activeHref="/equipe">
      <EmptyState
        icon={Users}
        title="Nenhum profissional ativo"
        description="Cadastre um profissional em Equipe para visualizar a agenda e indicadores individuais."
        className="py-16"
      />
    </AppShell>
  );
}
