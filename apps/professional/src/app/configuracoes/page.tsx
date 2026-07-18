import { AppShell } from '@/components/AppShell';
import { bookingLink, workspace } from '@/data/mock';

export default function ConfiguracoesPage() {
  const address = workspace.address;

  return (
    <AppShell activeHref="/configuracoes">
      <div className="space-y-10">
        <section>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">Configurações</h1>
          <p className="mt-2 max-w-xl text-ink-muted">
            Endereço na confirmação, modo de comunicação e link público de agendamento.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold">Local de atendimento</h2>
          <p className="text-sm text-ink-muted">
            Entra na mensagem de confirmação com dia e horário.
          </p>
          <div className="border-y border-paper-line py-4">
            <p className="font-semibold">{workspace.name}</p>
            <p className="mt-1 text-ink-soft">
              {address.street}, {address.number} — {address.neighborhood}
            </p>
            <p className="text-ink-soft">
              {address.city}/{address.state} · CEP {address.postalCode}
            </p>
            <p className="mt-2 text-sm text-ink-muted">{workspace.phoneNumber}</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold">Comunicação</h2>
          <div className="border-y border-paper-line py-4">
            <p className="font-semibold">
              Modo assistido · resumo às {workspace.dailySummaryTime}
            </p>
            <p className="mt-1 max-w-2xl text-sm text-ink-muted">
              A Sócio247 monta o checklist diário com mensagens prontas. Você copia, cola no
              WhatsApp pessoal e confirma o que foi avisado. Automação 100% via API fica para quem
              integrar depois.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold">Link de agendamento</h2>
          <div className="border-y border-paper-line py-4">
            <p className="break-all font-medium text-brand">{bookingLink}</p>
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
