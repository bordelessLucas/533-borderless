import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';

/**
 * Job diário do modo assistido. Roda de hora em hora e, para cada workspace cujo
 * `settings.dailySummaryTime` bate com o horário local corrente, gera o resumo
 * diário (checklist de lembretes/confirmações) e dispara o push de aviso.
 *
 * Roda de hora em hora porque cada workspace tem seu próprio fuso e horário-alvo
 * (default 08:00 America/Sao_Paulo).
 *
 * TODO (fase Automation):
 *  - iterar workspaces ativos
 *  - montar dailySummaries/{YYYY-MM-DD} com itens copiáveis para WhatsApp
 *  - enviar push (FCM) para membros do workspace
 */
export const generateDailySummaries = onSchedule(
  { schedule: 'every 60 minutes', timeZone: 'America/Sao_Paulo', region: 'southamerica-east1' },
  async () => {
    logger.info('generateDailySummaries: placeholder — implementação na fase Automation');
  },
);
