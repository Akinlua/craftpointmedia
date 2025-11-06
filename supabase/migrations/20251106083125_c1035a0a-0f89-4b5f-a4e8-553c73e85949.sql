-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lead', 'deal', 'task', 'meeting', 'invoice', 'team', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_org_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_priority TEXT DEFAULT 'medium',
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    org_id,
    type,
    title,
    message,
    priority,
    action_url,
    metadata
  ) VALUES (
    p_user_id,
    p_org_id,
    p_type,
    p_title,
    p_message,
    p_priority,
    p_action_url,
    p_metadata
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Trigger function to notify team when new contact is created
CREATE OR REPLACE FUNCTION public.notify_new_contact()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
  v_contact_name TEXT;
BEGIN
  v_contact_name := NEW.first_name || ' ' || NEW.last_name;
  
  -- Notify all users in the org who have notifications enabled
  FOR v_user IN 
    SELECT p.id, p.org_id
    FROM profiles p
    JOIN notification_preferences np ON np.user_id = p.id
    WHERE p.org_id = NEW.org_id
    AND p.id != NEW.owner_id
    AND np.inapp_new_leads = true
    AND np.inapp_enabled = true
  LOOP
    PERFORM create_notification(
      v_user.id,
      v_user.org_id,
      'lead',
      'New Contact Added',
      'New contact "' || v_contact_name || '" was added by a team member',
      'medium',
      '/app/contacts/' || NEW.id,
      jsonb_build_object('contact_id', NEW.id, 'contact_name', v_contact_name)
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger function to notify when deal stage changes
CREATE OR REPLACE FUNCTION public.notify_deal_stage_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
BEGIN
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    -- Notify all users in the org who have deal update notifications enabled
    FOR v_user IN 
      SELECT p.id, p.org_id
      FROM profiles p
      JOIN notification_preferences np ON np.user_id = p.id
      WHERE p.org_id = NEW.org_id
      AND p.id != NEW.owner_id
      AND np.inapp_deal_updates = true
      AND np.inapp_enabled = true
    LOOP
      PERFORM create_notification(
        v_user.id,
        v_user.org_id,
        'deal',
        'Deal Stage Updated',
        'Deal "' || NEW.title || '" moved from ' || OLD.stage || ' to ' || NEW.stage,
        'medium',
        '/app/deals/' || NEW.id,
        jsonb_build_object(
          'deal_id', NEW.id,
          'deal_title', NEW.title,
          'old_stage', OLD.stage,
          'new_stage', NEW.stage
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger function to notify when task is assigned or due soon
CREATE OR REPLACE FUNCTION public.notify_task_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_assignee_prefs RECORD;
BEGIN
  -- Check if assignee changed or new task created
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.assignee_id IS DISTINCT FROM NEW.assignee_id)) THEN
    -- Check if assignee has task notifications enabled
    SELECT p.id, p.org_id, np.inapp_task_reminders, np.inapp_enabled
    INTO v_assignee_prefs
    FROM profiles p
    JOIN notification_preferences np ON np.user_id = p.id
    WHERE p.id = NEW.assignee_id;
    
    IF v_assignee_prefs.inapp_task_reminders AND v_assignee_prefs.inapp_enabled THEN
      PERFORM create_notification(
        NEW.assignee_id,
        NEW.org_id,
        'task',
        'New Task Assigned',
        'You have been assigned: "' || NEW.title || '"',
        NEW.priority::text,
        '/app/tasks',
        jsonb_build_object(
          'task_id', NEW.id,
          'task_title', NEW.title,
          'due_date', NEW.due_date
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER trigger_notify_new_contact
AFTER INSERT ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_contact();

CREATE TRIGGER trigger_notify_deal_stage_change
AFTER UPDATE ON public.deals
FOR EACH ROW
EXECUTE FUNCTION public.notify_deal_stage_change();

CREATE TRIGGER trigger_notify_task_assignment
AFTER INSERT OR UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.notify_task_assignment();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;