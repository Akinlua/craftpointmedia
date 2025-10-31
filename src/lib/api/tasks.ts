import type { Task, TaskFilters, CreateTaskData, UpdateTaskData } from '@/types/task';
import { supabase } from '@/integrations/supabase/client';

// Helper to transform DB task to frontend Task type
const transformTask = (dbTask: any, assigneeProfile?: any, creatorProfile?: any, relatedInfo?: any): Task => {
  const isOverdue = new Date(dbTask.due_date) < new Date() && dbTask.status !== 'completed';
  
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    status: isOverdue ? 'overdue' : dbTask.status,
    priority: dbTask.priority,
    dueDate: dbTask.due_date,
    completedAt: dbTask.completed_at,
    assigneeId: dbTask.assignee_id,
    assigneeName: assigneeProfile ? `${assigneeProfile.first_name} ${assigneeProfile.last_name}` : 'Unassigned',
    assigneeAvatar: assigneeProfile?.avatar_url,
    createdBy: dbTask.created_by,
    createdByName: creatorProfile ? `${creatorProfile.first_name} ${creatorProfile.last_name}` : 'Unknown',
    orgId: dbTask.org_id,
    relatedType: dbTask.related_type,
    relatedId: dbTask.related_id,
    relatedTitle: relatedInfo?.title,
    reminderTime: dbTask.reminder_time,
    reminderSent: dbTask.reminder_sent,
    createdAt: dbTask.created_at,
    updatedAt: dbTask.updated_at
  };
};

// Helper to transform Task to DB format
const transformToDb = (task: Partial<CreateTaskData | UpdateTaskData>) => ({
  title: task.title,
  description: task.description,
  status: (task as UpdateTaskData).status,
  priority: task.priority,
  due_date: task.dueDate,
  completed_at: (task as UpdateTaskData).completedAt,
  assignee_id: task.assigneeId,
  related_type: task.relatedType,
  related_id: task.relatedId,
  reminder_time: task.reminderTime
});

export const tasksApi = {
  // Get tasks with filters
  getTasks: async (filters?: TaskFilters): Promise<Task[]> => {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!assignee_id(first_name, last_name, avatar_url),
        creator:profiles!created_by(first_name, last_name, avatar_url)
      `);

    // Apply filters
    if (filters?.status?.length) {
      query = query.in('status', filters.status.filter(s => s !== 'overdue'));
    }

    if (filters?.assigneeId?.length) {
      query = query.in('assignee_id', filters.assigneeId);
    }

    if (filters?.relatedType?.length) {
      query = query.in('related_type', filters.relatedType);
    }

    if (filters?.dueDateFrom) {
      query = query.gte('due_date', filters.dueDateFrom);
    }

    if (filters?.dueDateTo) {
      query = query.lte('due_date', filters.dueDateTo);
    }

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    query = query.order('due_date', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    // Fetch related info for tasks
    const tasks = await Promise.all((data || []).map(async (task) => {
      let relatedInfo = null;
      
      if (task.related_type === 'contact' && task.related_id) {
        const { data: contact } = await supabase
          .from('contacts')
          .select('first_name, last_name')
          .eq('id', task.related_id)
          .maybeSingle();
        
        if (contact) {
          relatedInfo = { title: `${contact.first_name} ${contact.last_name}` };
        }
      } else if (task.related_type === 'deal' && task.related_id) {
        const { data: deal } = await supabase
          .from('deals')
          .select('title')
          .eq('id', task.related_id)
          .maybeSingle();
        
        if (deal) {
          relatedInfo = { title: deal.title };
        }
      }

      return transformTask(task, task.assignee, task.creator, relatedInfo);
    }));

    return tasks;
  },

  // Create task
  createTask: async (data: CreateTaskData): Promise<Task> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', session.session.user.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const dbTask = {
      ...transformToDb(data),
      org_id: profile.org_id,
      created_by: session.session.user.id
    };

    const { data: newTask, error } = await supabase
      .from('tasks')
      .insert(dbTask)
      .select(`
        *,
        assignee:profiles!assignee_id(first_name, last_name, avatar_url),
        creator:profiles!created_by(first_name, last_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    return transformTask(newTask, newTask.assignee, newTask.creator);
  },

  // Update task
  updateTask: async (id: string, data: UpdateTaskData): Promise<Task> => {
    const dbUpdates = transformToDb(data);

    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id)
      .select(`
        *,
        assignee:profiles!assignee_id(first_name, last_name, avatar_url),
        creator:profiles!created_by(first_name, last_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    return transformTask(updatedTask, updatedTask.assignee, updatedTask.creator);
  },

  // Delete task
  deleteTask: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get task by ID
  getTask: async (id: string): Promise<Task | null> => {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!assignee_id(first_name, last_name, avatar_url),
        creator:profiles!created_by(first_name, last_name, avatar_url)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return transformTask(data, data.assignee, data.creator);
  },

  // Get users for assignee selection
  getUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .order('first_name');

    if (error) throw error;

    return (data || []).map(profile => ({
      id: profile.id,
      name: `${profile.first_name} ${profile.last_name}`,
      avatar: profile.avatar_url,
      role: 'staff' // Role would come from user_roles if needed
    }));
  }
};
