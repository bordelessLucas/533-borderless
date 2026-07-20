'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

type Mode = 'login' | 'signup';

export default function LoginPageClient() {
  const { signIn, signUp, user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(next);
    }
  }, [isLoading, user, next, router]);

  if (!isLoading && user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-muted">
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
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível entrar. Tente novamente.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-8 text-center">
        <p className="font-display text-4xl font-extrabold tracking-tight text-ink">
          Sócio<span className="text-brand">247</span>
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Agenda cheia, recorrência e lembretes — sem complicação.
        </p>
      </div>

      <div className="mb-6 flex rounded-lg border border-paper-line bg-paper-raised p-1">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 rounded-md py-2 text-sm font-semibold ${
            mode === 'login' ? 'bg-ink text-paper-raised' : 'text-ink-soft'
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`flex-1 rounded-md py-2 text-sm font-semibold ${
            mode === 'signup' ? 'bg-ink text-paper-raised' : 'text-ink-soft'
          }`}
        >
          Criar conta
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 border-y border-paper-line py-6">
        {mode === 'signup' ? (
          <>
            <Field label="Seu nome" value={ownerName} onChange={setOwnerName} required />
            <Field
              label="Nome do negócio"
              value={businessName}
              onChange={setBusinessName}
              required
              placeholder="Ex.: Barbado Norte"
            />
          </>
        ) : null}

        <Field label="E-mail" type="email" value={email} onChange={setEmail} required />
        <Field
          label="Senha"
          type="password"
          value={password}
          onChange={setPassword}
          required
          minLength={6}
        />

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-brand py-3 text-sm font-semibold text-paper-raised transition hover:bg-brand-deep disabled:opacity-60"
        >
          {isSubmitting ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta e começar'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-ink-muted">
        No cadastro, criamos seu workspace com dados de exemplo para você explorar.
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  minLength,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink-soft">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
      />
    </label>
  );
}
