import { supabase } from '@/integrations/supabase/client';
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
  orgId: row.org_id,
  name: row.name,
  subject: row.subject,
  content: row.content,
  fromName: row.from_name,
  fromEmail: row.from_email,
  status: row.status,
  scheduledAt: row.scheduled_at,
  sentAt: row.sent_at,
  targetType: row.target_type,
  targetFilter: row.target_filter,
  templateId: row.template_id,
  settings: row.settings,
  statistics: row.statistics,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Transform database row to SmsCampaign type
const transformSmsCampaign = (row: any): SmsCampaign => ({
  id: row.id,
  orgId: row.org_id,
  name: row.name,
  message: row.message,
  senderId: row.sender_id,
  status: row.status,
  scheduledAt: row.scheduled_at,
  sentAt: row.sent_at,
  targetType: row.target_type,
  targetFilter: row.target_filter,
  settings: row.settings,
  statistics: row.statistics,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const campaignsApi = {
  // Get all email campaigns
  async getEmailCampaigns(status?: CampaignStatus): Promise<EmailCampaign[]> {
    let query = supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.map(transformEmailCampaign);
  },

  // Get all SMS campaigns
  async getSmsCampaigns(status?: CampaignStatus): Promise<SmsCampaign[]> {
    let query = supabase
      .from('sms_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.map(transformSmsCampaign);
  },

  // Get campaign by ID
  async getEmailCampaignById(id: string): Promise<EmailCampaign> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return transformEmailCampaign(data);
  },

  async getSmsCampaignById(id: string): Promise<SmsCampaign> {
    const { data, error } = await supabase
      .from('sms_campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return transformSmsCampaign(data);
  },

  // Create email campaign
  async createEmailCampaign(campaignData: CreateEmailCampaignData): Promise<EmailCampaign> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { data, error } = await supabase
      .from('email_campaigns')
      .insert({
        org_id: profile.org_id,
        name: campaignData.name,
        subject: campaignData.subject,
        content: campaignData.content,
        from_name: campaignData.fromName,
        from_email: campaignData.fromEmail,
        target_type: campaignData.targetType,
        target_filter: campaignData.targetFilter || {},
        template_id: campaignData.templateId,
        settings: campaignData.settings || {},
        scheduled_at: campaignData.scheduledAt,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return transformEmailCampaign(data);
  },

  // Create SMS campaign
  async createSmsCampaign(campaignData: CreateSmsCampaignData): Promise<SmsCampaign> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { data, error } = await supabase
      .from('sms_campaigns')
      .insert({
        org_id: profile.org_id,
        name: campaignData.name,
        message: campaignData.message,
        sender_id: campaignData.senderId,
        target_type: campaignData.targetType,
        target_filter: campaignData.targetFilter || {},
        scheduled_at: campaignData.scheduledAt,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return transformSmsCampaign(data);
  },

  // Update campaign
  async updateEmailCampaign(id: string, updates: Partial<CreateEmailCampaignData>): Promise<EmailCampaign> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.subject !== undefined) updateData.subject = updates.subject;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.fromName !== undefined) updateData.from_name = updates.fromName;
    if (updates.fromEmail !== undefined) updateData.from_email = updates.fromEmail;
    if (updates.targetType !== undefined) updateData.target_type = updates.targetType;
    if (updates.targetFilter !== undefined) updateData.target_filter = updates.targetFilter;
    if (updates.settings !== undefined) updateData.settings = updates.settings;
    if (updates.scheduledAt !== undefined) updateData.scheduled_at = updates.scheduledAt;

    const { data, error } = await supabase
      .from('email_campaigns')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformEmailCampaign(data);
  },

  // Delete campaign
  async deleteCampaign(id: string, type: CampaignType): Promise<void> {
    const table = type === 'email' ? 'email_campaigns' : 'sms_campaigns';
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Send campaign (triggers edge function)
  async sendCampaign(id: string, type: CampaignType): Promise<void> {
    const functionName = type === 'email' ? 'send-email-campaign' : 'send-sms-campaign';
    
    const { error } = await supabase.functions.invoke(functionName, {
      body: { campaignId: id }
    });

    if (error) throw error;
  },

  // Schedule campaign
  async scheduleCampaign(id: string, type: CampaignType, scheduledAt: string): Promise<void> {
    const table = type === 'email' ? 'email_campaigns' : 'sms_campaigns';
    
    const { error } = await supabase
      .from(table)
      .update({ 
        scheduled_at: scheduledAt,
        status: 'scheduled'
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Pause campaign
  async pauseCampaign(id: string, type: CampaignType): Promise<void> {
    const table = type === 'email' ? 'email_campaigns' : 'sms_campaigns';
    
    const { error } = await supabase
      .from(table)
      .update({ status: 'paused' })
      .eq('id', id);

    if (error) throw error;
  },

  // Get campaign recipients
  async getCampaignRecipients(campaignId: string): Promise<CampaignRecipient[]> {
    const { data, error } = await supabase
      .from('campaign_recipients')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(row => ({
      id: row.id,
      campaignId: row.campaign_id,
      campaignType: row.campaign_type as CampaignType,
      contactId: row.contact_id,
      status: row.status as RecipientStatus,
      sentAt: row.sent_at,
      deliveredAt: row.delivered_at,
      openedAt: row.opened_at,
      clickedAt: row.clicked_at,
      bounceReason: row.bounce_reason,
      errorMessage: row.error_message,
      metadata: (row.metadata as Record<string, any>) || {},
      createdAt: row.created_at,
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
