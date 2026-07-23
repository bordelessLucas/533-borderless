import { ClientRedirect } from '@/components/ClientRedirect';

/** Compat: /dashboard passa a ser Operação. */
export default function DashboardRedirectPage() {
  return <ClientRedirect href="/operacao" />;
}
