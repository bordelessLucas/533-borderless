import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { db } from '../admin.js';
import { ASAAS_WEBHOOK_TOKEN } from '../config.js';

/**
 * Recebe webhooks do Asaas (status de assinatura/cobrança do profissional).
 * Persiste o evento para idempotência e delega o processamento.
 *
 * TODO (fase Billing): mapear eventos PAYMENT_* / SUBSCRIPTION_* para
 * subscriptions/{workspaceId} e disparar push de atraso/pendente.
 */
export const asaasWebhook = onRequest(
  { secrets: [ASAAS_WEBHOOK_TOKEN], region: 'southamerica-east1' },
  async (req, res) => {
    const token = req.header('asaas-access-token');
    if (token !== ASAAS_WEBHOOK_TOKEN.value()) {
      logger.warn('Webhook Asaas rejeitado: token inválido');
      res.status(401).send('unauthorized');
      return;
    }

    const event = req.body as { id?: string; event?: string };
    if (!event?.id || !event?.event) {
      res.status(400).send('bad request');
      return;
    }

    // Idempotência: grava o evento cru antes de processar.
    await db
      .collection('webhookEvents')
      .doc(event.id)
      .set(
        {
          id: event.id,
          provider: 'asaas',
          event: event.event,
          payload: req.body,
          status: 'received',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

    logger.info('Webhook Asaas recebido', { event: event.event, id: event.id });
    res.status(200).send('ok');
  },
);
