import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { PageNotice } from '@/components/ui/patterns';

export default function DisponibilidadePage() {
  return (
    <AppShell activeHref="/disponibilidade">
      <PageNotice>
        Configure seu link em{' '}
        <Link href="/meu-link" className="font-semibold text-[var(--text-primary)] underline-offset-2 hover:underline">
          Meu link
        </Link>{' '}
        antes de definir sua agenda.
      </PageNotice>
    </AppShell>
  );
}
