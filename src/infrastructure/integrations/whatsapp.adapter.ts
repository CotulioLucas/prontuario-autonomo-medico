/**
 * Adapter para envio de mensagens via WhatsApp.
 * Envia notificacoes em background - nao bloqueia o fluxo principal.
 * @see ADR 0005, docs/architecture/failure-modes.md, US-ARQ-07
 */

import { HttpClient, type HttpClientConfig } from './http-client.js';

export interface WhatsAppMessage {
  to: string;
  template?: string;
  body?: string;
  variables?: Record<string, string>;
}

export interface WhatsAppConfig extends Partial<HttpClientConfig> {
  apiKey: string;
  phoneNumberId: string;
}

export interface WhatsAppAdapter {
  send(message: WhatsAppMessage): Promise<void>;
  sendInBackground(message: WhatsAppMessage): void;
}

export function createWhatsAppAdapter(config: WhatsAppConfig): WhatsAppAdapter {
  const client = new HttpClient({
    baseUrl: config.baseUrl || 'https://graph.facebook.com/v18.0',
    timeoutMs: config.timeoutMs || 5000,
    maxRetries: config.maxRetries || 3,
    ...config,
  });

  return {
    async send(message: WhatsAppMessage): Promise<void> {
      await client.post(`/${config.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: message.to,
        type: message.template ? 'template' : 'text',
        template: message.template
          ? {
              name: message.template,
              language: { code: 'pt_BR' },
              components: message.variables
                ? [{ type: 'body', parameters: Object.entries(message.variables).map(([key, value]) => ({ type: 'text', text: value })) }]
                : undefined,
            }
          : undefined,
        text: message.body ? { preview_url: false, body: message.body } : undefined,
      }, {
        Authorization: `Bearer ${config.apiKey}`,
      });
    },

    sendInBackground(message: WhatsAppMessage): void {
      setImmediate(async () => {
        try {
          await this.send(message);
        } catch (error) {
          console.error('[WhatsAppAdapter] Failed to send message in background:', error);
        }
      });
    },
  };
}
