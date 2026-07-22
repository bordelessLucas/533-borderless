'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import {
  AuthCard,
  AuthFooter,
  AuthHeader,
  AuthPage,
  OrDivider,
  PasswordField,
} from '@/features/auth/components';

type Mode = 'login' | 'signup';

function formatAuthError(err: unknown): string {
  if (!(err instanceof Error)) {
    return 'Não foi possível entrar. Tente novamente.';
  }

  const code =
    err && typeof err === 'object' && 'code' in err ? String((err as { code: string }).code) : '';
  const message = err.message;

  if (
    code === 'permission-denied' ||
    message.includes('insufficient permissions') ||
    message.includes('Sem permissão para criar o workspace')
  ) {
    return 'Falha ao criar seus dados no Firestore (permissão). Confirme o deploy das Security Rules e tente de novo.';
  }

  if (code === 'auth/email-already-in-use') {
    return 'Este e-mail já está cadastrado. Use Entrar ou outro e-mail.';
  }

  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found'
  ) {
    return 'E-mail ou senha inválidos.';
  }

  if (code === 'auth/weak-password') {
    return 'A senha precisa ter pelo menos 6 caracteres.';
  }

  return message || 'Não foi possível entrar. Tente novamente.';
}

export default function LoginPageClient() {
  const { signIn, signUp, user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/agenda';

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Só redireciona sessão já autenticada — nunca no meio/fim de um submit com erro.
    if (!isLoading && user && !isSubmitting && !error) {
      router.replace(next);
    }
  }, [isLoading, user, isSubmitting, error, next, router]);

  if (!isLoading && user && !isSubmitting && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--text-muted)]">
        Redirecionando…
      </div>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp({ email, password, businessName, ownerName });
      }
      router.replace(next);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPage>
      <AuthHeader
        title={mode === 'login' ? 'Entrar' : 'Criar conta'}
        description={
          mode === 'login'
            ? 'Acesse seu painel do Sócio247.'
            : 'Provisionamos seu workspace com dados de exemplo.'
        }
      />

      <AuthCard>
        <div className="flex rounded-input border border-[var(--border-subtle)] bg-surface p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-nav py-2 text-sm font-semibold transition ${
              mode === 'login'
                ? 'bg-[var(--text-primary)] text-[var(--text-inverse)]'
                : 'text-[var(--text-secondary)]'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-nav py-2 text-sm font-semibold transition ${
              mode === 'signup'
                ? 'bg-[var(--text-primary)] text-[var(--text-inverse)]'
                : 'text-[var(--text-secondary)]'
            }`}
          >
            Criar conta
          </button>
        </div>

        <OrDivider>continue com e-mail</OrDivider>

        <Stack as="form" gap="md" onSubmit={handleSubmit} aria-label="Formulário de autenticação">
          {mode === 'signup' ? (
            <>
              <Stack gap="xs">
                <Label htmlFor="owner-name">Seu nome</Label>
                <Input
                  id="owner-name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </Stack>
              <Stack gap="xs">
                <Label htmlFor="business-name">Nome do negócio</Label>
                <Input
                  id="business-name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  placeholder="Ex.: Barbado Norte"
                  disabled={isSubmitting}
                />
              </Stack>
            </>
          ) : null}

          <Stack gap="xs">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </Stack>

          <Stack gap="xs">
            <Label htmlFor="password">Senha</Label>
            <PasswordField
              id="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isSubmitting}
            />
          </Stack>

          {error ? <Alert variant="danger" description={error} /> : null}

          <Button type="submit" loading={isSubmitting} className="w-full">
            {isSubmitting
              ? 'Aguarde…'
              : mode === 'login'
                ? 'Entrar'
                : 'Criar conta e começar'}
          </Button>
        </Stack>
      </AuthCard>

      <Text role="caption" intent="muted" className="max-w-md text-center">
        No cadastro, criamos seu workspace com dados de exemplo para você explorar.
      </Text>

      <AuthFooter />
    </AuthPage>
  );
}
