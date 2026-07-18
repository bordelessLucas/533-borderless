import { defineSecret, defineString } from 'firebase-functions/params';

/** Chave de API do Asaas (billing). Configurada como secret no deploy. */
export const ASAAS_API_KEY = defineSecret('ASAAS_API_KEY');

/** Token de validação dos webhooks do Asaas. */
export const ASAAS_WEBHOOK_TOKEN = defineSecret('ASAAS_WEBHOOK_TOKEN');

/** Base URL do Asaas (sandbox por padrão; produção sobrescreve via env). */
export const ASAAS_BASE_URL = defineString('ASAAS_BASE_URL', {
  default: 'https://sandbox.asaas.com/api/v3',
});
