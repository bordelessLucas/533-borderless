import { Suspense } from 'react';
import LoginPageClient from './LoginPageClient';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-ink-muted">
          Carregando…
        </div>
      }
    >
      <LoginPageClient />
    </Suspense>
  );
}
