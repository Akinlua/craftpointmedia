export type CampaignType = 'email' | 'sms';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled';

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  templateId?: string;
  content: {
    subject?: string; // for email
    body: string;
    htmlBody?: string; // for email
  };
  audience: {
    segmentId?: string;
    filters?: any; // contact filters
    size: number;
  };
  schedule: {
    sendAt?: string; // ISO date string
    timezone: string;
  };
  stats: {
    sent: number;
    delivered: number;
    opened?: number; // email only
    clicked?: number; // email only
    bounced: number;
    unsubscribed: number;
  };
  ownerId: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignFilters {
  status?: CampaignStatus;
  type?: CampaignType;
  ownerId?: string;
  search?: string;
}

export interface CampaignMetrics {
  openRate?: number; // email only
  clickRate?: number; // email only
  deliveryRate: number;
  unsubscribeRate: number;
  bounceRate: number;
}