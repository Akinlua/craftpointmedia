export type WorkflowTriggerType = 
  | 'contact_created'
  | 'deal_stage_change'
  | 'tag_added'
  | 'form_submitted'
  | 'time_based';

export type WorkflowActionType =
  | 'send_email'
  | 'send_sms'
  | 'add_tag'
  | 'create_task'
  | 'update_field'
  | 'wait'
  | 'condition';

export interface WorkflowAction {
  type: WorkflowActionType;
  config: Record<string, any>;
  order: number;
}

export interface WorkflowStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  lastExecutedAt?: string;
}

export interface Workflow {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  triggerType: WorkflowTriggerType;
  triggerConfig: Record<string, any>;
  actions: WorkflowAction[];
  isActive: boolean;
  statistics: WorkflowStats;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  triggerData: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  actionsLog: Record<string, any>[];
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface LeadScoringRule {
  id: string;
  orgId: string;
  name: string;
  conditionType: string;
  conditionConfig: Record<string, any>;
  points: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowData {
  name: string;
  description?: string;
  triggerType: WorkflowTriggerType;
  triggerConfig?: Record<string, any>;
  actions?: WorkflowAction[];
}

export interface CreateLeadScoringRuleData {
  name: string;
  conditionType: string;
  conditionConfig: Record<string, any>;
  points: number;
}

// For visual workflow builder
export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}
