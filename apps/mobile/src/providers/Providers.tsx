import type { ReactNode } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { WorkspaceProvider } from '@/providers/WorkspaceProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <WorkspaceProvider>{children}</WorkspaceProvider>
    </AuthProvider>
  );
}
