-- Create contacts table
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'customer', 'archived')),
  lead_stage TEXT CHECK (lead_stage IN ('new', 'contacted', 'proposal', 'closed')),
  lead_score INTEGER,
  tags TEXT[] DEFAULT '{}',
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  avatar_url TEXT,
  custom_fields JSONB DEFAULT '{}',
  last_contact_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX idx_contacts_org_id ON public.contacts(org_id);
CREATE INDEX idx_contacts_owner_id ON public.contacts(owner_id);
CREATE INDEX idx_contacts_status ON public.contacts(status);
CREATE INDEX idx_contacts_email ON public.contacts(email);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contacts
CREATE POLICY "Users can view contacts in their org"
  ON public.contacts
  FOR SELECT
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can create contacts in their org"
  ON public.contacts
  FOR INSERT
  WITH CHECK (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can update contacts in their org"
  ON public.contacts
  FOR UPDATE
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Owners and managers can delete contacts"
  ON public.contacts
  FOR DELETE
  USING (
    org_id = get_user_org_id(auth.uid()) 
    AND (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  );

-- Create contact timeline table
CREATE TABLE public.contact_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('note', 'call', 'email', 'task', 'deal_update')),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for timeline
CREATE INDEX idx_timeline_contact_id ON public.contact_timeline(contact_id);

-- Enable RLS for timeline
ALTER TABLE public.contact_timeline ENABLE ROW LEVEL SECURITY;

-- RLS Policies for timeline
CREATE POLICY "Users can view timeline for contacts in their org"
  ON public.contact_timeline
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = contact_timeline.contact_id
      AND contacts.org_id = get_user_org_id(auth.uid())
    )
  );

CREATE POLICY "Users can create timeline entries for contacts in their org"
  ON public.contact_timeline
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = contact_timeline.contact_id
      AND contacts.org_id = get_user_org_id(auth.uid())
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();