-- Create deals table
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  value NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  stage TEXT NOT NULL DEFAULT 'new',
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  owner_id UUID REFERENCES public.profiles(id),
  close_date DATE,
  description TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE
);

-- Create deal_contacts junction table for many-to-many relationship
CREATE TABLE public.deal_contacts (
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (deal_id, contact_id)
);

-- Create deal_activities table for tracking changes and notes
CREATE TABLE public.deal_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_deals_org_id ON public.deals(org_id);
CREATE INDEX idx_deals_owner_id ON public.deals(owner_id);
CREATE INDEX idx_deals_stage ON public.deals(stage);
CREATE INDEX idx_deals_close_date ON public.deals(close_date);
CREATE INDEX idx_deal_contacts_deal_id ON public.deal_contacts(deal_id);
CREATE INDEX idx_deal_contacts_contact_id ON public.deal_contacts(contact_id);
CREATE INDEX idx_deal_activities_deal_id ON public.deal_activities(deal_id);

-- Enable Row Level Security
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deals
CREATE POLICY "Users can view deals in their org"
  ON public.deals FOR SELECT
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can create deals in their org"
  ON public.deals FOR INSERT
  WITH CHECK (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can update deals in their org"
  ON public.deals FOR UPDATE
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Owners and managers can delete deals"
  ON public.deals FOR DELETE
  USING (
    org_id = get_user_org_id(auth.uid()) AND 
    (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  );

-- RLS Policies for deal_contacts
CREATE POLICY "Users can view deal contacts in their org"
  ON public.deal_contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.deals 
      WHERE deals.id = deal_contacts.deal_id 
      AND deals.org_id = get_user_org_id(auth.uid())
    )
  );

CREATE POLICY "Users can manage deal contacts in their org"
  ON public.deal_contacts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.deals 
      WHERE deals.id = deal_contacts.deal_id 
      AND deals.org_id = get_user_org_id(auth.uid())
    )
  );

-- RLS Policies for deal_activities
CREATE POLICY "Users can view deal activities in their org"
  ON public.deal_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.deals 
      WHERE deals.id = deal_activities.deal_id 
      AND deals.org_id = get_user_org_id(auth.uid())
    )
  );

CREATE POLICY "Users can create deal activities in their org"
  ON public.deal_activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.deals 
      WHERE deals.id = deal_activities.deal_id 
      AND deals.org_id = get_user_org_id(auth.uid())
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();