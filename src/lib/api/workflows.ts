import { supabase } from '@/integrations/supabase/client';
import type { Workflow, WorkflowExecution, CreateWorkflowData } from '@/types/workflow';

const transformWorkflow = (row: any): Workflow => ({
  id: row.id,
  orgId: row.org_id,
  name: row.name,
  description: row.description,
  triggerType: row.trigger_type,
  triggerConfig: row.trigger_config,
  actions: row.actions || [],
  isActive: row.is_active,
  statistics: row.statistics,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const transformExecution = (row: any): WorkflowExecution => ({
  id: row.id,
  workflowId: row.workflow_id,
  triggerData: row.trigger_data,
  status: row.status,
  actionsLog: row.actions_log || [],
  errorMessage: row.error_message,
  startedAt: row.started_at,
  completedAt: row.completed_at,
  createdAt: row.created_at,
});

export const workflowsApi = {
  async getWorkflows(): Promise<Workflow[]> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformWorkflow);
  },

  async getWorkflowById(id: string): Promise<Workflow> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return transformWorkflow(data);
  },

  async createWorkflow(workflowData: CreateWorkflowData): Promise<Workflow> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { data, error } = await supabase
      .from('workflows')
      .insert([{
        org_id: profile.org_id,
        name: workflowData.name,
        description: workflowData.description,
        trigger_type: workflowData.triggerType,
        trigger_config: workflowData.triggerConfig || {},
        actions: (workflowData.actions as any) || [],
        created_by: user.id,
      }])
      .select()
      .single();

    if (error) throw error;
    return transformWorkflow(data);
  },

  async updateWorkflow(id: string, updates: Partial<CreateWorkflowData>): Promise<Workflow> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.triggerType !== undefined) updateData.trigger_type = updates.triggerType;
    if (updates.triggerConfig !== undefined) updateData.trigger_config = updates.triggerConfig;
    if (updates.actions !== undefined) updateData.actions = updates.actions;

    const { data, error } = await supabase
      .from('workflows')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformWorkflow(data);
  },

  async deleteWorkflow(id: string): Promise<void> {
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async toggleWorkflow(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('workflows')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) throw error;
  },

  async getWorkflowExecutions(workflowId: string): Promise<WorkflowExecution[]> {
    const { data, error } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data.map(transformExecution);
  },

  async testWorkflow(id: string): Promise<void> {
    const { error } = await supabase.functions.invoke('process-workflow', {
      body: { workflowId: id, testMode: true }
    });

    if (error) throw error;
  },
};
