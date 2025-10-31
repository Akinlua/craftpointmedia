export type ContactStatus = 'lead' | 'customer' | 'archived';
export type LeadStage = 'new' | 'contacted' | 'proposal' | 'closed';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  location?: string;
  status: ContactStatus;
  leadStage?: LeadStage;
  leadScore?: number;
  tags: string[];
  ownerId: string;
  ownerName: string;
  avatar?: string;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastContactAt?: string;
}

export interface ContactTimeline {
  id: string;
  contactId: string;
  type: 'note' | 'call' | 'email' | 'task' | 'deal_update';
  title: string;
  description?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface ContactFilters {
  status?: ContactStatus[];
  tags?: string[];
  location?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  search?: string;
}

export interface ContactBulkAction {
  type: 'add_tag' | 'remove_tag' | 'assign_owner' | 'export' | 'delete';
  data?: any;
}