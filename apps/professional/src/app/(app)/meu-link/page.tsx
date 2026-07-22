'use client';

import type { FormEvent } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MetricCard } from '@/components/ui/patterns';
import { normalizeSlugInput } from '@/features/meu-link/slug';
import { useMeuLink } from '@/features/meu-link/useMeuLink';

export default function MeuLinkPage() {
  const {
    canEdit,
    isWorkspaceLoading,
    workspaceError,
    configured,
    slugDraft,
    linkPrefix,
    previewLink,
    bookingLink,
    qrCodeUrl,
    hasChanges,
    isSaving,
    error,
    successMessage,
    copied,
    onSlugChange,
    saveSlug,
    copyLink,
    shareWhatsApp,
  } = useMeuLink();

  const slugReady = normalizeSlugInput(slugDraft).length >= 3;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await saveSlug();
    } catch {
      // erro já tratado no hook
    }
  }

  return (
    <AppShell activeHref="/meu-link">
      <div className="space-y-4">
        {isWorkspaceLoading ? (
          <p className="text-sm text-[var(--text-muted)]">Carregando…</p>
        ) : null}

        {workspaceError ? <Alert variant="danger">{workspaceError}</Alert> : null}

        <section className="rounded-card border border-[var(--border-subtle)] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Seu link oficial</h2>
            <Badge variant={configured ? 'success' : 'warning'}>
              {configured ? (
                'Configurado'
              ) : (
                <span className="inline-flex items-center gap-1">
                  <AlertCircle className="size-3" aria-hidden />
                  Não configurado
                </span>
              )}
            </Badge>
          </div>

          {configured && bookingLink ? (
            <div className="mb-4 space-y-2">
              <p className="break-all rounded-md border border-dashed border-[var(--border-subtle)] bg-slate-50 px-3 py-3 text-sm font-medium text-[var(--link)]">
                {bookingLink}
              </p>
              <a
                href={bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[var(--link)] hover:underline"
              >
                <ExternalLink className="size-3.5" aria-hidden />
                Abrir página de agendamento
              </a>
            </div>
          ) : (
            <div className="mb-4 rounded-md border border-dashed border-[var(--border-subtle)] bg-slate-50 px-3 py-4 text-sm text-[var(--text-muted)]">
              Defina um endereço curto abaixo. Seus clientes usarão esse link para agendar.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="booking-slug">Endereço do link</Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <span className="shrink-0 text-sm text-[var(--text-muted)]">{linkPrefix}</span>
                <Input
                  id="booking-slug"
                  name="slug"
                  value={slugDraft}
                  onChange={(event) => onSlugChange(event.target.value)}
                  placeholder="meu-salao"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={!canEdit || isSaving || isWorkspaceLoading}
                  aria-describedby="slug-help"
                />
              </div>
              <p id="slug-help" className="text-xs text-[var(--text-muted)]">
                Apenas letras minúsculas, números e hífen. Ex.: barbearia-centro
              </p>
            </div>

            {!isWorkspaceLoading && !canEdit ? (
              <Alert variant="warning">
                Não foi possível carregar seu negócio. Atualize a página e tente novamente.
              </Alert>
            ) : null}

            {previewLink && hasChanges ? (
              <p className="break-all text-sm text-[var(--text-secondary)]">
                Prévia: <span className="font-medium text-[var(--link)]">{previewLink}</span>
              </p>
            ) : null}

            {error ? <Alert variant="danger">{error}</Alert> : null}
            {successMessage ? <Alert variant="success">{successMessage}</Alert> : null}

            <Button
              type="submit"
              loading={isSaving}
              disabled={
                !canEdit || isWorkspaceLoading || !slugReady || (!hasChanges && configured)
              }
            >
              {configured ? 'Salvar alteração' : 'Salvar link'}
            </Button>
          </form>
        </section>

        <section className="rounded-card border border-[var(--border-subtle)] p-4">
          <h2 className="text-sm font-semibold">Compartilhar</h2>
          {configured && bookingLink ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => void copyLink()}>
                {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
                {copied ? 'Copiado' : 'Copiar link'}
              </Button>
              <Button type="button" variant="secondary" onClick={shareWhatsApp}>
                <MessageCircle aria-hidden />
                WhatsApp
              </Button>
            </div>
          ) : (
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Configure seu endereço para habilitar o compartilhamento.
            </p>
          )}
        </section>

        <section className="rounded-card border border-[var(--border-subtle)] p-4">
          <h2 className="text-sm font-semibold">QR Code</h2>
          {configured && bookingLink && qrCodeUrl ? (
            <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt={`QR Code do link ${bookingLink}`}
                width={160}
                height={160}
                className="rounded-md border border-[var(--border-subtle)] bg-white p-2"
              />
              <div className="space-y-2">
                <p className="text-sm text-[var(--text-secondary)]">
                  Imprima ou envie para clientes escanearem e agendarem.
                </p>
                <Button type="button" variant="secondary" asChild>
                  <a href={qrCodeUrl} download={`qr-${slugDraft || 'link'}.png`} target="_blank" rel="noopener noreferrer">
                    <Download aria-hidden />
                    Baixar QR Code
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              O QR Code será gerado automaticamente após configurar seu endereço.
            </p>
          )}
        </section>

        <section className="space-y-4 rounded-card border border-[var(--border-subtle)] p-4">
          <h2 className="text-sm font-semibold">Resultados</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard value={0} label="Visualizações · últimos 30 dias" />
            <MetricCard value={0} label="Agendamentos · últimos 30 dias" />
            <MetricCard value="—" label="Taxa de conversão" />
          </div>
          <ul className="divide-y divide-[var(--border-subtle)] border-t border-[var(--border-subtle)] text-sm">
            {[
              ['Hoje', '0 acessos · 0 agendamentos'],
              ['Últimos 7 dias', '0 acessos · 0 agendamentos'],
              ['Últimos 30 dias', '0 acessos · 0 agendamentos'],
            ].map(([label, value]) => (
              <li key={label} className="flex items-center justify-between py-3">
                <span className="text-[var(--text-secondary)]">{label}</span>
                <span className="text-[var(--text-muted)]">{value}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-card border border-[var(--border-subtle)] p-4">
          <h2 className="text-sm font-semibold">Origem dos acessos</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Ainda não há origens registradas. Assim que alguém acessar seu link, você verá aqui de
            onde veio cada visita.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
