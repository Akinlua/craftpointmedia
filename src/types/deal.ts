export type DealStage = 'new' | 'contacted' | 'proposal' | 'closed_won' | 'closed_lost';

export interface Deal {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: DealStage;
  stageId: string;
  probability?: number;
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  contactIds: string[];
  contacts: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  closeDate?: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
  description?: string;
  customFields?: Record<string, any>;
}

export interface DealStageConfig {
  id: string;
  name: string;
  type: DealStage;
  color: string;
  order: number;
}

export interface DealFilters {
  stage?: DealStage[];
  owner?: string[];
  valueRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    from: string;
    to: string;
  };
  search?: string;
}

export interface DealBulkAction {
  type: 'assign_owner' | 'change_stage' | 'delete' | 'export';
  data?: any;
}

export interface DealActivity {
  id: string;
  dealId: string;
  type: 'note' | 'stage_change' | 'value_change' | 'contact_added' | 'task_created' | 'email_sent';
  title: string;
  description?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface DealNote {
  id: string;
  dealId: string;
  content: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}