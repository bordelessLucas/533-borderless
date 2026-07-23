'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function ClientRedirect({ href }: { href: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(href);
  }, [href, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-ink-muted">
      Redirecionando…
    </div>
  );
}
