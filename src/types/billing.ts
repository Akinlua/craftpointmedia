export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    contacts: number | 'unlimited';
    deals: number | 'unlimited';
    users: number | 'unlimited';
    storage: string;
    apiCalls: number | 'unlimited';
  };
  popular?: boolean;
}

export interface Subscription {
  id: string;
  planId: string;
  plan: BillingPlan;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  usage: {
    contacts: number;
    deals: number;
    users: number;
    storage: number;
    apiCalls: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  bankAccount?: {
    accountType: string;
    last4: string;
    bankName: string;
  };
  isDefault: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  amount: number;
  currency: string;
  description: string;
  dueDate: string;
  paidAt?: string;
  downloadUrl?: string;
  createdAt: string;
}

export interface BillingUsage {
  period: {
    start: string;
    end: string;
  };
  contacts: {
    used: number;
    limit: number | 'unlimited';
  };
  deals: {
    used: number;
    limit: number | 'unlimited';
  };
  users: {
    used: number;
    limit: number | 'unlimited';
  };
  storage: {
    used: number; // in MB
    limit: number; // in MB
  };
  apiCalls: {
    used: number;
    limit: number | 'unlimited';
  };
}