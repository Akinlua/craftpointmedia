export type TemplateType = 'email' | 'sms';
export type TemplateStatus = 'draft' | 'published';

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  status: TemplateStatus;
  subject?: string; // for email
  content: {
    body: string;
    htmlBody?: string; // for email
    design?: any; // drag-and-drop editor state
  };
  tags: string[];
  isSystem: boolean; // system templates can't be deleted
  previewUrl?: string;
  thumbnail?: string;
  variables: string[]; // list of merge fields used
  ownerId: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateFilters {
  type?: TemplateType;
  status?: TemplateStatus;
  tags?: string[];
  search?: string;
}

export interface MergeField {
  key: string;
  label: string;
  example: string;
  category: 'contact' | 'org' | 'deal' | 'custom';
}