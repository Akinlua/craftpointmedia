import { PaymentProviderConfig, CheckoutSession, Payment, CreateCheckoutSessionData } from '@/types/payment';

// Mock data
const mockProviderConfigs: PaymentProviderConfig[] = [
  {
    provider: 'stripe',
    connected: true,
    accountId: 'acct_1234567890',
    lastConnected: '2024-01-10T15:30:00Z'
  },
  {
    provider: 'paypal',
    connected: false
  }
];

const mockCheckoutSessions: CheckoutSession[] = [];
const mockPayments: Payment[] = [];

export async function getPaymentProviders(): Promise<PaymentProviderConfig[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return mockProviderConfigs;
}

export async function createCheckoutSession(data: CreateCheckoutSessionData): Promise<CheckoutSession> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const session: CheckoutSession = {
    id: `cs_${Date.now()}`,
    invoiceId: data.invoiceId,
    provider: data.provider,
    checkoutUrl: `https://${data.provider}.com/checkout/session_${Date.now()}`,
    status: 'pending',
    amount: 0, // This would be fetched from the invoice
    currency: 'USD',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };
  
  mockCheckoutSessions.push(session);
  return session;
}

export async function getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return mockPayments.filter(payment => payment.invoiceId === invoiceId);
}

export async function createManualPayment(invoiceId: string, amount: number, method: string, reference?: string): Promise<Payment> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const payment: Payment = {
    id: `pay_${Date.now()}`,
    invoiceId,
    amount,
    currency: 'USD',
    status: 'succeeded',
    paymentMethod: method,
    paidAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: reference ? { reference } : undefined
  };
  
  mockPayments.push(payment);
  return payment;
}

export async function handlePaymentWebhook(provider: string, payload: any): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.log(`Received ${provider} webhook:`, payload);
  
  // In a real implementation, this would:
  // 1. Verify the webhook signature
  // 2. Parse the event data
  // 3. Update the payment and invoice status
  // 4. Send notifications if needed
}

export async function connectPaymentProvider(provider: string, config: any): Promise<PaymentProviderConfig> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const providerConfig = mockProviderConfigs.find(p => p.provider === provider);
  if (providerConfig) {
    providerConfig.connected = true;
    providerConfig.accountId = config.accountId;
    providerConfig.lastConnected = new Date().toISOString();
    return providerConfig;
  }
  
  throw new Error('Provider not found');
}

export async function disconnectPaymentProvider(provider: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const providerConfig = mockProviderConfigs.find(p => p.provider === provider);
  if (providerConfig) {
    providerConfig.connected = false;
    providerConfig.accountId = undefined;
    providerConfig.lastConnected = undefined;
  }
}