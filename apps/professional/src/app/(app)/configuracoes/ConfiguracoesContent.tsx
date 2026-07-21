'use client';

import { AppShell } from '@/components/AppShell';
import {
  AppPage,
  AppPageContent,
  AppPageDescription,
  AppPageHeader,
  AppPageTitle,
} from '@/components/app-page';
import {
  AppSection,
  AppSectionContent,
  AppSectionDescription,
  AppSectionHeader,
  AppSectionTitle,
} from '@/components/app-section';
import { Badge } from '@/components/ui/badge';
import { Surface } from '@/components/ui/surface';
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
      <AppPage>
        <AppPageHeader>
          <div>
            <AppPageTitle>Configurações</AppPageTitle>
            <AppPageDescription>
              Endereço na confirmação, modo de comunicação e link público de agendamento.
            </AppPageDescription>
          </div>
          <Badge variant={data ? 'success' : 'warning'}>{data ? 'Firebase' : 'Mock'}</Badge>
        </AppPageHeader>

        <AppPageContent>
          <AppSection>
            <AppSectionHeader>
              <div>
                <AppSectionTitle>Local de atendimento</AppSectionTitle>
                <AppSectionDescription>
                  Entra na mensagem de confirmação com dia e horário.
                </AppSectionDescription>
              </div>
            </AppSectionHeader>
            <AppSectionContent>
              <Surface>
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
              </Surface>
            </AppSectionContent>
          </AppSection>

          <AppSection>
            <AppSectionHeader>
              <AppSectionTitle>Comunicação</AppSectionTitle>
            </AppSectionHeader>
            <AppSectionContent>
              <Surface>
                <p className="font-semibold">
                  Modo {communicationMode === 'assisted' ? 'assistido' : 'automático'} · resumo às{' '}
                  {dailySummaryTime}
                </p>
                <p className="mt-1 max-w-2xl text-sm text-ink-muted">
                  A Sócio247 monta o checklist diário com mensagens prontas. Você copia, cola no
                  WhatsApp pessoal e confirma o que foi avisado.
                </p>
              </Surface>
            </AppSectionContent>
          </AppSection>

          <AppSection>
            <AppSectionHeader>
              <AppSectionTitle>Link de agendamento</AppSectionTitle>
            </AppSectionHeader>
            <AppSectionContent>
              <Surface>
                <p className="break-all font-medium text-brand">{bookingLink || mockBookingLink}</p>
                <p className="mt-1 text-sm text-ink-muted">
                  O cliente final usa o link — sem precisar baixar app nesta fase.
                </p>
              </Surface>
            </AppSectionContent>
          </AppSection>

          <AppSection>
            <AppSectionHeader>
              <AppSectionTitle>Assinatura</AppSectionTitle>
            </AppSectionHeader>
            <AppSectionContent>
              <Surface>
                <p className="font-semibold">Plano Starter · R$ 49,90/mês</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Cobrança Sócio247 ↔ profissional (Asaas). Pagamento do cliente final permanece no
                  local.
                </p>
                <Badge variant="success" className="mt-3">
                  Ativa
                </Badge>
              </Surface>
            </AppSectionContent>
          </AppSection>
        </AppPageContent>
      </AppPage>
    </AppShell>
  );
}
