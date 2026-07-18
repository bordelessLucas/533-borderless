import { setGlobalOptions } from 'firebase-functions/v2';

// Região default: São Paulo (menor latência para o público-alvo brasileiro).
setGlobalOptions({ region: 'southamerica-east1', maxInstances: 10 });

export { asaasWebhook } from './billing/asaasWebhook.js';
export { generateDailySummaries } from './automation/dailySummary.js';
