import { Organization, OrganizationBranding, TeamMember, TeamInvite } from '@/types/org';
import { Integration, IntegrationConnection, WebhookEndpoint } from '@/types/integration';
import { BillingPlan, Subscription, PaymentMethod, Invoice, BillingUsage } from '@/types/billing';
import { NotificationPreferences } from '@/types/notification';
import { SecuritySettings, LoginSession, ApiKey, PasswordChangeRequest, TwoFactorSetup } from '@/types/security';
import { ENV, API_ENDPOINTS } from '@/lib/config/env';

// Mock data
const mockOrganization: Organization = {
  id: 'org-1',
  name: 'Acme Corporation',
  domain: 'acme.com',
  logo: '/api/placeholder/120/120',
  favicon: '/favicon.ico',
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  timezone: 'America/New_York',
  currency: 'USD',
  contactEmail: 'hello@acme.com',
  contactPhone: '+1 (555) 123-4567',
  address: '123 Business St, New York, NY 10001',
  website: 'https://acme.com',
  industry: 'Technology',
  employeeCount: '11-50',
  whiteLabel: {
    enabled: false,
    customDomain: '',
    hideBranding: false,
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

const mockTeamMembers: TeamMember[] = [
  {
    id: 'user-1',
    email: 'john@acme.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'owner',
    avatar: '/api/placeholder/40/40',
    status: 'active',
    lastLogin: '2024-01-15T09:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T09:30:00Z',
  },
  {
    id: 'user-2',
    email: 'sarah@acme.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'manager',
    avatar: '/api/placeholder/40/40',
    status: 'active',
    lastLogin: '2024-01-15T08:15:00Z',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-15T08:15:00Z',
  },
  {
    id: 'user-3',
    email: 'mike@acme.com',
    firstName: 'Mike',
    lastName: 'Chen',
    role: 'staff',
    avatar: '/api/placeholder/40/40',
    status: 'active',
    lastLogin: '2024-01-14T16:45:00Z',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-14T16:45:00Z',
  },
];

const mockIntegrations: Integration[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    type: 'email',
    provider: 'Google',
    description: 'Sync your Gmail account to manage emails directly in your CRM',
    icon: 'Mail',
    status: 'connected',
    lastSync: '2024-01-15T09:00:00Z',
    features: ['Email sync', 'Send emails', 'Email templates'],
    setupUrl: 'https://accounts.google.com/oauth',
    documentationUrl: 'https://docs.google.com/gmail-api',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    type: 'calendar',
    provider: 'Google',
    description: 'Sync your calendar and schedule meetings',
    icon: 'Calendar',
    status: 'connected',
    lastSync: '2024-01-15T08:30:00Z',
    features: ['Calendar sync', 'Meeting scheduling', 'Reminders'],
    setupUrl: 'https://accounts.google.com/oauth',
    documentationUrl: 'https://developers.google.com/calendar',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T08:30:00Z',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    type: 'payment',
    provider: 'Stripe',
    description: 'Process payments and manage subscriptions',
    icon: 'CreditCard',
    status: 'disconnected',
    features: ['Payment processing', 'Subscription management', 'Invoices'],
    setupUrl: 'https://dashboard.stripe.com/connect',
    documentationUrl: 'https://stripe.com/docs',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'twilio',
    name: 'Twilio SMS',
    type: 'sms',
    provider: 'Twilio',
    description: 'Send SMS messages to your contacts',
    icon: 'Smartphone',
    status: 'error',
    lastSync: '2024-01-14T12:00:00Z',
    features: ['SMS messaging', 'Bulk SMS', 'SMS templates'],
    setupUrl: 'https://console.twilio.com',
    documentationUrl: 'https://www.twilio.com/docs',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-14T12:00:00Z',
  },
];

const mockBillingPlans: BillingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small businesses getting started',
    price: 29,
    currency: 'USD',
    interval: 'month',
    features: [
      'Up to 1,000 contacts',
      'Basic CRM features',
      'Email support',
      '1GB storage',
    ],
    limits: {
      contacts: 1000,
      deals: 'unlimited',
      users: 3,
      storage: '1GB',
      apiCalls: 1000,
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Advanced features for growing teams',
    price: 79,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited contacts',
      'Advanced automation',
      'Priority support',
      '10GB storage',
      'Advanced reports',
    ],
    limits: {
      contacts: 'unlimited',
      deals: 'unlimited',
      users: 10,
      storage: '10GB',
      apiCalls: 10000,
    },
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Full-featured solution for large organizations',
    price: 199,
    currency: 'USD',
    interval: 'month',
    features: [
      'Everything in Professional',
      'Custom integrations',
      'Dedicated support',
      'Unlimited storage',
      'White-label options',
    ],
    limits: {
      contacts: 'unlimited',
      deals: 'unlimited',
      users: 'unlimited',
      storage: 'unlimited',
      apiCalls: 'unlimited',
    },
  },
];

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('AUTH_TOKEN');

// API functions
export const settingsApi = {
  // Organization
  async getOrganization(): Promise<Organization> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.SETTINGS.ORGANIZATION}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch organization');

    const org = await response.json();

    // Map database fields to Organization type
    return {
      id: org.id,
      name: org.name,
      domain: org.domain || undefined,
      logo: org.logo,
      favicon: org.favicon,
      primaryColor: org.primaryColor || '#3B82F6',
      secondaryColor: org.secondaryColor || '#10B981',
      timezone: org.timezone || 'America/New_York',
      currency: org.currency || 'USD',
      contactEmail: org.contactEmail || org.name + '@example.com',
      contactPhone: org.contactPhone,
      address: org.address,
      website: org.website,
      industry: org.industry || undefined,
      employeeCount: org.employeeCount,
      whiteLabel: org.whiteLabel || {
        enabled: false,
        hideBranding: false,
      },
      createdAt: org.createdAt || org.created_at,
      updatedAt: org.updatedAt || org.updated_at,
    };
  },

  async updateOrganization(updates: Partial<Organization>): Promise<Organization> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.SETTINGS.ORGANIZATION}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) throw new Error('Failed to update organization');

    const org = await response.json();
    return {
      id: org.id,
      name: org.name,
      domain: org.domain || undefined,
      logo: org.logo,
      favicon: org.favicon,
      primaryColor: org.primaryColor || '#3B82F6',
      secondaryColor: org.secondaryColor || '#10B981',
      timezone: org.timezone || 'America/New_York',
      currency: org.currency || 'USD',
      contactEmail: org.contactEmail || org.name + '@example.com',
      contactPhone: org.contactPhone,
      address: org.address,
      website: org.website,
      industry: org.industry || undefined,
      employeeCount: org.employeeCount,
      whiteLabel: org.whiteLabel || {
        enabled: false,
        hideBranding: false,
      },
      createdAt: org.createdAt || org.created_at,
      updatedAt: org.updatedAt || org.updated_at,
    };
  },

  async updateBranding(branding: Partial<OrganizationBranding>): Promise<Organization> {
    // Reusing updateOrganization since branding is part of organization settings in backend
    return this.updateOrganization(branding as Partial<Organization>);
  },

  // Team
  async getTeamMembers(): Promise<TeamMember[]> {
    // This is handled in team.ts, but kept here for compatibility if needed.
    // Ideally should delegate to teamApi or use the same endpoint.
    // For now, we'll use mock or delegate if we imported teamApi.
    // Let's use mock for now to avoid circular deps or just return empty if not used.
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTeamMembers;
  },

  async inviteTeamMember(invite: TeamInvite): Promise<TeamMember> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newMember: TeamMember = {
      id: `user-${Date.now()}`,
      email: invite.email,
      firstName: invite.email.split('@')[0],
      lastName: 'User',
      role: invite.role,
      status: 'pending',
      invitedAt: new Date().toISOString(),
      invitedBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newMember;
  },

  async updateTeamMemberRole(userId: string, role: TeamMember['role']): Promise<TeamMember> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const member = mockTeamMembers.find(m => m.id === userId);
    if (!member) throw new Error('Member not found');
    return { ...member, role, updatedAt: new Date().toISOString() };
  },

  async deactivateTeamMember(userId: string): Promise<TeamMember> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const member = mockTeamMembers.find(m => m.id === userId);
    if (!member) throw new Error('Member not found');
    return { ...member, status: 'inactive', updatedAt: new Date().toISOString() };
  },

  // Integrations
  async getIntegrations(): Promise<Integration[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockIntegrations;
  },

  async connectIntegration(integrationId: string, credentials: any): Promise<Integration> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const integration = mockIntegrations.find(i => i.id === integrationId);
    if (!integration) throw new Error('Integration not found');
    return {
      ...integration,
      status: 'connected',
      lastSync: new Date().toISOString(),
      credentials,
      updatedAt: new Date().toISOString(),
    };
  },

  async disconnectIntegration(integrationId: string): Promise<Integration> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const integration = mockIntegrations.find(i => i.id === integrationId);
    if (!integration) throw new Error('Integration not found');
    return {
      ...integration,
      status: 'disconnected',
      lastSync: undefined,
      credentials: undefined,
      updatedAt: new Date().toISOString(),
    };
  },

  // Notifications
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    // Using profile endpoint to get preferences as per docs
    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.SETTINGS.PROFILE}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch profile for preferences');

    const profile = await response.json();
    const prefs = profile.preferences || {};

    // Default structure if missing
    return {
      id: profile.id, // Using user ID as pref ID for now
      userId: profile.id,
      email: prefs.email || {
        enabled: true,
        newLeads: true,
        dealUpdates: true,
        taskReminders: true,
        meetingReminders: true,
        invoiceUpdates: true,
        teamUpdates: true,
        weeklyDigest: true,
      },
      sms: prefs.sms || {
        enabled: false,
        urgentOnly: true,
        taskReminders: false,
        meetingReminders: false,
      },
      inApp: prefs.inApp || {
        enabled: true,
        newLeads: true,
        dealUpdates: true,
        taskReminders: true,
        meetingReminders: true,
        invoiceUpdates: true,
        teamUpdates: true,
      },
      updatedAt: profile.updatedAt || new Date().toISOString(),
    };
  },

  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    // We need to merge with existing preferences first or send partial update if backend supports deep merge
    // Assuming we send the whole preferences object under 'preferences' key to update profile

    // First fetch current to merge
    const current = await this.getNotificationPreferences();

    const newPrefs = {
      email: { ...current.email, ...preferences.email },
      sms: { ...current.sms, ...preferences.sms },
      inApp: { ...current.inApp, ...preferences.inApp },
    };

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.SETTINGS.PROFILE}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ preferences: newPrefs })
    });

    if (!response.ok) throw new Error('Failed to update notification preferences');

    return this.getNotificationPreferences();
  },

  // Billing
  async getBillingPlans(): Promise<BillingPlan[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockBillingPlans;
  },

  async getCurrentSubscription(): Promise<Subscription> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: 'sub-1',
      planId: 'professional',
      plan: mockBillingPlans.find(p => p.id === 'professional')!,
      status: 'active',
      currentPeriodStart: '2024-01-01T00:00:00Z',
      currentPeriodEnd: '2024-02-01T00:00:00Z',
      cancelAtPeriodEnd: false,
      usage: {
        contacts: 2500,
        deals: 150,
        users: 5,
        storage: 2.5,
        apiCalls: 4500,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    };
  },

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: 'pm-1',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          expMonth: 12,
          expYear: 2025,
        },
        isDefault: true,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];
  },

  async getInvoices(): Promise<Invoice[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: 'inv-1',
        number: 'INV-2024-001',
        status: 'paid',
        amount: 79,
        currency: 'USD',
        description: 'Professional Plan - January 2024',
        dueDate: '2024-01-01T00:00:00Z',
        paidAt: '2024-01-01T00:00:00Z',
        downloadUrl: '/api/invoices/inv-1/download',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'inv-2',
        number: 'INV-2024-002',
        status: 'paid',
        amount: 79,
        currency: 'USD',
        description: 'Professional Plan - December 2023',
        dueDate: '2023-12-01T00:00:00Z',
        paidAt: '2023-12-01T00:00:00Z',
        downloadUrl: '/api/invoices/inv-2/download',
        createdAt: '2023-12-01T00:00:00Z',
      },
    ];
  },

  // Security
  async getSecuritySettings(): Promise<SecuritySettings> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: 'sec-1',
      userId: 'user-1',
      twoFactorEnabled: false,
      passwordLastChanged: '2024-01-01T00:00:00Z',
      loginSessions: [
        {
          id: 'sess-1',
          deviceInfo: 'Chrome on macOS',
          ipAddress: '192.168.1.1',
          location: 'New York, NY',
          userAgent: 'Mozilla/5.0...',
          current: true,
          lastActivity: '2024-01-15T10:00:00Z',
          createdAt: '2024-01-15T08:00:00Z',
        },
        {
          id: 'sess-2',
          deviceInfo: 'Safari on iPhone',
          ipAddress: '192.168.1.2',
          location: 'New York, NY',
          userAgent: 'Mozilla/5.0...',
          current: false,
          lastActivity: '2024-01-14T18:00:00Z',
          createdAt: '2024-01-14T17:00:00Z',
        },
      ],
      apiKeys: [
        {
          id: 'key-1',
          name: 'Production API',
          key: 'sk_****_****_****_1234',
          permissions: ['read', 'write'],
          lastUsed: '2024-01-14T12:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ],
      updatedAt: '2024-01-15T00:00:00Z',
    };
  },

  async changePassword(request: PasswordChangeRequest): Promise<void> {
    if (request.newPassword !== request.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.SETTINGS.PASSWORD}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) throw new Error('Failed to change password');
  },

  async setup2FA(): Promise<TwoFactorSetup> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      secret: 'JBSWY3DPEHPK3PXP',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      backupCodes: ['12345678', '87654321', '11111111', '22222222', '33333333'],
    };
  },

  async enable2FA(token: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (token !== '123456') {
      throw new Error('Invalid verification code');
    }
    // 2FA enabled successfully
  },

  async disable2FA(password: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (password !== 'password123') {
      throw new Error('Invalid password');
    }
    // 2FA disabled successfully
  },

  async createApiKey(name: string, permissions: string[]): Promise<ApiKey> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: `key-${Date.now()}`,
      name,
      key: `sk_test_${Math.random().toString(36).substr(2, 24)}`,
      permissions,
      createdAt: new Date().toISOString(),
    };
  },

  async revokeApiKey(keyId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // API key revoked successfully
  },

  async revokeLoginSession(sessionId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Session revoked successfully
  },
};