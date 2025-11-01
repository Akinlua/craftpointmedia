-- Create timeline trigger functions
CREATE OR REPLACE FUNCTION public.create_contact_timeline()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create timeline for UPDATE and DELETE operations
  -- INSERT is handled by application logic
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.contact_timeline (
      contact_id,
      type,
      title,
      description,
      created_by,
      metadata
    ) VALUES (
      NEW.id,
      'note',
      'Contact updated',
      'Contact information was modified',
      NEW.owner_id,
      jsonb_build_object(
        'operation', TG_OP,
        'changes', jsonb_build_object(
          'old', row_to_json(OLD),
          'new', row_to_json(NEW)
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for contacts
DROP TRIGGER IF EXISTS contacts_timeline_trigger ON public.contacts;
CREATE TRIGGER contacts_timeline_trigger
AFTER UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.create_contact_timeline();

-- Create timeline trigger function for deals
CREATE OR REPLACE FUNCTION public.create_deal_timeline()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Check if stage changed
    IF OLD.stage IS DISTINCT FROM NEW.stage THEN
      INSERT INTO public.deal_activities (
        deal_id,
        type,
        title,
        description,
        created_by,
        metadata
      ) VALUES (
        NEW.id,
        'stage_change',
        'Deal stage changed',
        'Deal moved from ' || OLD.stage || ' to ' || NEW.stage,
        NEW.owner_id,
        jsonb_build_object(
          'old_stage', OLD.stage,
          'new_stage', NEW.stage,
          'timestamp', NOW()
        )
      );
    END IF;
    
    -- Check if value changed
    IF OLD.value IS DISTINCT FROM NEW.value THEN
      INSERT INTO public.deal_activities (
        deal_id,
        type,
        title,
        description,
        created_by,
        metadata
      ) VALUES (
        NEW.id,
        'value_change',
        'Deal value updated',
        'Deal value changed from ' || OLD.value || ' to ' || NEW.value,
        NEW.owner_id,
        jsonb_build_object(
          'old_value', OLD.value,
          'new_value', NEW.value,
          'currency', NEW.currency
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for deals
DROP TRIGGER IF EXISTS deals_timeline_trigger ON public.deals;
CREATE TRIGGER deals_timeline_trigger
AFTER UPDATE ON public.deals
FOR EACH ROW
EXECUTE FUNCTION public.create_deal_timeline();

-- Create timeline trigger function for tasks
CREATE OR REPLACE FUNCTION public.create_task_timeline()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Check if status changed to completed
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
      INSERT INTO public.contact_timeline (
        contact_id,
        type,
        title,
        description,
        created_by,
        metadata
      )
      SELECT
        NEW.related_id,
        'task',
        'Task completed',
        'Task "' || NEW.title || '" was marked as complete',
        NEW.assignee_id,
        jsonb_build_object(
          'task_id', NEW.id,
          'task_title', NEW.title,
          'completed_at', NEW.completed_at
        )
      WHERE NEW.related_type = 'contact' AND NEW.related_id IS NOT NULL;
      
      -- Also create deal activity if task is related to a deal
      INSERT INTO public.deal_activities (
        deal_id,
        type,
        title,
        description,
        created_by,
        metadata
      )
      SELECT
        NEW.related_id,
        'task_created',
        'Task completed',
        'Task "' || NEW.title || '" was marked as complete',
        NEW.assignee_id,
        jsonb_build_object(
          'task_id', NEW.id,
          'task_title', NEW.title,
          'completed_at', NEW.completed_at
        )
      WHERE NEW.related_type = 'deal' AND NEW.related_id IS NOT NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for tasks
DROP TRIGGER IF EXISTS tasks_timeline_trigger ON public.tasks;
CREATE TRIGGER tasks_timeline_trigger
AFTER UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.create_task_timeline();

-- Create full-text search index for contacts
CREATE INDEX IF NOT EXISTS idx_contacts_search 
ON public.contacts 
USING gin(to_tsvector('english', 
  coalesce(first_name, '') || ' ' || 
  coalesce(last_name, '') || ' ' || 
  coalesce(email, '') || ' ' || 
  coalesce(company, '')
));

-- Add indexes for better timeline query performance
CREATE INDEX IF NOT EXISTS idx_contact_timeline_contact_id ON public.contact_timeline(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_timeline_created_at ON public.contact_timeline(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deal_activities_deal_id ON public.deal_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_activities_created_at ON public.deal_activities(created_at DESC);