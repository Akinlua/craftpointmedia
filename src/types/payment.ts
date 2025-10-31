export type PaymentProvider = 'stripe' | 'paypal';

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';

export interface PaymentProviderConfig {
  provider: PaymentProvider;
  connected: boolean;
  accountId?: string;
  lastConnected?: string;
}

export interface CheckoutSession {
  id: string;
  invoiceId: string;
  provider: PaymentProvider;
  checkoutUrl: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  createdAt: string;
  expiresAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider?: PaymentProvider;
  providerPaymentId?: string;
  paymentMethod: string;
  paidAt?: string;
  failedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface CreateCheckoutSessionData {
  invoiceId: string;
  provider: PaymentProvider;
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentWebhookData {
  provider: PaymentProvider;
  eventType: string;
  paymentId: string;
  status: PaymentStatus;
  metadata?: Record<string, any>;
}