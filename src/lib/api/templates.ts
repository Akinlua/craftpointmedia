import { Template, TemplateFilters, MergeField } from '@/types/template';

// Mock data
const mockTemplates: Template[] = [
  {
    id: 'tpl-1',
    name: 'Welcome Email',
    type: 'email',
    status: 'published',
    subject: 'Welcome to {{org.name}}!',
    content: {
      body: 'Hi {{contact.firstName}}, welcome to our platform!',
      htmlBody: '<h1>Welcome {{contact.firstName}}!</h1><p>Thanks for joining {{org.name}}.</p>',
      design: { blocks: [] }
    },
    tags: ['welcome', 'onboarding'],
    isSystem: false,
    variables: ['contact.firstName', 'org.name'],
    ownerId: 'user-1',
    orgId: 'org-1',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'tpl-2',
    name: 'Product Launch SMS',
    type: 'sms',
    status: 'published',
    content: {
      body: 'Hi {{contact.firstName}}! New product: {{product.name}}. Check it out!'
    },
    tags: ['product', 'announcement'],
    isSystem: false,
    variables: ['contact.firstName', 'product.name'],
    ownerId: 'user-1',
    orgId: 'org-1',
    createdAt: '2024-01-05T14:00:00Z',
    updatedAt: '2024-01-05T14:00:00Z'
  },
  {
    id: 'tpl-3',
    name: 'Meeting Reminder',
    type: 'email',
    status: 'published',
    subject: 'Reminder: Meeting with {{deal.title}}',
    content: {
      body: 'Don\'t forget about your meeting tomorrow at {{appointment.time}}',
      htmlBody: '<p>Don\'t forget about your meeting tomorrow at <strong>{{appointment.time}}</strong></p>'
    },
    tags: ['reminder', 'appointment'],
    isSystem: true,
    variables: ['deal.title', 'appointment.time'],
    ownerId: 'system',
    orgId: 'org-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockMergeFields: MergeField[] = [
  { key: 'contact.firstName', label: 'First Name', example: 'John', category: 'contact' },
  { key: 'contact.lastName', label: 'Last Name', example: 'Doe', category: 'contact' },
  { key: 'contact.email', label: 'Email', example: 'john@example.com', category: 'contact' },
  { key: 'contact.phone', label: 'Phone', example: '+1234567890', category: 'contact' },
  { key: 'org.name', label: 'Organization Name', example: 'Acme Corp', category: 'org' },
  { key: 'org.website', label: 'Website', example: 'acme.com', category: 'org' },
  { key: 'deal.title', label: 'Deal Title', example: 'Q1 Contract', category: 'deal' },
  { key: 'deal.value', label: 'Deal Value', example: '$50,000', category: 'deal' },
  { key: 'product.name', label: 'Product Name', example: 'Pro Plan', category: 'custom' },
  { key: 'appointment.time', label: 'Appointment Time', example: '2:00 PM', category: 'custom' }
];

export const templatesApi = {
  getTemplates: async (filters?: TemplateFilters): Promise<{ templates: Template[]; total: number }> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let filtered = [...mockTemplates];
    
    if (filters?.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    if (filters?.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    if (filters?.tags?.length) {
      filtered = filtered.filter(t => 
        filters.tags!.some(tag => t.tags.includes(tag))
      );
    }
    if (filters?.search) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
        t.content.body.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    return { templates: filtered, total: filtered.length };
  },

  getTemplate: async (id: string): Promise<Template> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const template = mockTemplates.find(t => t.id === id);
    if (!template) throw new Error('Template not found');
    return template;
  },

  createTemplate: async (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const newTemplate: Template = {
      ...template,
      id: `tpl-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockTemplates.push(newTemplate);
    return newTemplate;
  },

  updateTemplate: async (id: string, updates: Partial<Template>): Promise<Template> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockTemplates.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Template not found');
    
    mockTemplates[index] = {
      ...mockTemplates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return mockTemplates[index];
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockTemplates.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Template not found');
    
    const template = mockTemplates[index];
    if (template.isSystem) {
      throw new Error('Cannot delete system template');
    }
    
    mockTemplates.splice(index, 1);
  },

  duplicateTemplate: async (id: string): Promise<Template> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const original = mockTemplates.find(t => t.id === id);
    if (!original) throw new Error('Template not found');
    
    const duplicate: Template = {
      ...original,
      id: `tpl-${Date.now()}`,
      name: `${original.name} (Copy)`,
      status: 'draft',
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockTemplates.push(duplicate);
    return duplicate;
  },

  getMergeFields: async (): Promise<MergeField[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockMergeFields;
  },

  validateTemplate: async (content: string): Promise<{ isValid: boolean; errors: string[] }> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const errors: string[] = [];
    const mergeFieldPattern = /\{\{([^}]+)\}\}/g;
    const matches = Array.from(content.matchAll(mergeFieldPattern));
    
    matches.forEach(match => {
      const field = match[1].trim();
      const validField = mockMergeFields.find(f => f.key === field);
      if (!validField) {
        errors.push(`Unknown merge field: {{${field}}}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};