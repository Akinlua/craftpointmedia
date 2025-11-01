-- Drop triggers first, then recreate functions with CASCADE
DROP TRIGGER IF EXISTS contacts_timeline_trigger ON public.contacts;
DROP TRIGGER IF EXISTS deals_timeline_trigger ON public.deals;
DROP TRIGGER IF EXISTS tasks_timeline_trigger ON public.tasks;

-- Drop old functions
DROP FUNCTION IF EXISTS public.create_contact_timeline() CASCADE;
DROP FUNCTION IF EXISTS public.create_deal_timeline() CASCADE;
DROP FUNCTION IF EXISTS public.create_task_timeline() CASCADE;

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION public.create_contact_timeline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
$$;

CREATE OR REPLACE FUNCTION public.create_deal_timeline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
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
$$;

CREATE OR REPLACE FUNCTION public.create_task_timeline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
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
$$;

-- Recreate triggers
CREATE TRIGGER contacts_timeline_trigger
  AFTER UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.create_contact_timeline();

CREATE TRIGGER deals_timeline_trigger
  AFTER UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.create_deal_timeline();

CREATE TRIGGER tasks_timeline_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.create_task_timeline();