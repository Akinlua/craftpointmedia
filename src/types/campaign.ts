export type CampaignType = 'email' | 'sms';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
export type RecipientStatus = 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';

export interface CampaignSettings {
  trackOpens: boolean;
  trackClicks: boolean;
  replyTo?: string;
  unsubscribeLink: boolean;
}

export interface CampaignStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  unsubscribed: number;
}

export interface EmailCampaign {
  id: string;
  orgId: string;
  name: string;
  subject: string;
  content: string;
  fromName: string;
  fromEmail: string;
  status: CampaignStatus;
  scheduledAt?: string;
  sentAt?: string;
  targetType: 'all' | 'segment' | 'tags' | 'custom';
  targetFilter: Record<string, any>;
  templateId?: string;
  settings: CampaignSettings;
  statistics: CampaignStats;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SmsCampaign {
  id: string;
  orgId: string;
  name: string;
  message: string;
  senderId: string;
  status: CampaignStatus;
  scheduledAt?: string;
  sentAt?: string;
  targetType: 'all' | 'segment' | 'tags' | 'custom';
  targetFilter: Record<string, any>;
  settings: Record<string, any>;
  statistics: Omit<CampaignStats, 'opened' | 'clicked' | 'unsubscribed'>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignRecipient {
  id: string;
  campaignId: string;
  campaignType: CampaignType;
  contactId: string;
  status: RecipientStatus;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  bounceReason?: string;
  errorMessage?: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface EmailTemplate {
  id: string;
  orgId: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  category: 'campaign' | 'transactional' | 'followup';
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailCampaignData {
  name: string;
  subject: string;
  content: string;
  fromName: string;
  fromEmail: string;
  targetType: 'all' | 'segment' | 'tags' | 'custom';
  targetFilter?: Record<string, any>;
  templateId?: string;
  settings?: Partial<CampaignSettings>;
  scheduledAt?: string;
}

export interface CreateSmsCampaignData {
  name: string;
  message: string;
  senderId: string;
  targetType: 'all' | 'segment' | 'tags' | 'custom';
  targetFilter?: Record<string, any>;
  scheduledAt?: string;
}

export interface CreateTemplateData {
  name: string;
  subject: string;
  content: string;
  variables?: string[];
  category: 'campaign' | 'transactional' | 'followup';
}
