import { Organization, OrganizationBranding, TeamMember, TeamInvite } from '@/types/org';
import { Integration, IntegrationConnection, WebhookEndpoint } from '@/types/integration';
import { BillingPlan, Subscription, PaymentMethod, Invoice, BillingUsage } from '@/types/billing';
import { NotificationPreferences } from '@/types/notification';
import { SecuritySettings, LoginSession, ApiKey, PasswordChangeRequest, TwoFactorSetup } from '@/types/security';
import { supabase } from '@/integrations/supabase/client';

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

// API functions
export const settingsApi = {
  // Organization
  async getOrganization(): Promise<Organization> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', session.session.user.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { data: org, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.org_id)
      .single();

    if (error) throw error;
    
    // Map database fields to Organization type
    return {
      id: org.id,
      name: org.name,
      domain: org.domain || undefined,
      logo: undefined,
      favicon: undefined,
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      timezone: 'America/New_York',
      currency: 'USD',
      contactEmail: org.name + '@example.com',
      contactPhone: undefined,
      address: undefined,
      website: undefined,
      industry: org.industry || undefined,
      employeeCount: undefined,
      whiteLabel: {
        enabled: false,
        hideBranding: false,
      },
      createdAt: org.created_at,
      updatedAt: org.updated_at,
    };
  },

  async updateOrganization(updates: Partial<Organization>): Promise<Organization> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', session.session.user.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { data: org, error } = await supabase
      .from('organizations')
      .update({
        name: updates.name,
        domain: updates.domain,
        industry: updates.industry,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.org_id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: org.id,
      name: org.name,
      domain: org.domain || undefined,
      logo: updates.logo,
      favicon: updates.favicon,
      primaryColor: updates.primaryColor || '#3B82F6',
      secondaryColor: updates.secondaryColor || '#10B981',
      timezone: updates.timezone || 'America/New_York',
      currency: updates.currency || 'USD',
      contactEmail: updates.contactEmail || org.name + '@example.com',
      contactPhone: updates.contactPhone,
      address: updates.address,
      website: updates.website,
      industry: org.industry || undefined,
      employeeCount: updates.employeeCount,
      whiteLabel: {
        enabled: false,
        hideBranding: false,
      },
      createdAt: org.created_at,
      updatedAt: org.updated_at,
    };
  },

  async updateBranding(branding: Partial<OrganizationBranding>): Promise<Organization> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', session.session.user.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { data: org, error } = await supabase
      .from('organizations')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.org_id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: org.id,
      name: org.name,
      domain: org.domain || undefined,
      logo: branding.logo,
      favicon: branding.favicon,
      primaryColor: branding.primaryColor || '#3B82F6',
      secondaryColor: branding.secondaryColor || '#10B981',
      timezone: 'America/New_York',
      currency: 'USD',
      contactEmail: org.name + '@example.com',
      contactPhone: undefined,
      address: undefined,
      website: undefined,
      industry: org.industry || undefined,
      employeeCount: undefined,
      whiteLabel: branding.whiteLabel || {
        enabled: false,
        hideBranding: false,
      },
      createdAt: org.created_at,
      updatedAt: org.updated_at,
    };
  },

  // Team
  async getTeamMembers(): Promise<TeamMember[]> {
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
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('Not authenticated');

    const { data: prefs, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', session.session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // If no preferences exist, create default ones
    if (!prefs) {
      const { data: newPrefs, error: insertError } = await supabase
        .from('notification_preferences')
        .insert({ user_id: session.session.user.id })
        .select()
        .single();

      if (insertError) throw insertError;
      
      return {
        id: newPrefs.id,
        userId: newPrefs.user_id,
        email: {
          enabled: newPrefs.email_enabled,
          newLeads: newPrefs.email_new_leads,
          dealUpdates: newPrefs.email_deal_updates,
          taskReminders: newPrefs.email_task_reminders,
          meetingReminders: newPrefs.email_meeting_reminders,
          invoiceUpdates: newPrefs.email_invoice_updates,
          teamUpdates: newPrefs.email_team_updates,
          weeklyDigest: newPrefs.email_weekly_digest,
        },
        sms: {
          enabled: newPrefs.sms_enabled,
          urgentOnly: newPrefs.sms_urgent_only,
          taskReminders: newPrefs.sms_task_reminders,
          meetingReminders: newPrefs.sms_meeting_reminders,
        },
        inApp: {
          enabled: newPrefs.inapp_enabled,
          newLeads: newPrefs.inapp_new_leads,
          dealUpdates: newPrefs.inapp_deal_updates,
          taskReminders: newPrefs.inapp_task_reminders,
          meetingReminders: newPrefs.inapp_meeting_reminders,
          invoiceUpdates: newPrefs.inapp_invoice_updates,
          teamUpdates: newPrefs.inapp_team_updates,
        },
        updatedAt: newPrefs.updated_at,
      };
    }

    return {
      id: prefs.id,
      userId: prefs.user_id,
      email: {
        enabled: prefs.email_enabled,
        newLeads: prefs.email_new_leads,
        dealUpdates: prefs.email_deal_updates,
        taskReminders: prefs.email_task_reminders,
        meetingReminders: prefs.email_meeting_reminders,
        invoiceUpdates: prefs.email_invoice_updates,
        teamUpdates: prefs.email_team_updates,
        weeklyDigest: prefs.email_weekly_digest,
      },
      sms: {
        enabled: prefs.sms_enabled,
        urgentOnly: prefs.sms_urgent_only,
        taskReminders: prefs.sms_task_reminders,
        meetingReminders: prefs.sms_meeting_reminders,
      },
      inApp: {
        enabled: prefs.inapp_enabled,
        newLeads: prefs.inapp_new_leads,
        dealUpdates: prefs.inapp_deal_updates,
        taskReminders: prefs.inapp_task_reminders,
        meetingReminders: prefs.inapp_meeting_reminders,
        invoiceUpdates: prefs.inapp_invoice_updates,
        teamUpdates: prefs.inapp_team_updates,
      },
      updatedAt: prefs.updated_at,
    };
  },

  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('Not authenticated');

    const dbUpdate: any = {};
    
    if (preferences.email) {
      if (preferences.email.enabled !== undefined) dbUpdate.email_enabled = preferences.email.enabled;
      if (preferences.email.newLeads !== undefined) dbUpdate.email_new_leads = preferences.email.newLeads;
      if (preferences.email.dealUpdates !== undefined) dbUpdate.email_deal_updates = preferences.email.dealUpdates;
      if (preferences.email.taskReminders !== undefined) dbUpdate.email_task_reminders = preferences.email.taskReminders;
      if (preferences.email.meetingReminders !== undefined) dbUpdate.email_meeting_reminders = preferences.email.meetingReminders;
      if (preferences.email.invoiceUpdates !== undefined) dbUpdate.email_invoice_updates = preferences.email.invoiceUpdates;
      if (preferences.email.teamUpdates !== undefined) dbUpdate.email_team_updates = preferences.email.teamUpdates;
      if (preferences.email.weeklyDigest !== undefined) dbUpdate.email_weekly_digest = preferences.email.weeklyDigest;
    }
    
    if (preferences.sms) {
      if (preferences.sms.enabled !== undefined) dbUpdate.sms_enabled = preferences.sms.enabled;
      if (preferences.sms.urgentOnly !== undefined) dbUpdate.sms_urgent_only = preferences.sms.urgentOnly;
      if (preferences.sms.taskReminders !== undefined) dbUpdate.sms_task_reminders = preferences.sms.taskReminders;
      if (preferences.sms.meetingReminders !== undefined) dbUpdate.sms_meeting_reminders = preferences.sms.meetingReminders;
    }
    
    if (preferences.inApp) {
      if (preferences.inApp.enabled !== undefined) dbUpdate.inapp_enabled = preferences.inApp.enabled;
      if (preferences.inApp.newLeads !== undefined) dbUpdate.inapp_new_leads = preferences.inApp.newLeads;
      if (preferences.inApp.dealUpdates !== undefined) dbUpdate.inapp_deal_updates = preferences.inApp.dealUpdates;
      if (preferences.inApp.taskReminders !== undefined) dbUpdate.inapp_task_reminders = preferences.inApp.taskReminders;
      if (preferences.inApp.meetingReminders !== undefined) dbUpdate.inapp_meeting_reminders = preferences.inApp.meetingReminders;
      if (preferences.inApp.invoiceUpdates !== undefined) dbUpdate.inapp_invoice_updates = preferences.inApp.invoiceUpdates;
      if (preferences.inApp.teamUpdates !== undefined) dbUpdate.inapp_team_updates = preferences.inApp.teamUpdates;
    }

    const { error } = await supabase
      .from('notification_preferences')
      .update(dbUpdate)
      .eq('user_id', session.session.user.id);

    if (error) throw error;

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

    const { error } = await supabase.auth.updateUser({
      password: request.newPassword
    });

    if (error) throw error;
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