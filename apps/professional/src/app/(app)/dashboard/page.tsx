import { redirect } from 'next/navigation';

/** Compat: /dashboard passa a ser Operação. */
export default function DashboardRedirectPage() {
  redirect('/operacao');
}
