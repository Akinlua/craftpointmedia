-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Email notifications
  email_enabled BOOLEAN DEFAULT true,
  email_new_leads BOOLEAN DEFAULT true,
  email_deal_updates BOOLEAN DEFAULT true,
  email_task_reminders BOOLEAN DEFAULT true,
  email_meeting_reminders BOOLEAN DEFAULT true,
  email_invoice_updates BOOLEAN DEFAULT false,
  email_team_updates BOOLEAN DEFAULT true,
  email_weekly_digest BOOLEAN DEFAULT true,
  
  -- SMS notifications
  sms_enabled BOOLEAN DEFAULT false,
  sms_urgent_only BOOLEAN DEFAULT true,
  sms_task_reminders BOOLEAN DEFAULT false,
  sms_meeting_reminders BOOLEAN DEFAULT true,
  
  -- In-app notifications
  inapp_enabled BOOLEAN DEFAULT true,
  inapp_new_leads BOOLEAN DEFAULT true,
  inapp_deal_updates BOOLEAN DEFAULT true,
  inapp_task_reminders BOOLEAN DEFAULT true,
  inapp_meeting_reminders BOOLEAN DEFAULT true,
  inapp_invoice_updates BOOLEAN DEFAULT true,
  inapp_team_updates BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own notification preferences
CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notification preferences
CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own notification preferences
CREATE POLICY "Users can insert their own notification preferences"
  ON public.notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create default notification preferences when profile is created
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_notification_preferences_on_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_notification_preferences();