export interface Integration {
  id: string;
  name: string;
  type: 'calendar' | 'email' | 'sms' | 'payment' | 'accounting' | 'ecommerce' | 'automation';
  provider: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync?: string;
  settings?: Record<string, any>;
  credentials?: {
    apiKey?: string;
    secretKey?: string;
    token?: string;
    webhookUrl?: string;
  };
  features: string[];
  setupUrl?: string;
  documentationUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationConnection {
  integrationId: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  syncCount?: number;
  errorMessage?: string;
  settings: Record<string, any>;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  createdAt: string;
}