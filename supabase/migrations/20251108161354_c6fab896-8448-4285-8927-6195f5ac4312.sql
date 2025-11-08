-- Create email campaigns table
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  target_type TEXT NOT NULL DEFAULT 'all',
  target_filter JSONB DEFAULT '{}'::jsonb,
  template_id UUID,
  settings JSONB DEFAULT '{"trackOpens": true, "trackClicks": true, "unsubscribeLink": true}'::jsonb,
  statistics JSONB DEFAULT '{"sent": 0, "delivered": 0, "opened": 0, "clicked": 0, "bounced": 0, "failed": 0, "unsubscribed": 0}'::jsonb,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create SMS campaigns table
CREATE TABLE public.sms_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  target_type TEXT NOT NULL DEFAULT 'all',
  target_filter JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  statistics JSONB DEFAULT '{"sent": 0, "delivered": 0, "failed": 0}'::jsonb,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign recipients table
CREATE TABLE public.campaign_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL,
  campaign_type TEXT NOT NULL,
  contact_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounce_reason TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'campaign',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflows table
CREATE TABLE public.workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB DEFAULT '{}'::jsonb,
  actions JSONB[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT false,
  statistics JSONB DEFAULT '{"totalExecutions": 0, "successfulExecutions": 0, "failedExecutions": 0}'::jsonb,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow executions table
CREATE TABLE public.workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL,
  trigger_data JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  actions_log JSONB[] DEFAULT '{}',
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead scoring rules table
CREATE TABLE public.lead_scoring_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_config JSONB DEFAULT '{}'::jsonb,
  points INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_scoring_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_campaigns
CREATE POLICY "Users can view campaigns in their org"
  ON public.email_campaigns FOR SELECT
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can create campaigns in their org"
  ON public.email_campaigns FOR INSERT
  WITH CHECK (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can update campaigns in their org"
  ON public.email_campaigns FOR UPDATE
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Owners and managers can delete campaigns"
  ON public.email_campaigns FOR DELETE
  USING (org_id = get_user_org_id(auth.uid()) AND (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'manager')));

-- RLS Policies for sms_campaigns
CREATE POLICY "Users can view SMS campaigns in their org"
  ON public.sms_campaigns FOR SELECT
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can create SMS campaigns in their org"
  ON public.sms_campaigns FOR INSERT
  WITH CHECK (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can update SMS campaigns in their org"
  ON public.sms_campaigns FOR UPDATE
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Owners and managers can delete SMS campaigns"
  ON public.sms_campaigns FOR DELETE
  USING (org_id = get_user_org_id(auth.uid()) AND (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'manager')));

-- RLS Policies for campaign_recipients
CREATE POLICY "Users can view recipients for campaigns in their org"
  ON public.campaign_recipients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.email_campaigns 
      WHERE id = campaign_recipients.campaign_id 
      AND org_id = get_user_org_id(auth.uid())
    ) OR EXISTS (
      SELECT 1 FROM public.sms_campaigns 
      WHERE id = campaign_recipients.campaign_id 
      AND org_id = get_user_org_id(auth.uid())
    )
  );

CREATE POLICY "System can manage campaign recipients"
  ON public.campaign_recipients FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for email_templates
CREATE POLICY "Users can view templates in their org"
  ON public.email_templates FOR SELECT
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can create templates in their org"
  ON public.email_templates FOR INSERT
  WITH CHECK (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can update templates in their org"
  ON public.email_templates FOR UPDATE
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Owners and managers can delete templates"
  ON public.email_templates FOR DELETE
  USING (org_id = get_user_org_id(auth.uid()) AND (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'manager')));

-- RLS Policies for workflows
CREATE POLICY "Users can view workflows in their org"
  ON public.workflows FOR SELECT
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can create workflows in their org"
  ON public.workflows FOR INSERT
  WITH CHECK (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can update workflows in their org"
  ON public.workflows FOR UPDATE
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Owners and managers can delete workflows"
  ON public.workflows FOR DELETE
  USING (org_id = get_user_org_id(auth.uid()) AND (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'manager')));

-- RLS Policies for workflow_executions
CREATE POLICY "Users can view workflow executions in their org"
  ON public.workflow_executions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workflows 
      WHERE id = workflow_executions.workflow_id 
      AND org_id = get_user_org_id(auth.uid())
    )
  );

CREATE POLICY "System can manage workflow executions"
  ON public.workflow_executions FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for lead_scoring_rules
CREATE POLICY "Users can view scoring rules in their org"
  ON public.lead_scoring_rules FOR SELECT
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Owners and managers can create scoring rules"
  ON public.lead_scoring_rules FOR INSERT
  WITH CHECK (org_id = get_user_org_id(auth.uid()) AND (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'manager')));

CREATE POLICY "Owners and managers can update scoring rules"
  ON public.lead_scoring_rules FOR UPDATE
  USING (org_id = get_user_org_id(auth.uid()) AND (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'manager')));

CREATE POLICY "Owners and managers can delete scoring rules"
  ON public.lead_scoring_rules FOR DELETE
  USING (org_id = get_user_org_id(auth.uid()) AND (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'manager')));

-- Create indexes for better performance
CREATE INDEX idx_email_campaigns_org_id ON public.email_campaigns(org_id);
CREATE INDEX idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX idx_sms_campaigns_org_id ON public.sms_campaigns(org_id);
CREATE INDEX idx_campaign_recipients_campaign_id ON public.campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_contact_id ON public.campaign_recipients(contact_id);
CREATE INDEX idx_email_templates_org_id ON public.email_templates(org_id);
CREATE INDEX idx_workflows_org_id ON public.workflows(org_id);
CREATE INDEX idx_workflows_is_active ON public.workflows(is_active);
CREATE INDEX idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX idx_lead_scoring_rules_org_id ON public.lead_scoring_rules(org_id);

-- Create triggers for updated_at
CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sms_campaigns_updated_at
  BEFORE UPDATE ON public.sms_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lead_scoring_rules_updated_at
  BEFORE UPDATE ON public.lead_scoring_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();