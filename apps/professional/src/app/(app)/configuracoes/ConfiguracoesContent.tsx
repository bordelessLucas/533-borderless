'use client';

import { AppShell } from '@/components/AppShell';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { bookingLink as mockBookingLink, workspace as mockWorkspace } from '@/data/mock';

export function ConfiguracoesContent() {
  const { workspace, isLoading } = useWorkspace();
  const data = workspace ?? null;

  const name = data?.name ?? mockWorkspace.name;
  const address = data?.address ?? mockWorkspace.address;
  const phone = data?.phoneNumber ?? mockWorkspace.phoneNumber;
  const dailySummaryTime = data?.settings.dailySummaryTime ?? mockWorkspace.dailySummaryTime;
  const communicationMode = data?.settings.communicationMode ?? mockWorkspace.communicationMode;
  const slug = data?.slug ?? mockWorkspace.slug;
  const bookingLink = `https://socio247.app/b/${slug}`;

  if (isLoading && !data) {
    return (
      <AppShell activeHref="/configuracoes">
        <p className="text-ink-muted">Carregando configurações…</p>
      </AppShell>
    );
  }

  return (
    <AppShell activeHref="/configuracoes">
      <div className="space-y-10">
        <section>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">Configurações</h1>
          <p className="mt-2 max-w-xl text-ink-muted">
            Endereço na confirmação, modo de comunicação e link público de agendamento.
            {data ? (
              <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-ok">
                Firebase
              </span>
            ) : (
              <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-warn">
                Mock
              </span>
            )}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold">Local de atendimento</h2>
          <p className="text-sm text-ink-muted">
            Entra na mensagem de confirmação com dia e horário.
          </p>
          <div className="border-y border-paper-line py-4">
            <p className="font-semibold">{name}</p>
            {address ? (
              <>
                <p className="mt-1 text-ink-soft">
                  {address.street}, {address.number} — {address.neighborhood}
                </p>
                <p className="text-ink-soft">
                  {address.city}/{address.state} · CEP {address.postalCode}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-warn">Endereço não cadastrado — adicione em breve.</p>
            )}
            {phone ? <p className="mt-2 text-sm text-ink-muted">{phone}</p> : null}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold">Comunicação</h2>
          <div className="border-y border-paper-line py-4">
            <p className="font-semibold">
              Modo {communicationMode === 'assisted' ? 'assistido' : 'automático'} · resumo às{' '}
              {dailySummaryTime}
            </p>
            <p className="mt-1 max-w-2xl text-sm text-ink-muted">
              A Sócio247 monta o checklist diário com mensagens prontas. Você copia, cola no
              WhatsApp pessoal e confirma o que foi avisado.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold">Link de agendamento</h2>
          <div className="border-y border-paper-line py-4">
            <p className="break-all font-medium text-brand">{bookingLink || mockBookingLink}</p>
            <p className="mt-1 text-sm text-ink-muted">
              O cliente final usa o link — sem precisar baixar app nesta fase.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold">Assinatura</h2>
          <div className="border-y border-paper-line py-4">
            <p className="font-semibold">Plano Starter · R$ 49,90/mês</p>
            <p className="mt-1 text-sm text-ink-muted">
              Cobrança Sócio247 ↔ profissional (Asaas). Pagamento do cliente final permanece no
              local.
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ok">Ativa</p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
