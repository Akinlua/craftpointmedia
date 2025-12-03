import { ENV, API_ENDPOINTS } from '@/lib/config/env';
import type {
  EmailCampaign,
  SmsCampaign,
  CampaignRecipient,
  CreateEmailCampaignData,
  CreateSmsCampaignData,
  CampaignType,
  CampaignStatus,
  RecipientStatus
} from '@/types/campaign';

// Transform database row to EmailCampaign type
const transformEmailCampaign = (row: any): EmailCampaign => ({
  id: row.id,
  orgId: row.orgId || row.org_id,
  name: row.name,
  subject: row.subject,
  content: row.content,
  fromName: row.fromName || row.from_name,
  fromEmail: row.fromEmail || row.from_email,
  status: row.status,
  scheduledAt: row.scheduledAt || row.scheduled_at,
  sentAt: row.sentAt || row.sent_at,
  targetType: row.targetType || row.target_type,
  targetFilter: row.targetFilter || row.target_filter,
  templateId: row.templateId || row.template_id,
  settings: row.settings,
  statistics: row.statistics || {
    sent: row.sent || 0,
    delivered: 0,
    opened: row.opened || 0,
    clicked: row.clicked || 0,
    bounced: row.bounced || 0,
    failed: 0,
    unsubscribed: row.unsubscribed || 0
  },
  createdBy: row.createdBy || row.created_by,
  createdAt: row.createdAt || row.created_at,
  updatedAt: row.updatedAt || row.updated_at,
});

// Transform database row to SmsCampaign type
const transformSmsCampaign = (row: any): SmsCampaign => ({
  id: row.id,
  orgId: row.orgId || row.org_id,
  name: row.name,
  message: row.message,
  senderId: row.senderId || row.sender_id,
  status: row.status,
  scheduledAt: row.scheduledAt || row.scheduled_at,
  sentAt: row.sentAt || row.sent_at,
  targetType: row.targetType || row.target_type,
  targetFilter: row.targetFilter || row.target_filter,
  settings: row.settings,
  statistics: row.statistics || {
    sent: row.sent || 0,
    delivered: 0,
    bounced: row.bounced || 0,
    failed: 0,
  },
  createdBy: row.createdBy || row.created_by,
  createdAt: row.createdAt || row.created_at,
  updatedAt: row.updatedAt || row.updated_at,
});

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('AUTH_TOKEN');

export const campaignsApi = {
  // Get all email campaigns
  async getEmailCampaigns(status?: CampaignStatus): Promise<EmailCampaign[]> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const queryParams = new URLSearchParams({ type: 'email' });
    if (status) queryParams.append('status', status);

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.CAMPAIGNS.BASE}?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch email campaigns');

    const result = await response.json();
    return (result.data?.campaigns || []).map(transformEmailCampaign);
  },

  // Get all SMS campaigns
  async getSmsCampaigns(status?: CampaignStatus): Promise<SmsCampaign[]> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const queryParams = new URLSearchParams({ type: 'sms' });
    if (status) queryParams.append('status', status);

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.CAMPAIGNS.BASE}?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch SMS campaigns');

    const result = await response.json();
    return (result.data?.campaigns || []).map(transformSmsCampaign);
  },

  // Get campaign by ID
  async getEmailCampaignById(id: string): Promise<EmailCampaign> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.CAMPAIGNS.BASE}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch campaign');

    const data = await response.json();
    return transformEmailCampaign(data.data || data);
  },

  async getSmsCampaignById(id: string): Promise<SmsCampaign> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.CAMPAIGNS.BASE}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch campaign');

    const data = await response.json();
    return transformSmsCampaign(data.data || data);
  },

  // Create email campaign
  async createEmailCampaign(campaignData: CreateEmailCampaignData): Promise<EmailCampaign> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.CAMPAIGNS.BASE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ...campaignData, type: 'email' })
    });

    if (!response.ok) throw new Error('Failed to create campaign');

    const data = await response.json();
    return transformEmailCampaign(data.data || data);
  },

  // Create SMS campaign
  async createSmsCampaign(campaignData: CreateSmsCampaignData): Promise<SmsCampaign> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.CAMPAIGNS.BASE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ...campaignData, type: 'sms' })
    });

    if (!response.ok) throw new Error('Failed to create campaign');

    const data = await response.json();
    return transformSmsCampaign(data.data || data);
  },

  // Update campaign
  async updateEmailCampaign(id: string, updates: Partial<CreateEmailCampaignData>): Promise<EmailCampaign> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.CAMPAIGNS.BASE}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) throw new Error('Failed to update campaign');

    const data = await response.json();
    return transformEmailCampaign(data.data || data);
  },

  // Delete campaign
  async deleteCampaign(id: string, type: CampaignType): Promise<void> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.CAMPAIGNS.BASE}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to delete campaign');
  },

  // Send campaign
  async sendCampaign(id: string, type: CampaignType): Promise<void> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.CAMPAIGNS.SEND.replace('{id}', id)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to send campaign');
  },

  // Schedule campaign
  async scheduleCampaign(id: string, type: CampaignType, scheduledAt: string): Promise<void> {
    // Backend docs don't show a specific schedule endpoint, but update works.
    // Or we can use PATCH /campaigns/:id with scheduledAt
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.CAMPAIGNS.BASE}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ scheduledAt, status: 'scheduled' })
    });

    if (!response.ok) throw new Error('Failed to schedule campaign');
  },

  // Pause campaign
  async pauseCampaign(id: string, type: CampaignType): Promise<void> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.CAMPAIGNS.PAUSE.replace('{id}', id)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to pause campaign');
  },

  // Get campaign recipients
  async getCampaignRecipients(campaignId: string): Promise<CampaignRecipient[]> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.CAMPAIGNS.RECIPIENTS.replace('{id}', campaignId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch recipients');

    const result = await response.json();
    return (result.data || []).map((row: any) => ({
      id: row.id,
      campaignId: row.campaignId || row.campaign_id,
      campaignType: row.campaignType || row.campaign_type as CampaignType,
      contactId: row.contactId || row.contact_id,
      status: row.status as RecipientStatus,
      sentAt: row.sentAt || row.sent_at,
      deliveredAt: row.deliveredAt || row.delivered_at,
      openedAt: row.openedAt || row.opened_at,
      clickedAt: row.clickedAt || row.clicked_at,
      bounceReason: row.bounceReason || row.bounce_reason,
      errorMessage: row.errorMessage || row.error_message,
      metadata: row.metadata || {},
      createdAt: row.createdAt || row.created_at,
    }));
  },

  // Duplicate campaign
  async duplicateCampaign(id: string, type: CampaignType): Promise<EmailCampaign | SmsCampaign> {
    if (type === 'email') {
      const original = await this.getEmailCampaignById(id);
      return this.createEmailCampaign({
        name: `${original.name} (Copy)`,
        subject: original.subject,
        content: original.content,
        fromName: original.fromName,
        fromEmail: original.fromEmail,
        targetType: original.targetType,
        targetFilter: original.targetFilter,
        templateId: original.templateId,
        settings: original.settings,
      });
    } else {
      const original = await this.getSmsCampaignById(id);
      return this.createSmsCampaign({
        name: `${original.name} (Copy)`,
        message: original.message,
        senderId: original.senderId,
        targetType: original.targetType,
        targetFilter: original.targetFilter,
      });
    }
  },
};
