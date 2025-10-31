export type AutomationStatus = 'active' | 'inactive' | 'draft';

export type TriggerType = 
  | 'contact_created'
  | 'tag_added'
  | 'stage_changed'
  | 'form_submitted'
  | 'appointment_booked'
  | 'message_received'
  | 'payment_received'
  | 'date_time'
  | 'webhook';

export type ActionType = 
  | 'send_email'
  | 'send_sms'
  | 'add_tag'
  | 'remove_tag'
  | 'move_stage'
  | 'create_task'
  | 'wait'
  | 'condition'
  | 'webhook';

export interface AutomationNode {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  nodeType: TriggerType | ActionType;
  position: { x: number; y: number };
  data: {
    label: string;
    config: any; // specific config for each node type
  };
}

export interface AutomationEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  type?: string;
}

export interface Automation {
  id: string;
  name: string;
  description?: string;
  status: AutomationStatus;
  version: number;
  nodes: AutomationNode[];
  edges: AutomationEdge[];
  triggers: {
    type: TriggerType;
    config: any;
  }[];
  stats: {
    totalRuns: number;
    successfulRuns: number;
    lastRun?: string;
  };
  ownerId: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationFilters {
  status?: AutomationStatus;
  triggerType?: TriggerType;
  ownerId?: string;
  search?: string;
}

export interface AutomationRun {
  id: string;
  automationId: string;
  contactId: string;
  status: 'running' | 'completed' | 'failed' | 'stopped';
  currentNodeId?: string;
  logs: {
    nodeId: string;
    timestamp: string;
    status: 'success' | 'error' | 'skipped';
    message: string;
    data?: any;
  }[];
  startedAt: string;
  completedAt?: string;
}

export interface NodeTypeDefinition {
  type: TriggerType | ActionType;
  category: 'trigger' | 'action' | 'condition';
  label: string;
  description: string;
  icon: string;
  color: string;
  inputs: number;
  outputs: number;
  configSchema: any; // JSON schema for node configuration
}